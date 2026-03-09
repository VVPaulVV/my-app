export interface EmergencyInfo {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    content: {
        label: string;
        value: string;
        action?: string;
    }[];
    translations?: {
        [key: string]: {
            title?: string;
            description?: string;
            content?: {
                label: string;
                value: string;
            }[];
        };
    };
}

export const EMERGENCY_DATA: EmergencyInfo[] = [
    {
        id: 'emergency_numbers',
        title: 'Emergency Numbers',
        description: 'Important contacts for immediate help',
        icon: 'phone.fill',
        color: '#FF4B4B',
        content: [
            { label: 'SAMU (Medical)', value: '15', action: 'tel:15' },
            { label: 'Police', value: '17', action: 'tel:17' },
            { label: 'Fire Brigade', value: '18', action: 'tel:18' },
            { label: 'European Emergency', value: '112', action: 'tel:112' },
            { label: 'Deaf/Hard of Hearing', value: '114', action: 'smsto:114' },
            { label: 'Poison Control', value: '+33 3 88 37 37 37', action: 'tel:+33388373737' },
        ],
        translations: {
            fr: {
                title: 'Numéros d\'Urgence',
                description: 'Contacts importants pour une aide immédiate',
                content: [
                    { label: 'SAMU', value: '15' },
                    { label: 'Police', value: '17' },
                    { label: 'Pompiers', value: '18' },
                    { label: 'Urgence Européenne', value: '112' },
                    { label: 'Urgence Sourds/Malent.', value: '114' },
                    { label: 'Centre Antipoison', value: '03 88 37 37 37' },
                ]
            },
            tr: {
                title: 'Acil Numaralar',
                description: 'Acil yardım için önemli numaralar',
                content: [
                    { label: 'SAMU (Tıbbi Acil)', value: '15' },
                    { label: 'Polis', value: '17' },
                    { label: 'İtfaiye', value: '18' },
                    { label: 'Avrupa Acil Hattı', value: '112' },
                    { label: 'İşitme Engelliler', value: '114' },
                    { label: 'Zehir Danışma', value: '+33 3 88 37 37 37' },
                ]
            }
        }
    },
    {
        id: 'hopital_civil',
        title: 'Hôpital Civil',
        description: 'Main hospital in the city center',
        icon: 'building.2.fill',
        color: '#4B7BFF',
        content: [
            { label: 'Address', value: '1 Place de l\'Hôpital, 67000 Strasbourg' },
            { label: 'Phone', value: '+33 3 88 12 80 00', action: 'tel:+33388128000' },
            { label: 'Emergencies', value: 'Open 24/7' },
            { label: 'Website', value: 'chru-strasbourg.fr', action: 'https://www.chru-strasbourg.fr' },
        ],
        translations: {
            fr: {
                title: 'Hôpital Civil',
                description: 'Hôpital principal au centre-ville',
                content: [
                    { label: 'Adresse', value: '1 Place de l\'Hôpital, 67000 Strasbourg' },
                    { label: 'Téléphone', value: '03 88 12 80 00' },
                    { label: 'Urgences', value: 'Ouvert 24h/24, 7j/7' },
                    { label: 'Site Web', value: 'chru-strasbourg.fr' },
                ]
            },
            tr: {
                title: 'Sivil Hastane (Hôpital Civil)',
                description: 'Şehir merkezindeki ana hastane',
                content: [
                    { label: 'Adres', value: '1 Place de l\'Hôpital, 67000 Strasbourg' },
                    { label: 'Telefon', value: '+33 3 88 12 80 00' },
                    { label: 'Acil Servis', value: '7/24 Açık' },
                    { label: 'Web Sitesi', value: 'chru-strasbourg.fr' },
                ]
            }
        }
    }
];
