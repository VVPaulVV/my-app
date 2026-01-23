
const API_TOKEN = '4f4515f9-e0dd-4758-b372-a546d8729fbf';
const BASE_URL = 'https://api.cts-strasbourg.eu/v1/siri/2.0';

// Simple Base64 implementation if Buffer is not available (though it usually is in recent RN with some setups, but safe is better)
const toBase64 = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    for (; i < str.length;) {
        const char1 = str.charCodeAt(i++);
        const char2 = str.charCodeAt(i++);
        const char3 = str.charCodeAt(i++);

        const enc1 = char1 >> 2;
        const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
        let enc3 = ((char2 & 15) << 2) | (char3 >> 6);
        let enc4 = char3 & 63;

        if (isNaN(char2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(char3)) {
            enc4 = 64;
        }

        output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
    }
    return output;
};

const getAuthHeader = () => {
    // Basic Auth: username is token, password is empty
    const credentials = `${API_TOKEN}:`;
    // In many RN environments, btoa is available. If not, use custom.
    const encoded = typeof btoa === 'function' ? btoa(credentials) : toBase64(credentials);
    return `Basic ${encoded}`;
};

export interface StopPoint {
    StopPointName: string;
    StopCode: string;
    StopPointRef: string;
    Location: {
        Longitude: number;
        Latitude: number;
    };
    Lines?: string[];
}

export interface VehicleJourney {
    LineRef: string;
    DirectionRef: string; // Destination
    DatedVehicleJourneyRef: string;
    PublishedLineName: string;
    DestinationName: string;
    MonitoredCall: {
        StopPointRef: string;
        ExpectedArrivalTime: string; // ISO Date
        DestinationDisplay: string;
    };
}

class CTSService {
    private async request(endpoint: string, params: Record<string, string> = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;

        console.log(`[CTSService] Requesting ${url}`);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader(),
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`[CTSService] Error ${response.status}: ${text}`);
                throw new Error(`CTS API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('[CTSService] Request Failed:', error);
            throw error;
        }
    }

    /**
     * Get list of all stop points
     */
    async getStopPointsDiscovery(): Promise<StopPoint[]> {
        // Endpoint: stop-points-discovery (or similar, widely varies in SIRI Lite impls, usually stopt-points-discovery)
        // User said: "Stoppoints-discovery"
        const data = await this.request('stoppoints-discovery');
        // Structure depends on API, usually:
        // { StopPointsDiscoveryResponse: { AnnotatedStopPointRef: [...] } }
        // We will return raw or mapped if we knew exact structure. 
        // Returning raw mostly but let's try to map if standard SIRI.
        return data?.StopPointsDiscoveryResponse?.AnnotatedStopPointRef?.map((item: any) => ({
            StopPointName: item.StopName,
            StopPointRef: item.StopPointRef,
            Location: item.Location,
            Lines: item.Lines
        })) || [];
    }

    /**
     * Get real-time departures for a specific stop
     * @param stopPointRef The ID of the stop (e.g. from discovery)
     */
    async getStopMonitoring(stopPointRef: string): Promise<VehicleJourney[]> {
        // User said: "Stop-monitoring"
        // SIRI Lite: stop-monitoring?MonitoringRef=...
        const data = await this.request('stop-monitoring', { MonitoringRef: stopPointRef });

        // Expected Structure:
        // { ServiceDelivery: { StopMonitoringDelivery: [ { MonitoredStopVisit: [...] } ] } }
        const visits = data?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];

        return visits.map((visit: any) => ({
            LineRef: visit.MonitoredVehicleJourney.LineRef,
            DirectionRef: visit.MonitoredVehicleJourney.DirectionRef,
            DatedVehicleJourneyRef: visit.MonitoredVehicleJourney.DatedVehicleJourneyRef,
            PublishedLineName: visit.MonitoredVehicleJourney.PublishedLineName,
            DestinationName: visit.MonitoredVehicleJourney.DestinationName,
            MonitoredCall: visit.MonitoredVehicleJourney.MonitoredCall
        }));
    }

    /**
     * Get list of lines
     */
    async getLinesDiscovery() {
        // User said: "Lines-discovery"
        return await this.request('lines-discovery');
    }

    /**
     * Get P+R Real time data
     */
    async getParkAndRide() {
        // User said: "Park-and-ride"
        // Might be park-and-ride endpoint
        return await this.request('park-and-ride');
    }
}

export const ctsService = new CTSService();