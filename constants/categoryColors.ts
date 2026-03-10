export const CATEGORY_COLORS = {
    sights: '#C9524A',
    monuments: '#C9524A',
    sight: '#C9524A',
    restaurants: '#C4834A',
    restaurant: '#C4834A',
    food: '#C4834A',
    museums: '#4A7EC4',
    museum: '#4A7EC4',
    culture: '#4A7EC4',
    default: '#C9524A',
} as const;

export function getCategoryColor(type?: string): string {
    if (!type) return CATEGORY_COLORS.default;
    const key = type.toLowerCase();
    return (CATEGORY_COLORS as Record<string, string>)[key] ?? CATEGORY_COLORS.default;
}
