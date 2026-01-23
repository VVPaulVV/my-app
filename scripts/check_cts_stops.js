
const API_TOKEN = '4f4515f9-e0dd-4758-b372-a546d8729fbf';
const BASE_URL = 'https://api.cts-strasbourg.eu/v1/siri/2.0';

const getAuthHeader = () => {
    const credentials = `${API_TOKEN}:`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
};

async function checkStops() {
    try {
        const response = await fetch(`${BASE_URL}/stoppoints-discovery`, {
            headers: {
                'Authorization': getAuthHeader(),
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            console.error('Error:', response.status, await response.text());
            return;
        }

        const data = await response.json();
        // Log first 2 stops to see structure
        const stops = data?.StopPointsDiscoveryResponse?.AnnotatedStopPointRef || [];
        console.log('Stops count:', stops.length);
        console.log('First 2 stops:', JSON.stringify(stops.slice(0, 2), null, 2));
    } catch (e) {
        console.error('Failed:', e);
    }
}

checkStops();
