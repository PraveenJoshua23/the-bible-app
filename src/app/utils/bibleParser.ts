export const bookAbbreviations: Record<string, string> = {
    'gn': 'GEN', 'ex': 'EXO', 'lv': 'LEV', 'nm': 'NUM', 'dt': 'DEU',
    'js': 'JOS', 'jg': 'JDG', 'rt': 'RUT', '1sm': '1SA', '2sm': '2SA',
    '1ki': '1KI', '2ki': '2KI', '1ch': '1CH', '2ch': '2CH', 'ezr': 'EZR',
    'ne': 'NEH', 'es': 'EST', 'jb': 'JOB', 'ps': 'PSA', 'pr': 'PRO',
    'ec': 'ECC', 'ss': 'SNG', 'is': 'ISA', 'jr': 'JER', 'lm': 'LAM',
    'ez': 'EZK', 'dn': 'DAN', 'hs': 'HOS', 'jl': 'JOL', 'am': 'AMO',
    'ob': 'OBA', 'jh': 'JON', 'mc': 'MIC', 'na': 'NAM', 'hk': 'HAB',
    'zp': 'ZEP', 'hg': 'HAG', 'zc': 'ZEC', 'ml': 'MAL', 'mt': 'MAT',
    'mk': 'MRK', 'lk': 'LUK', 'jn': 'JHN', 'ac': 'ACT', 'rm': 'ROM',
    '1co': '1CO', '2co': '2CO', 'ga': 'GAL', 'ep': 'EPH', 'ph': 'PHP',
    'cl': 'COL', '1th': '1TH', '2th': '2TH', '1tm': '1TI', '2tm': '2TI',
    'tt': 'TIT', 'phm': 'PHM', 'hb': 'HEB', 'jm': 'JAS', '1pe': '1PE',
    '2pe': '2PE', '1jn': '1JN', '2jn': '2JN', '3jn': '3JN', 'jd': 'JUD',
    'rv': 'REV'
};

interface ParsedQuery {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
}

export const parseQuery = (query: string): ParsedQuery | null => {
    const cleanQuery = query.trim().toLowerCase();
    const parts = cleanQuery.split(' ');
    
    if (parts.length < 1) return null;

    let book = parts[0];
    book = bookAbbreviations[book] || book.toUpperCase();

    if (parts.length === 1) {
        return { book, chapter: 1 };
    }

    const [chapter, verseRange] = parts[1].split(':');
    
    if (!verseRange) {
        return {
            book,
            chapter: parseInt(chapter)
        };
    }

    const [verseStart, verseEnd] = verseRange.split('-');
    
    return {
        book,
        chapter: parseInt(chapter),
        verseStart: parseInt(verseStart),
        verseEnd: verseEnd ? parseInt(verseEnd) : parseInt(verseStart)
    };
};