
// Type for parsed reference
export interface ParsedReference {
    book: string;
    chapter: number;
    verseStart?: number;
    verseEnd?: number;
  }
  
  // Map of book abbreviations to full names
  export const BOOK_NAMES: { [key: string]: string } = {
    'gen': 'Genesis',
    'exo': 'Exodus',
    'lev': 'Leviticus',
    'num': 'Numbers',
    'deu': 'Deuteronomy',
    'jos': 'Joshua',
    'jdg': 'Judges',
    'rut': 'Ruth',
    '1sa': '1 Samuel',
    '2sa': '2 Samuel',
    '1ki': '1 Kings',
    '2ki': '2 Kings',
    '1ch': '1 Chronicles',
    '2ch': '2 Chronicles',
    'ezr': 'Ezra',
    'neh': 'Nehemiah',
    'est': 'Esther',
    'job': 'Job',
    'psa': 'Psalms',
    'pro': 'Proverbs',
    'ecc': 'Ecclesiastes',
    'sos': 'Song of Solomon',
    'isa': 'Isaiah',
    'jer': 'Jeremiah',
    'jr': 'Jeremiah',
    'lam': 'Lamentations',
    'eze': 'Ezekiel',
    'dan': 'Daniel',
    'hos': 'Hosea',
    'joe': 'Joel',
    'amo': 'Amos',
    'oba': 'Obadiah',
    'jon': 'Jonah',
    'mic': 'Micah',
    'nah': 'Nahum',
    'hab': 'Habakkuk',
    'zep': 'Zephaniah',
    'hag': 'Haggai',
    'zec': 'Zechariah',
    'mal': 'Malachi',
    'matt': 'Matthew',
    'mrk': 'Mark',
    'mk': 'Mark',
    'luk': 'Luke',
    'lk': 'Luke',
    'john': 'John',
    'jn': 'John',
    'act': 'Acts',
    'rom': 'Romans',
    '1co': '1 Corinthians',
    '2co': '2 Corinthians',
    'gal': 'Galatians',
    'eph': 'Ephesians',
    'phil': 'Philippians',
    'col': 'Colossians',
    '1th': '1 Thessalonians',
    '2th': '2 Thessalonians',
    '1tim': '1 Timothy',
    '2tim': '2 Timothy',
    'tit': 'Titus',
    'phm': 'Philemon',
    'heb': 'Hebrews',
    'jam': 'James',
    'jm': 'James',
    '1pe': '1 Peter',
    '2pe': '2 Peter',
    '1jo': '1 John',
    '1jn': '1 John',
    '2jo': '2 John',
    '2jn': '2 John',
    '3jo': '3 John',
    '3jn': '3 John',
    'jude': 'Jude',
    'rev': 'Revelation',
    'rv': 'Revelation'
  };
  
  export function parseQuery(query: string) {
    // Parse format like "jn 3:16" or "rev 21:1-4" or "gen 1"
    const match = query.match(/^([a-z0-9]+)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
    
    if (!match) return null;
    
    const [, book, chapter, verseStart, verseEnd] = match;
    
    // Convert any short abbreviation to standard form
    let standardBook = book.toLowerCase();
    if (BOOK_NAMES[standardBook]) {
      standardBook = BOOK_NAMES[standardBook];
    }
    
    return {
      book: standardBook,
      chapter: parseInt(chapter),
      verseStart: verseStart ? parseInt(verseStart) : undefined,
      verseEnd: verseEnd ? parseInt(verseEnd) : undefined
    };
  }
  
  export function formatReference(reference: string, originalQuery: string): string {
    const parsedQuery = parseQuery(originalQuery);
    if (!parsedQuery) return reference;
  
    // Get the full book name, looking up standardized abbreviation
    const bookName = BOOK_NAMES[parsedQuery.book] || parsedQuery.book;
  
    // If query only specified chapter (no verses), show only chapter
    if (!parsedQuery.verseStart) {
      return `${bookName} ${parsedQuery.chapter}`;
    }
  
    // If query specified a verse range
    if (parsedQuery.verseEnd) {
      return `${bookName} ${parsedQuery.chapter}:${parsedQuery.verseStart}-${parsedQuery.verseEnd}`;
    }
  
    // If query specified a single verse
    return `${bookName} ${parsedQuery.chapter}:${parsedQuery.verseStart}`;
  }
  