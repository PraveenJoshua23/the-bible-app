export interface ImportVerse {
    number: number;
    text: string;
}

export interface ImportChapter {
    chapter: number;
    verses: ImportVerse[];
}

export interface ImportBook {
    name: string;
    abbreviation: string;
    chapters: ImportChapter[];
}

export interface ImportVersion {
    id: string;
    name: string;
    abbreviation: string;
    language: string;
    books: ImportBook[];
}