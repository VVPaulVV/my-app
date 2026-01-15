import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const i18n = new I18n({
    en: {
        welcome: 'Welcome to',
        discover: 'Discover the Capital of Christmas',
        startExploring: 'Start Exploring',
        highlights: 'Highlights',
        seeAll: 'See all',
        exploreTitle: 'Explore Sights',
        searchPlaceholder: 'Search sights...',
        home: 'Home',
        explore: 'Explore',
        transport: 'Transport',
        about: 'About',
        guide: 'Guide',
        guideTitle: 'Ticket Guide',
        location: 'Location',
        mapView: 'Open in Maps',
        mustSee: 'Must See',
        restaurants: 'Restaurants',
        museums: 'Museums',
        activities: 'Activities',
        sights: 'Sights',
        // Uppercase versions for resilience
        MUSTSEE: 'Must See',
        SIGHTS: 'Sights',
        RESTAURANTS: 'Restaurants',
        MUSEUMS: 'Museums',
        ACTIVITIES: 'Activities',
    },
    fr: {
        welcome: 'Bienvenue à',
        discover: 'Découvrez la Capitale de Noël',
        startExploring: 'Commencer à explorer',
        highlights: 'Points forts',
        seeAll: 'Tout voir',
        exploreTitle: 'Explorer les lieux',
        searchPlaceholder: 'Rechercher des lieux...',
        home: 'Accueil',
        explore: 'Explorer',
        transport: 'Transport',
        guide: 'Guide',
        guideTitle: 'Guide des Tickets',
        about: 'À propos',
        location: 'Emplacement',
        mapView: 'Ouvrir dans Plans',
        mustSee: 'Incontournable',
        restaurants: 'Restaurants',
        museums: 'Musées',
        activities: 'Activités',
        sights: 'Lieux',
        // Uppercase versions for resilience
        MUSTSEE: 'Incontournable',
        SIGHTS: 'Lieux',
        RESTAURANTS: 'Restaurants',
        MUSEUMS: 'Musées',
        ACTIVITIES: 'Activités',
    },
});

i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;

export default i18n;
