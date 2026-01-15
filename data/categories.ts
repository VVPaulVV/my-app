export type Category = {
    id: string;
    nameKey: 'sights' | 'restaurants' | 'museums' | 'activities';
    color: string;
};

export const CATEGORIES: Category[] = [
    {
        id: 'sights',
        nameKey: 'sights',
        color: '#FF9EAA' // Pastel Red/Pink
    },
    {
        id: 'restaurants',
        nameKey: 'restaurants',
        color: '#FFCB85' // Pastel Orange
    },
    {
        id: 'museums',
        nameKey: 'museums',
        color: '#C69CDD' // Pastel Purple
    },
    {
        id: 'activities',
        nameKey: 'activities',
        color: '#92C9F9' // Pastel Blue
    }
];
