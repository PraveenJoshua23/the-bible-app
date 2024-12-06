import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Chapter {
  verseCount?: number;
}

interface Book {
  chapters: Record<string, Chapter>;
}

interface Progress {
  books: Record<string, Book>;
  completedChapters: number;
  totalVerses: number;
  lastUpdated: string;
}

export async function DELETE(request: Request) {
  try {
    const { book, chapter } = await request.json();
    const progressPath = path.join(process.cwd(), 'src/bible-import/processed/progress.json');

    // Read existing progress
    const existingData = await fs.readFile(progressPath, 'utf-8');
    const progress: Progress = JSON.parse(existingData);

    // Remove the chapter
    if (progress.books?.[book]?.chapters?.[chapter]) {
      delete progress.books[book].chapters[chapter];
      
      // If book has no chapters left, remove the book
      if (Object.keys(progress.books[book].chapters).length === 0) {
        delete progress.books[book];
      }

      // Recalculate totals
      const completedChapters = Object.values(progress.books || {}).reduce((sum: number, book: Book) => 
        sum + Object.keys(book.chapters || {}).length, 0);

      const totalVerses = Object.values(progress.books || {}).reduce((sum: number, book: Book) => 
        sum + Object.values(book.chapters || {}).reduce((chapterSum: number, chapter: Chapter) => 
          chapterSum + (chapter.verseCount || 0), 0), 0);

      progress.completedChapters = completedChapters;
      progress.totalVerses = totalVerses;
      progress.lastUpdated = new Date().toISOString();

      // Save updated progress
      await fs.writeFile(progressPath, JSON.stringify(progress, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chapter error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}