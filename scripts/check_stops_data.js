
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
        const stops = data?.StopPointsDiscoveryResponse?.AnnotatedStopPointRef || [];

        console.log(`Total Stops: ${stops.length}`);

        // Check if any stop has "Lines" property
        const hasLines = stops.some(s => s.Lines);
        console.log(`Has Lines property: ${hasLines}`);

        if (stops.length > 0) {
            console.log('Sample Stop:', JSON.stringify(stops[0], null, 2));
        }
    } catch (e) {
        console.error('Failed:', e);
    }
}

checkStops();
