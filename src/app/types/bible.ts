
// Common interfaces
export interface BibleVersion {
  id: string;
  dblId: string;
  abbreviation: string;
  name: string;
  nameLocal?: string;
  description?: string;
  descriptionLocal?: string;
  language: {
    id: string;
    name: string;
    nameLocal?: string;
    script?: string;
    scriptDirection?: string;
  };
}

export interface BibleVersionWithFavorite extends BibleVersion {
  isFavorite?: boolean;
}

export interface VerseContent {
  id: string
  orgId: string
  bookId: string
  chapterId: string
  bibleId: string
  reference: string
  content: string
}


export interface BiblePassage {
    reference: string;
    content: string;
}

export interface Settings {
    showVerseNumbers: boolean;
    font: 'sans' | 'serif' | 'script';
    theme: 'light' | 'dark' | 'cream';
    verseDisplay: 'paragraph' | 'list';
    fontSize: 'small' | 'medium' | 'large' | 'xl';
}

export interface BookData {
  abbr: string;
  name: string;
  chapters: number;
}

// API.bible format
export interface ApiBibleVerse {
  number: string;
  text: string;
}

export interface ApiBibleChapter {
  id: string;
  bookId: string;
  number: string;
  reference: string;
  verses: ApiBibleVerse[];
}

// Custom version format
export interface CustomBibleVerse {
  id: string;
  bookId: string;
  chapterId: string;
  bibleId: string;
  reference: string;
  content: string;
}

export interface CustomBibleChapter {
  id: string;
  bookId: string;
  number: string;
  reference: string;
  verses: CustomBibleVerse[];
}

// Combined interfaces for handling both types
export interface BibleBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters: (ApiBibleChapter | CustomBibleChapter)[];
}

export interface BibleData<T extends 'api' | 'custom' = 'api'> {
  data: BibleVersion & {
    books: Array<{
      id: string;
      bibleId: string;
      abbreviation: string;
      name: string;
      nameLong: string;
      chapters: Array<T extends 'api' ? ApiBibleChapter : CustomBibleChapter>;
    }>;
  };
}

// Response type for passage lookup
export interface BiblePassage {
  id: string;
  bibleId: string;
  bookId: string;
  chapterId?: string;
  reference: string;
  content: string;
  verseCount?: number;
  copyright?: string;
}

