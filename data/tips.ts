export interface Tip {
    id: string;
    title: string;
    content: string;
    icon: string;
    color: string;
    translations?: {
        [key: string]: {
            title?: string;
            content?: string;
        };
    };
}

export const TIPS: Tip[] = [
    {
        id: 'tallest_building',
        title: 'Did you know?',
        content: 'Strasbourg Cathedral was the world’s tallest building for 227 years, from 1647 to 1874!',
        icon: 'building.2',
        color: '#FFD1D1',
        translations: {
            fr: {
                title: 'Le saviez-vous ?',
                content: 'La cathédrale de Strasbourg a été le plus haut bâtiment du monde pendant 227 ans, de 1647 à 1874 !',
            },
            de: {
                title: 'Wussten Sie schon?',
                content: 'Das Straßburger Münster war 227 Jahre lang, von 1647 bis 1874, das höchste Gebäude der Welt!',
            },
        },
    },
    {
        id: 'gutenberg',
        title: 'Local Legend',
        content: 'Johannes Gutenberg, the inventor of the printing press, lived in Strasbourg for 10 years and developed his movable type technology here.',
        icon: 'book.fill',
        color: '#C1E1C1',
        translations: {
            fr: {
                title: 'Légende Locale',
                content: 'Johannes Gutenberg, l’inventeur de l’imprimerie, a vécu à Strasbourg pendant 10 ans et y a développé sa technologie de caractères mobiles.',
            },
            de: {
                title: 'Lokale Legende',
                content: 'Johannes Gutenberg, der Erfinder des Buchdrucks, lebte 10 Jahre lang in Straßburg und entwickelte hier seine Buchdrucktechnik.',
            },
        },
    },
    {
        id: 'heart_transplant',
        title: 'Medical Mile',
        content: 'The first heart transplant in France was performed at the Civil Hospital in Strasbourg in 1968.',
        icon: 'heart.fill',
        color: '#A0C4FF',
        translations: {
            fr: {
                title: 'Haut Lieu Médical',
                content: 'La première transplantation cardiaque en France a été réalisée à l’Hôpital Civil de Strasbourg en 1968.',
            },
            de: {
                title: 'Medizinischer Meilenstein',
                content: 'Die erste Herztransplantation in Frankreich wurde 1968 im Zivilkrankenhaus in Straßburg durchgeführt.',
            },
        },
    },
    {
        id: 'petite_france',
        title: 'Historic District',
        content: 'Petite France was once the district of tanners, millers, and fishermen. Today, it’s the most picturesque part of the city.',
        icon: 'house.fill',
        color: '#FFE5B4',
        translations: {
            fr: {
                title: 'Quartier Historique',
                content: 'La Petite France était autrefois le quartier des tanneurs, des meuniers et des pêcheurs. Aujourd’hui, c’est la partie la plus pittoresque de la ville.',
            },
            de: {
                title: 'Historisches Viertel',
                content: 'Petite France war einst das Viertel der Gerber, Müller und Fischer. Heute ist es der malerischste Teil der Stadt.',
            },
        },
    },
    {
        id: 'capital_christmas',
        title: 'Winter Magic',
        content: 'Strasbourg has been known as the "Capital of Christmas" since 1570, making its Christmas market one of the oldest in Europe.',
        icon: 'suit.heart.fill',
        color: '#D1C4E9',
        translations: {
            fr: {
                title: 'Magie d\'Hiver',
                content: 'Strasbourg est connue comme la "Capitale de Noël" depuis 1570, ce qui fait de son marché de Noël l\'un des plus anciens d\'Europe.',
            },
            de: {
                title: 'Winterzauber',
                content: 'Straßburg ist seit 1570 als "Weihnachtshauptstadt" bekannt, was seinen Weihnachtsmarkt zu einem der ältesten in Europa macht.',
            },
        },
    },
];
