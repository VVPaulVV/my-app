export interface Coordinate {
    latitude: number;
    longitude: number;
}

/**
 * Projects a lat/lon to a cartesian approximation (meters) relative to a reference point.
 */
function project(coord: Coordinate, ref: Coordinate): { x: number; y: number } {
    const latRad = (ref.latitude * Math.PI) / 180;
    const METERS_PER_LAT = 111132;
    const METERS_PER_LON = 111132 * Math.cos(latRad);

    const y = (coord.latitude - ref.latitude) * METERS_PER_LAT;
    const x = (coord.longitude - ref.longitude) * METERS_PER_LON;
    return { x, y };
}

/**
 * Unprojects a cartesian point back to lat/lon using the same reference.
 */
function unproject(point: { x: number; y: number }, ref: Coordinate): Coordinate {
    const latRad = (ref.latitude * Math.PI) / 180;
    const METERS_PER_LAT = 111132;
    const METERS_PER_LON = 111132 * Math.cos(latRad);

    const latitude = ref.latitude + point.y / METERS_PER_LAT;
    const longitude = ref.longitude + point.x / METERS_PER_LON;
    return { latitude, longitude };
}

/**
 * Offset a polyline by a certain distance in meters.
 * Positive offset is to the right of the path, negative to the left.
 */
export function offsetPolyline(coordinates: Coordinate[], offsetMeters: number): Coordinate[] {
    if (coordinates.length < 2 || offsetMeters === 0) {
        return coordinates;
    }

    const ref = coordinates[0];
    const points = coordinates.map(c => project(c, ref));
    const offsetPoints: { x: number; y: number }[] = [];

    for (let i = 0; i < points.length; i++) {
        const curr = points[i];

        // Vectors for adjacent segments
        let vIn: { x: number; y: number } | null = null;
        let vOut: { x: number; y: number } | null = null;

        if (i > 0) {
            const prev = points[i - 1];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) vIn = { x: dx / len, y: dy / len };
        }

        if (i < points.length - 1) {
            const next = points[i + 1];
            const dx = next.x - curr.x;
            const dy = next.y - curr.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) vOut = { x: dx / len, y: dy / len };
        }

        // Calculate normal vector
        let nx = 0;
        let ny = 0;

        if (vIn && vOut) {
            // Interior point: average turning normal
            // Tangent roughly average of vIn and vOut
            const tx = vIn.x + vOut.x;
            const ty = vIn.y + vOut.y;
            // Normal is perpendicular to tangent (-ty, tx)
            // But checking orientation...
            // Standard approach: Offset is sum of offset vectors of segments / sin(alpha/2)?
            // Creating a simple miter join logic

            // Simple visual approach: average the segment normals
            // Normal of In: (-vIn.y, vIn.x) (Right side)
            // Normal of Out: (-vOut.y, vOut.x) (Right side)

            const nInX = -vIn.y;
            const nInY = vIn.x;

            const nOutX = -vOut.y;
            const nOutY = vOut.x;

            // Average normal
            let mx = nInX + nOutX;
            let my = nInY + nOutY;
            const mLen = Math.sqrt(mx * mx + my * my);

            if (mLen > 0.1) { // Avoid degenerate cases
                nx = mx / mLen;
                ny = my / mLen;
            } else {
                // 180 degree turn or similar? Use incoming
                nx = nInX;
                ny = nInY;
            }

        } else if (vOut) {
            // Start point
            nx = -vOut.y;
            ny = vOut.x;
        } else if (vIn) {
            // End point
            nx = -vIn.y;
            ny = vIn.x;
        }

        offsetPoints.push({
            x: curr.x + nx * offsetMeters,
            y: curr.y + ny * offsetMeters
        });
    }

    return offsetPoints.map(p => unproject(p, ref));
}

/**
 * Converts an array of Coordinate objects to a GeoJSON LineString geometry.
 */
export function toGeoJSONLineString(coordinates: Coordinate[]) {
    return {
        type: 'LineString' as const,
        coordinates: coordinates.map(c => [c.longitude, c.latitude]),
    };
}
