'use client'
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { BIBLE_BOOKS } from '@/bible-import/utils/constants';

const BibleImportManager = () => {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterText, setChapterText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [completedChapters, setCompletedChapters] = useState<Record<string, number[]>>({});

  // Fetch completed chapters on mount and when a chapter is processed
  useEffect(() => {
    fetchCompletedChapters();
  }, []);

  const fetchCompletedChapters = async () => {
    try {
      const response = await fetch('/api/bible-import/progress');
      const data = await response.json();
      
      // Transform the progress data into a map of completed chapters
      const completed: Record<string, number[]> = {};
      Object.entries(data.books || {}).forEach(([book, bookData]: [string, any]) => {
        completed[book] = Object.keys(bookData.chapters).map(Number);
      });
      setCompletedChapters(completed);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };


  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/bible-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book: selectedBook,
          chapter: selectedChapter,
          text: chapterText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process chapter');
      }

      await fetchCompletedChapters(); // Refresh completed chapters
      setStatus('Chapter processed successfully!');
      setChapterText('');
      
      // Optional: Navigate to progress page after successful import
      // router.push('/bible-import/progress');
    } catch (error) {
      if (error instanceof Error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus('An unknown error occurred');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === 'progress') {
      router.push('/bible-import/progress');
    }
  };

  const isChapterCompleted = (book: string, chapter: number) => {
    return completedChapters[book]?.includes(chapter);
  };

  const books = BIBLE_BOOKS || [];
  const selectedBookData = books.find((b: { abbr: string; }) => b.abbr === selectedBook);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Bible Version Import Manager</h1>
        
        <Tabs defaultValue="import" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="import">Import Chapter</TabsTrigger>
            <TabsTrigger value="progress">View Progress</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {/* Book Selection */}
            <div>
                <label className="block text-sm font-medium mb-2">Select Book</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {books.map((book) => (
                    <Button
                    key={book.abbr}
                    variant={selectedBook === book.abbr ? "default" : "outline"}
                    onClick={() => {
                        setSelectedBook(book.abbr);
                        setSelectedChapter(1);
                    }}
                    className={`text-sm ${
                        completedChapters[book.abbr]?.length === book.chapters
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : ''
                    }`}
                    >
                    {book.name}
                    </Button>
                ))}
                </div>
            </div>

            {/* Chapter Selection */}
            {selectedBookData && (
                <div>
                    <label className="block text-sm font-medium mb-2">Select Chapter</label>
                    <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: selectedBookData.chapters }, (_, i) => i + 1).map((num) => (
                        <Button
                            key={num}
                            variant={selectedChapter === num ? "default" : "outline"}
                            onClick={() => setSelectedChapter(num)}
                            className={`text-sm ${
                            isChapterCompleted(selectedBook, num)
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                : ''
                            }`}
                        >
                            {num}
                        </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chapter Text Input */}
            {selectedBook && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Enter Chapter Text (Format: "1 Verse text here. 2 Next verse here.")
                    </label>
                    <div className="mb-2 p-3 bg-gray-50 rounded text-sm">
                        <strong>Example format:</strong><br />
                        1 In the beginning was the Word, and the Word was with God, and the Word was God. 2 He was in the beginning with God.
                    </div>
                    <Textarea
                        value={chapterText}
                        onChange={(e) => setChapterText(e.target.value)}
                        placeholder="1 First verse text here. 2 Second verse text here."
                        className="h-64 font-mono"
                    />
                </div>
            )}

            {/* Submit Button */}
            {selectedBook && chapterText && (
              <Button 
                onClick={handleSubmit} 
                disabled={processing}
                className="w-full"
              >
                {processing ? 'Processing...' : 'Process Chapter'}
              </Button>
            )}

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded ${
                status.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {status}
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default BibleImportManager;