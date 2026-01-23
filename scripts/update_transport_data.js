
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/*
 * Script to download and process CTS GTFS Data
 * 
 * Since CTS GTFS lacks shapes.txt (surprising but confirmed), we reconstruct geometries
 * by chaining stop locations from stop_times.txt for each trip.
 * 
 * We target lines A, B, C, D, E, F (Trams) and G, H (BHNS).
 */

const ZIP_URL = 'https://opendata.cts-strasbourg.eu/google_transit.zip';
const TEMP_DIR = path.resolve(__dirname, '../temp_gtfs');
const OUTPUT_FILE = path.resolve(__dirname, '../data/transport_data_generated.ts');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

async function downloadFile(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
}

function parseCSV(content) {
    // Split by line
    const lines = content.toString().split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    // Parse rows
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
            let val = values[i]?.trim().replace(/^"|"$/g, ''); // Remove outer quotes
            obj[h] = val;
        });
        return obj;
    });
}

async function main() {
    console.log('Downloading GTFS...');
    const zipPath = path.join(TEMP_DIR, 'google_transit.zip');

    // Download if size is 0 or missing
    if (!fs.existsSync(zipPath) || fs.statSync(zipPath).size === 0) {
        await downloadFile(ZIP_URL, zipPath);
    } else {
        console.log('Using existing zip.');
    }

    console.log('Unzipping...');
    execSync(`unzip -o ${zipPath} -d ${TEMP_DIR}`);

    console.log('Parsing GTFS files...');
    const routes = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'routes.txt')));
    const trips = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'trips.txt')));
    const stops = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'stops.txt')));

    console.log('Reading stop_times (this is large, ~10-20MB)...');
    const stopTimes = parseCSV(fs.readFileSync(path.join(TEMP_DIR, 'stop_times.txt')));

    // 1. Map stops
    console.log('Indexing stops...');
    const stopMap = {}; // stop_id -> [lon, lat]
    stops.forEach(s => {
        const lat = parseFloat(s.stop_lat);
        const lon = parseFloat(s.stop_lon);
        if (!isNaN(lat) && !isNaN(lon)) {
            stopMap[s.stop_id] = [lon, lat];
        }
    });

    // 2. Map trip -> sequence of stops
    console.log('Indexing trip stop sequences...');
    const tripStops = {}; // trip_id -> [{stop_id, seq}]
    stopTimes.forEach(st => {
        if (!tripStops[st.trip_id]) tripStops[st.trip_id] = [];
        tripStops[st.trip_id].push({
            id: st.stop_id,
            seq: parseInt(st.stop_sequence)
        });
    });

    // Sort sequences
    Object.values(tripStops).forEach(list => list.sort((a, b) => a.seq - b.seq));

    // 3. Group trips by route
    console.log('Grouping trips by route...');
    const routeTrips = {}; // route_id -> [trip_id, trip_id...]
    trips.forEach(t => {
        if (!routeTrips[t.route_id]) routeTrips[t.route_id] = [];
        routeTrips[t.route_id].push(t.trip_id);
    });

    // 4. Build Lines
    const TransportLines = [];
    const INTERESTING_LINES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Helper to identify type
    const getRouteType = (gtfsType) => {
        if (gtfsType == '0') return 'tram';
        return 'bus';
    };

    console.log('Building Geometries...');

    // Map shortName -> { properties, coordinates: [], type }
    const mergedLines = new Map();

    for (const route of routes) {
        if (!INTERESTING_LINES.includes(route.route_short_name)) continue;

        console.log(`Processing Line ${route.route_short_name} (ID: ${route.route_id})...`);

        const rTrips = routeTrips[route.route_id];
        if (!rTrips) continue;

        const uniqueSignatures = new Set();
        const geometries = [];

        for (const tid of rTrips) {
            const sequenceObj = tripStops[tid];
            if (!sequenceObj || sequenceObj.length < 2) continue;

            const signature = sequenceObj.map(s => s.id).join(',');

            if (!uniqueSignatures.has(signature)) {
                uniqueSignatures.add(signature);
                const coords = sequenceObj.map(s => stopMap[s.id]).filter(c => c);
                if (coords.length > 1) {
                    geometries.push(coords);
                }
            }
        }

        if (geometries.length === 0) {
            console.warn(`No geometry found for ${route.route_short_name}`);
            continue;
        }

        // Merge logic
        const shortName = route.route_short_name;
        if (!mergedLines.has(shortName)) {
            mergedLines.set(shortName, {
                route_short_name: shortName,
                route_long_name: route.route_long_name,
                route_color: route.route_color,
                route_type: route.route_type,
                coordinates: []
            });
        }
        // Append geometries
        mergedLines.get(shortName).coordinates.push(...geometries);
    }

    // Convert to output
    for (const [shortName, data] of mergedLines) {
        const geoJson = {
            type: 'Feature',
            properties: {
                id: data.route_short_name,
                name: data.route_long_name,
                color: `#${data.route_color}`,
            },
            geometry: {
                type: 'MultiLineString',
                coordinates: data.coordinates
            }
        };

        const type = getRouteType(data.route_type);
        const id = type === 'tram' ? `TRAM_${shortName}` : `BUS_${shortName}`;

        TransportLines.push({
            id: id,
            type: type,
            name: `Ligne ${shortName}`,
            trajectory: data.route_long_name,
            color: `#${data.route_color}`,
            geoJson: geoJson
        });
    }

    TransportLines.sort((a, b) => a.id.localeCompare(b.id));

    const fileContent = `/**
 * AUTO-GENERATED FILE FROM CTS GTFS DATA
 * Generated by update_transport_data.js
 */

export interface TransportLine {
    id: string;
    type: 'tram' | 'bus';
    name: string;
    trajectory: string;
    color: string;
    path?: any[]; // Legacy support but unused if geoJson is present
    geoJson?: any; // Feature<MultiLineString>
}

export const TRANSPORT_LINES: TransportLine[] = ${JSON.stringify(TransportLines, null, 4)};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Generated ${OUTPUT_FILE} with ${TransportLines.length} lines.`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
