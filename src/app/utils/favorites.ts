export const loadFavorites = (): string[] => {
    if (typeof window === 'undefined') return [];
    
    try {
        const favorites = localStorage.getItem('bibleFavorites');
        return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
        console.error('Error loading favorites:', error);
        return [];
    }
};

export const saveFavorites = (favorites: string[]) => {
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem('bibleFavorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
};