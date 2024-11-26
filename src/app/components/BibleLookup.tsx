'use client'

import React, { useState } from 'react';
import { Book, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { themes } from '../utils/themes';

// Bible structure data
const BIBLE_BOOKS = [
    // Old Testament
    { name: 'Genesis', abbr: 'gen', chapters: 50 },
    { name: 'Exodus', abbr: 'exo', chapters: 40 },
    { name: 'Leviticus', abbr: 'lev', chapters: 27 },
    { name: 'Numbers', abbr: 'num', chapters: 36 },
    { name: 'Deuteronomy', abbr: 'deu', chapters: 34 },
    { name: 'Joshua', abbr: 'jos', chapters: 24 },
    { name: 'Judges', abbr: 'jdg', chapters: 21 },
    { name: 'Ruth', abbr: 'rut', chapters: 4 },
    { name: '1 Samuel', abbr: '1sa', chapters: 31 },
    { name: '2 Samuel', abbr: '2sa', chapters: 24 },
    { name: '1 Kings', abbr: '1ki', chapters: 22 },
    { name: '2 Kings', abbr: '2ki', chapters: 25 },
    { name: '1 Chronicles', abbr: '1ch', chapters: 29 },
    { name: '2 Chronicles', abbr: '2ch', chapters: 36 },
    { name: 'Ezra', abbr: 'ezr', chapters: 10 },
    { name: 'Nehemiah', abbr: 'neh', chapters: 13 },
    { name: 'Esther', abbr: 'est', chapters: 10 },
    { name: 'Job', abbr: 'job', chapters: 42 },
    { name: 'Psalms', abbr: 'psa', chapters: 150 },
    { name: 'Proverbs', abbr: 'pro', chapters: 31 },
    { name: 'Ecclesiastes', abbr: 'ecc', chapters: 12 },
    { name: 'Song of Solomon', abbr: 'sos', chapters: 8 },
    { name: 'Isaiah', abbr: 'isa', chapters: 66 },
    { name: 'Jeremiah', abbr: 'jer', chapters: 52 },
    { name: 'Lamentations', abbr: 'lam', chapters: 5 },
    { name: 'Ezekiel', abbr: 'eze', chapters: 48 },
    { name: 'Daniel', abbr: 'dan', chapters: 12 },
    { name: 'Hosea', abbr: 'hos', chapters: 14 },
    { name: 'Joel', abbr: 'joe', chapters: 3 },
    { name: 'Amos', abbr: 'amo', chapters: 9 },
    { name: 'Obadiah', abbr: 'oba', chapters: 1 },
    { name: 'Jonah', abbr: 'jon', chapters: 4 },
    { name: 'Micah', abbr: 'mic', chapters: 7 },
    { name: 'Nahum', abbr: 'nah', chapters: 3 },
    { name: 'Habakkuk', abbr: 'hab', chapters: 3 },
    { name: 'Zephaniah', abbr: 'zep', chapters: 3 },
    { name: 'Haggai', abbr: 'hag', chapters: 2 },
    { name: 'Zechariah', abbr: 'zec', chapters: 14 },
    { name: 'Malachi', abbr: 'mal', chapters: 4 },
    // New Testament
    { name: 'Matthew', abbr: 'mat', chapters: 28 },
    { name: 'Mark', abbr: 'mar', chapters: 16 },
    { name: 'Luke', abbr: 'luk', chapters: 24 },
    { name: 'John', abbr: 'joh', chapters: 21 },
    { name: 'Acts', abbr: 'act', chapters: 28 },
    { name: 'Romans', abbr: 'rom', chapters: 16 },
    { name: '1 Corinthians', abbr: '1co', chapters: 16 },
    { name: '2 Corinthians', abbr: '2co', chapters: 13 },
    { name: 'Galatians', abbr: 'gal', chapters: 6 },
    { name: 'Ephesians', abbr: 'eph', chapters: 6 },
    { name: 'Philippians', abbr: 'phi', chapters: 4 },
    { name: 'Colossians', abbr: 'col', chapters: 4 },
    { name: '1 Thessalonians', abbr: '1th', chapters: 5 },
    { name: '2 Thessalonians', abbr: '2th', chapters: 3 },
    { name: '1 Timothy', abbr: '1ti', chapters: 6 },
    { name: '2 Timothy', abbr: '2ti', chapters: 4 },
    { name: 'Titus', abbr: 'tit', chapters: 3 },
    { name: 'Philemon', abbr: 'phm', chapters: 1 },
    { name: 'Hebrews', abbr: 'heb', chapters: 13 },
    { name: 'James', abbr: 'jam', chapters: 5 },
    { name: '1 Peter', abbr: '1pe', chapters: 5 },
    { name: '2 Peter', abbr: '2pe', chapters: 3 },
    { name: '1 John', abbr: '1jo', chapters: 5 },
    { name: '2 John', abbr: '2jo', chapters: 1 },
    { name: '3 John', abbr: '3jo', chapters: 1 },
    { name: 'Jude', abbr: 'jud', chapters: 1 },
    { name: 'Revelation', abbr: 'rev', chapters: 22 },
];

interface BibleLookupProps {
  onSelect: (reference: string) => void;
  theme: keyof typeof themes;
}

export const BibleLookup: React.FC<BibleLookupProps> = ({ onSelect, theme }) => {
  const [selectedBook, setSelectedBook] = useState<typeof BIBLE_BOOKS[0] | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = () => {
    if (selectedBook && selectedChapter) {
      const reference = selectedVerse
        ? `${selectedBook.abbr} ${selectedChapter}:${selectedVerse}`
        : `${selectedBook.abbr} ${selectedChapter}`;
      onSelect(reference);
      setIsOpen(false);
      // Reset selections
      setSelectedBook(null);
      setSelectedChapter(null);
      setSelectedVerse(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${themes[theme].buttonBg} ${themes[theme].buttonText}`}
        >
          <Book className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-80 p-4 ${themes[theme].dropdownBg} ${themes[theme].text}`}>
        <div className="space-y-4">
          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Book</label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {BIBLE_BOOKS.map((book) => (
                <Button
                  key={book.abbr}
                  variant={selectedBook?.abbr === book.abbr ? "default" : "outline"}
                  className="text-sm"
                  onClick={() => {
                    setSelectedBook(book);
                    setSelectedChapter(null);
                    setSelectedVerse(null);
                  }}
                >
                  {book.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Chapter Selection */}
          {selectedBook && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Chapter</label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                  <Button
                    key={chapter}
                    variant={selectedChapter === chapter ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setSelectedVerse(null);
                    }}
                  >
                    {chapter}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Verse Selection (Optional) */}
          {selectedBook && selectedChapter && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Verse (Optional)</label>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((verse) => (
                  <Button
                    key={verse}
                    variant={selectedVerse === verse ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setSelectedVerse(verse)}
                  >
                    {verse}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Select Button */}
          {selectedBook && selectedChapter && (
            <Button 
              className="w-full mt-4" 
              onClick={handleSelect}
            >
              Go to {selectedBook.name} {selectedChapter}{selectedVerse ? `:${selectedVerse}` : ''}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BibleLookup;