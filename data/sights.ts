export type Sight = {
    id: string;
    name: string;
    shortDescription: string;
    description?: string;
    image: any; // URL or require
    category: 'sights' | 'nature' | 'modern' | 'mustSee' | 'museums' | 'restaurants' | 'activities' | 'sights';
    location: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    reservationUrl?: string;
    phoneNumber?: string;
    tags?: string[];
};

export const SIGHTS: Sight[] = [
    // Primary Sights
    {
        id: 'cathedral',
        name: 'Cathédrale Notre-Dame',
        shortDescription: 'The stunning masterpiece of Gothic art.',
        description: 'Strasbourg Cathedral is a masterpiece of Gothic art. The 142 m spire was the highest in Christendom until the 19th century.',
        image: require('@/assets/images/sights/cathedral.jpg'),
        category: 'sights',
        // Updated
        location: 'Pl. de la Cathédrale',
        coordinates: { latitude: 48.58180755516249, longitude: 7.750911815075193 }
    },
    {
        id: 'petite-france',
        name: 'La Petite France',
        shortDescription: 'The most picturesque district of old Strasbourg.',
        description: 'Fishermen, millers and tanners once lived and worked in this part of town where the streets have been built on the level of the waterways.',
        image: require('@/assets/images/sights/petite-france.jpg'),
        category: 'sights',
        // Updated
        location: '1 Rue du Pont Saint-Martin',
        coordinates: { latitude: 48.58009767451487, longitude: 7.743200116368558 }
    },
    {
        id: 'rohan-palace',
        name: 'Palais Rohan',
        shortDescription: 'Former residence of the prince-bishops.',
        description: 'This 18th-century palace is a masterpiece of French Baroque architecture and now houses three museums.',
        image: require('@/assets/images/sights/palais-rohan.jpg'),
        category: 'sights',
        // Updated
        location: '2 Pl. du Château',
        coordinates: { latitude: 48.581059628550705, longitude: 7.752234701598285 }
    },
    {
        id: 'barrage-vauban',
        name: 'Barrage Vauban',
        shortDescription: '17th-century bridge and weir.',
        description: 'A defensive work erected in the 17th century on the River Ill. It offers a great panoramic view of the Petite France.',
        image: require('@/assets/images/sights/barrage-vauban.jpg'),
        category: 'sights',
        // Updated
        location: 'Pl. du Quartier Blanc',
        coordinates: { latitude: 48.579601192743404, longitude: 7.738016252519863 }
    },
    // Secondary Sights
    {
        id: 'eu-parliament',
        name: 'European Parliament',
        shortDescription: 'The legislative heart of Europe.',
        description: 'The Louise Weiss building houses the hemicycle where planetary debates take place. A symbol of modern Strasbourg.',
        image: require('@/assets/images/sights/eu-parliament.jpg'),
        category: 'sights',
        // Updated
        location: '1 Av. du Président Robert Schuman',
        coordinates: { latitude: 48.597484505938425, longitude: 7.768460744781987 }
    },
    {
        id: 'orangerie',
        name: 'Parc de l\'Orangerie',
        shortDescription: 'Strasbourg\'s oldest and favorite park.',
        description: 'A beautiful park with a lake, zoo, and stork reintroduction center, located near the European institutions.',
        image: require('@/assets/images/sights/orangerie.jpg'),
        category: 'sights',
        // Updated
        location: 'Parc de l\'Orangerie',
        coordinates: { latitude: 48.59242512751338, longitude: 7.774717627413548 }
    },
    {
        id: 'jardin-deux-rives',
        name: 'Jardin des Deux Rives',
        shortDescription: 'A symbol of friendship between France and Germany.',
        description: 'This cross-border park spans the Rhine river, connected by a magnificent pedestrian bridge.',
        image: require('@/assets/images/sights/deux-rives.jpg'),
        category: 'sights',
        // Updated
        location: '1 Rue des Cavaliers',
        coordinates: { latitude: 48.568389795860774, longitude: 7.79880482370121 }
    },
    {
        id: 'palais-rhin',
        name: 'Palais du Rhin',
        shortDescription: 'Former Imperial Palace.',
        description: 'The former "Kaiserpalast", located on Place de la République, is a major example of 19th-century German architecture in Strasbourg.',
        image: require('@/assets/images/sights/palais-rhin.jpg'),
        category: 'sights',
        // Updated
        location: '2 Pl. de la République',
        coordinates: { latitude: 48.58760234137872, longitude: 7.7527729604229005 }
    },
    {
        id: 'st-paul',
        name: 'Eglise St. Paul',
        shortDescription: 'Neo-Gothic church on the river.',
        description: 'This striking Neo-Gothic protestant church stands on the southern tip of the Sainte-Hélène Island, offering beautiful reflections in the water.',
        image: require('@/assets/images/sights/st-paul.jpg'),
        category: 'sights',
        // Updated
        location: '1 Pl. du Général Eisenhower',
        coordinates: { latitude: 48.58618301091684, longitude: 7.7597309527141425 }
    },
    {
        id: 'university',
        name: 'Université de Strasbourg',
        shortDescription: 'The historic Palais Universitaire.',
        description: 'The University Palace is a grand Italian Renaissance style building completed in 1884, symbolizing the German period\'s emphasis on education.',
        image: require('@/assets/images/sights/university.jpg'),
        category: 'sights',
        // Updated
        location: '9 Pl. de l\'Université',
        coordinates: { latitude: 48.58481135926765, longitude: 7.762476855622575 }
    }
];
