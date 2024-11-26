
  export interface BiblePassage {
    id: string
    orgId: string
    bibleId: string
    bookId: string
    chapterId: string
    reference: string
    content: string
    verseCount: number
    copyright: string
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

  export interface BibleVersion {
    id: string;
    name: string;
    abbreviation: string;
    language: {
        name: string;
    };
}

export interface BibleVersionWithFavorite extends BibleVersion {
    isFavorite?: boolean;
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