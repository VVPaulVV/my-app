
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.resolve(__dirname, '../temp_gtfs');
const OUTPUT_FILE = path.resolve(__dirname, '../data/transport_stops.ts');

const INTERESTING_LINES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function parseCSV(content) {
    const lines = content.toString().split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = [];
        let inQuote = false;
        let currentPart = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentPart);
                currentPart = '';
            } else {
                currentPart += char;
            }
        }
        values.push(currentPart);

        const obj = {};
        header.forEach((h, i) => {
            let val = values[i]?.trim().replace(/^"|"$/g, '');
            obj[h] = val;
        });
        return obj;
    });
}

function getRouteType(gtfsType) {
    if (gtfsType == '0') return 'tram';
    return 'bus';
}

function getRouteColor(shortName) {
    const colors = {
        'A': '#E10D19',
        'B': '#0099CC',
        'C': '#F68002',
        'D': '#007934',
        'E': '#660099',
        'F': '#8CC63E',
        'G': '#FFCC00',
        'H': '#922b3e'
    };
    return colors[shortName] || '#000000';
}

async function main() {
    if (!fs.existsSync(TEMP_DIR)) {
        console.error('GTFS data not found. Run update_transport_data.js first? Or we can assume raw files exist if you ran it recently.');
        return;
    }

    console.log('Reading GTFS files...');
    const routes = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'routes.txt')));
    const trips = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'trips.txt'))); // trip_id, route_id
    const stops = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'stops.txt'))); // stop_id, stop_name, stop_lat, stop_lon

    // We only need mapping stop -> lines
    // But direct link is stop -> stop_time -> trip -> route
    // This is expensive to scan stop_times (~million rows).
    // Let's try to optimize.

    // 1. Identify Interesting Route IDs
    const interestingRouteIds = new Set();
    const routeIdToShortName = {};
    routes.forEach(r => {
        if (INTERESTING_LINES.includes(r.route_short_name)) {
            interestingRouteIds.add(r.route_id);
            routeIdToShortName[r.route_id] = r.route_short_name;
        }
    });

    console.log(`Found ${interestingRouteIds.size} interesting routes.`);

    // 2. Identify Trips for these routes
    const interestingTripIds = new Set();
    const tripIdToRouteId = {};
    trips.forEach(t => {
        if (interestingRouteIds.has(t.route_id)) {
            interestingTripIds.add(t.trip_id);
            tripIdToRouteId[t.trip_id] = t.route_id;
        }
    });

    console.log(`Found ${interestingTripIds.size} interesting trips.`);

    // 3. Scan stop_times to find stops used by these trips
    console.log('Scanning stop_times...');
    const stopTimesContent = fs.readFileSync(path.join(TEMP_DIR, 'stop_times.txt'));
    const stopTimesLines = stopTimesContent.toString().split(/\r?\n/);

    // Header check
    const header = stopTimesLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const tripIdx = header.indexOf('trip_id');
    const stopIdx = header.indexOf('stop_id');

    const stopToLines = {}; // stop_id -> Set(shortName)

    for (let i = 1; i < stopTimesLines.length; i++) {
        const line = stopTimesLines[i];
        if (!line.trim()) continue;
        const vals = line.split(','); // Simplified split for speed, ids usually safe
        const tripId = vals[tripIdx]; // simple check

        if (interestingTripIds.has(tripId)) {
            const stopId = vals[stopIdx];
            const routeId = tripIdToRouteId[tripId];
            const shortName = routeIdToShortName[routeId];

            if (!stopToLines[stopId]) stopToLines[stopId] = new Set();
            stopToLines[stopId].add(shortName);
        }
    }

    console.log(`Found ${Object.keys(stopToLines).length} stops serving interesting lines.`);

    // 4. Build Stop GeoJSONs
    const stopFeatures = [];
    const processedStopNames = new Set(); // Dedup by name/location roughly?
    // GTFS often has per-platform stops (Stop A, Stop B).
    // We want to group them into a single "Station" on the map if possible, 
    // OR just show all and let zoom handle it. 
    // If they share exactly same name, maybe grouping is better?
    // Actually, distinct pins for platforms are fine at high zoom, but messy at low zoom.
    // Let's group by Name for simplified view?
    // Grouping by Name + roughly same location.

    const stations = {}; // Name -> { latSum, lonSum, count, lines: Set }

    // Manual adjustments for specific stations (Name matching)
    // [lon_offset, lat_offset]
    const MANUAL_OFFSETS = {
        'Etoile Bourse': [-0.000065, 0] // Move left slightly
    };

    stops.forEach(s => {
        if (stopToLines[s.stop_id]) {
            const name = s.stop_name;
            if (!stations[name]) {
                stations[name] = {
                    latSum: 0,
                    lonSum: 0,
                    count: 0,
                    lines: new Set()
                };
            }
            stations[name].latSum += parseFloat(s.stop_lat);
            stations[name].lonSum += parseFloat(s.stop_lon);
            stations[name].count++;
            stopToLines[s.stop_id].forEach(l => stations[name].lines.add(l));
        }
    });

    for (const [name, data] of Object.entries(stations)) {
        let lat = data.latSum / data.count;
        let lon = data.lonSum / data.count;

        if (MANUAL_OFFSETS[name]) {
            lon += MANUAL_OFFSETS[name][0];
            lat += MANUAL_OFFSETS[name][1];
            console.log(`Applied manual offset to ${name}`);
        }

        const lines = Array.from(data.lines).sort();

        stopFeatures.push({
            type: 'Feature',
            id: name, // Feature ID
            properties: {
                name: name,
                lines: lines,
                uniqueId: `STOP_${name.replace(/\s+/g, '_')}`
            },
            geometry: {
                type: 'Point',
                coordinates: [lon, lat]
            }
        });
    }

    const fileContent = `/**
 * AUTO-GENERATED FILE FROM GTFS DATA
 * Generated by generate_stops.js
 */

export const TRANSPORT_STOPS = {
    type: 'FeatureCollection',
    features: ${JSON.stringify(stopFeatures, null, 4)}
};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Generated ${OUTPUT_FILE} with ${stopFeatures.length} stations.`);
}

main();
