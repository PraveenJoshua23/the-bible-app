import { z } from 'zod';
import { BIBLE_BOOKS } from './constants';

// Types for Bible version data
interface BibleChapter {
    chapter: number;
    verses: {
        number: number;
        text: string;
    }[];
}

interface BibleBook {
    name: string;
    abbreviation: string;
    chapters: BibleChapter[];
}

interface BibleVersion {
    id: string;
    name: string;
    abbreviation: string;
    language: string;
    books: BibleBook[];
}

// Schema for validating verse input
const verseInputSchema = z.object({
    text: z.string().min(1, "Verse text cannot be empty"),
    number: z.number().positive("Verse number must be positive")
});

export class BibleVersionProcessor {
    private version: Partial<BibleVersion>;
    
    constructor(versionDetails: {
        name: string;
        abbreviation: string;
        language?: string;
    }) {
        this.version = {
            id: this.generateVersionId(versionDetails.abbreviation),
            name: versionDetails.name,
            abbreviation: versionDetails.abbreviation,
            language: versionDetails.language || 'en',
            books: []
        };
    }

    private generateVersionId(abbreviation: string): string {
        return `custom-${abbreviation}-${Date.now()}`;
    }

    /**
     * Process a chapter's text and convert it into structured verse data
     */
    processChapterText(text: string): { number: number; text: string; }[] {
        const verses: { number: number; text: string; }[] = [];
        
        // Match verses that start with a number and end with a period
        // This regex accounts for possible newlines and multiple sentences per verse
        const verseRegex = /(\d+)\s+([^0-9]+?)(?=\s+\d+\s+|$)/g;
        let match;

        while ((match = verseRegex.exec(text)) !== null) {
            const [ verseNumber, verseText] = match;
            verses.push({
                number: parseInt(verseNumber),
                text: verseText.trim().replace(/\n+/g, ' ')
            });
        }

        if (verses.length === 0) {
            throw new Error('No valid verses found in the text. Please check the format.');
        }

        // Sort verses by number to ensure proper order
        verses.sort((a, b) => a.number - b.number);

        // Validate sequential verse numbers
        let expectedNumber = 1;
        for (const verse of verses) {
            if (verse.number !== expectedNumber) {
                throw new Error(`Missing or invalid verse number. Expected ${expectedNumber}, found ${verse.number}`);
            }
            expectedNumber++;
        }

        return verses;
    }

    /**
     * Add a chapter to a specific book
     */
    addChapter(bookAbbr: string, chapterNumber: number, chapterText: string) {
        let book = this.version.books?.find(b => b.abbreviation === bookAbbr);
        
        if (!book) {
            const bookInfo = BIBLE_BOOKS.find(b => b.abbr === bookAbbr);
            if (!bookInfo) {
                throw new Error(`Invalid book abbreviation: ${bookAbbr}`);
            }
            
            book = {
                name: bookInfo.name,
                abbreviation: bookInfo.abbr,
                chapters: []
            };
            this.version.books?.push(book);
        }

        const verses = this.processChapterText(chapterText);
        
        // Validate verses
        verses.forEach(verse => {
            try {
                verseInputSchema.parse(verse);
            } catch (error) {
                throw new Error(`Invalid verse data in ${bookAbbr} ${chapterNumber}:${verse.number}`);
            }
        });

        book.chapters.push({
            chapter: chapterNumber,
            verses
        });
    }

    /**
     * Export the complete Bible version
     */
    export(): BibleVersion {
        if (!this.isVersionComplete()) {
            throw new Error('Bible version is incomplete');
        }
        return this.version as BibleVersion;
    }

    /**
     * Check if the Bible version is complete
     */
    private isVersionComplete(): boolean {
        if (!this.version.books || this.version.books.length !== 66) {
            return false;
        }

        return this.version.books.every(book => {
            const expectedChapters = BIBLE_BOOKS.find(b => b.abbr === book.abbreviation)?.chapters;
            return book.chapters.length === expectedChapters;
        });
    }

    /**
     * Get progress information about the version
     */
    getProgress(): {
        totalBooks: number;
        completedBooks: number;
        currentBook?: string;
        completedChapters: number;
        totalChapters: number;
    } {
        const books = this.version.books || [];
        const completedBooks = books.filter(book => {
            const expectedChapters = BIBLE_BOOKS.find(b => b.abbr === book.abbreviation)?.chapters;
            return book.chapters.length === expectedChapters;
        }).length;

        const completedChapters = books.reduce((sum, book) => sum + book.chapters.length, 0);
        const totalChapters = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0);

        return {
            totalBooks: 66,
            completedBooks,
            currentBook: books[books.length - 1]?.name,
            completedChapters,
            totalChapters
        };
    }
}