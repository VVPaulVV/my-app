
const API_TOKEN = '4f4515f9-e0dd-4758-b372-a546d8729fbf';
const BASE_URL = 'https://api.cts-strasbourg.eu/v1/siri/2.0';

const getAuthHeader = () => {
    const credentials = `${API_TOKEN}:`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
};

async function checkLines() {
    try {
        const response = await fetch(`${BASE_URL}/lines-discovery`, {
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
        console.log('Response Structure:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed:', e);
    }
}

checkLines();
