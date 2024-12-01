// src/app/api/bible-import/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { book, chapter, text } = await request.json();

    // Clean the text first
    const cleanedText = text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();


    let foundVerses: number[] = [];
    let verseMatches: Array<{
      number: number;
      context: string;
      matchType: string;
    }> = [];

    // Function to add found verse
    const addVerse = (num: number, context: string, type: string) => {
        if (!foundVerses.includes(num)) {
          foundVerses.push(num);
          verseMatches.push({
            number: num,
            context,
            matchType: type
          });
        }
      };
  
     // Array of patterns to try
    const patterns = [
        // Main pattern that catches most verses including 18
        {
          pattern: /(?:^|[.\s"';,])\s*(\d+)\s+(?=[A-Za-z"'])/g,
          type: 'main'
        },
        // Pattern for verses after quotes (for verse 22)
        {
          pattern: /"(\d+)\s+/g,
          type: 'quote'
        },
        // Pattern for verses after done/saying
        {
          pattern: /(?:done\.|saying,)\s*(\d+)\s+/g,
          type: 'special'
        },
        // Pattern for remaining numbered verses
        {
          pattern: /[.]\s*(\d+)\s+(?=[A-Z])/g,
          type: 'catchall'
        }
      ];
  
      // Try all patterns
      patterns.forEach(({ pattern, type }) => {
        pattern.lastIndex = 0; // Reset the regex
        let match;
        while ((match = pattern.exec(cleanedText)) !== null) {
          const verseNum = parseInt(match[1]);
          const contextStart = Math.max(0, match.index - 30);
          const contextEnd = Math.min(cleanedText.length, match.index + 30);
          addVerse(verseNum, cleanedText.slice(contextStart, contextEnd), type);
        }
      });
  
      // Sort verse numbers
      foundVerses.sort((a, b) => a - b);
      console.log('\nFound verses in order:', foundVerses.join(', '));
  
      // Log verse matches for debugging
      console.log('\nVerse matches:');
      verseMatches.forEach(match => {
        console.log(`\nVerse ${match.number} (${match.matchType}):`);
        console.log(`Context: ...${match.context}...`);
      });
  
     // Get verse count from the highest verse number found
    const verseCount = Math.max(...foundVerses);
    console.log(`Detected ${verseCount} verses in total`);
  
      // Check for missing verses with detailed context
      const missingVerses = [];
      for (let i = 1; i <= verseCount; i++) {
        if (!foundVerses.includes(i)) {
          missingVerses.push(i);
        }
      }
  
      if (missingVerses.length > 0) {
        throw new Error(`Missing verses: ${missingVerses.join(', ')}. Please check the formatting.`);
      }

    // Read existing progress
    const progressPath = path.join(process.cwd(), 'src/bible-import/processed/progress.json');
    let existingProgress: any = {
      books: {},
      completedChapters: 0,
      totalVerses: 0
    };
    
    try {
      const existingData = await fs.readFile(progressPath, 'utf-8');
      existingProgress = JSON.parse(existingData);
    } catch (error) {
      console.log('No existing progress file, creating new one');
    }

    // Update progress
    const updatedProgress = {
        ...existingProgress,
        books: {
          ...existingProgress.books,
          [book]: {
            ...existingProgress.books?.[book],
            chapters: {
              ...existingProgress.books?.[book]?.chapters,
              [chapter]: {
                completed: true,
                verseCount,
                text,
                // verseNumbers: foundVerses,
                // debug: {
                //   matches: verseMatches,
                //   timestamp: new Date().toISOString()
                // }
              }
            }
          }
        },
        lastUpdated: new Date().toISOString()
      };

    // Calculate totals
    let totalVerses = 0;
    let completedChapters = 0;

    Object.values(updatedProgress.books).forEach((book: any) => {
      Object.values(book.chapters).forEach((chapter: any) => {
        totalVerses += chapter.verseCount;
        completedChapters += 1;
      });
    });

    updatedProgress.completedChapters = completedChapters;
    updatedProgress.totalVerses = totalVerses;

    await fs.writeFile(progressPath, JSON.stringify(updatedProgress, null, 2));

    return NextResponse.json({ 
        success: true,
        progress: {
          ...updatedProgress,
          debug: {
            foundVerses,
            verseCount,
            verseMatches
          }
        }
      });

  } catch (error) {
    console.error('Bible import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}