// src/app/api/bible-import/progress/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read the progress file
    const progressPath = path.join(process.cwd(), 'src/bible-import/processed/progress.json');
    
    try {
      const progressData = await fs.readFile(progressPath, 'utf-8');
      return NextResponse.json(JSON.parse(progressData));
    } catch (error) {
      // If file doesn't exist, return empty progress
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({
          completedBooks: 0,
          completedChapters: 0,
          totalChapters: 1189, // Total chapters in the Bible
          totalVerses: 0,
          books: {}
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}