import type { 
    BibleVersion, 
    BibleVersionWithFavorite,
    CustomBibleVerse,
    CustomBibleChapter
  } from '../types/bible';


export const getBibleVersions = async (): Promise<BibleVersionWithFavorite[]> => {
    try {
        // Fetch versions from API.bible
        const response = await fetch('/api/bible/versions');
        if (!response.ok) throw new Error('Failed to fetch Bible versions');
        const { data: apiVersions } = await response.json();
    
        // Get list of custom Bible versions
        const customVersions = await getCustomBibleVersions();
    
        // Combine API versions with custom versions
        const allVersions = [...apiVersions, ...customVersions];
    
        // Return versions with favorite flag
        return allVersions.map(version => ({
          ...version,
          isFavorite: false
        }));
    
      } catch (error) {
        console.error('Error fetching Bible versions:', error);
        throw error;
      }
  };

  const CUSTOM_BIBLE_FILES: Record<string, string> = {
    'TAOVBSI': 'tamil-bible',
    // Add more mappings as you add more versions
    // 'TEOVBSI': 'telugu-bible',
    // 'HIOVBSI': 'hindi-bible',
  };

  export const getBiblePassage = async (
    bibleId: string, 
    passageId: string, 
    showVerseNumbers: boolean
  ): Promise<{
    data: {
      id: string;
      bibleId: string;
      bookId: string;
      chapterId: string;
      reference: string;
      content: string;
      verseCount: number;
      copyright: string;
    };
  }> => {
    // Debug logs
    // console.log('Fetching passage:', { bibleId, passageId, showVerseNumbers });
  
   // Check if it's a custom Bible version (not from API.bible)
   if (bibleId.endsWith('BSI')) {
    try {
      const fileName = CUSTOM_BIBLE_FILES[bibleId];
      if (!fileName) {
        throw new Error(`No file mapping found for Bible ID: ${bibleId}`);
      }

      // Import the custom Bible data using the mapped filename
      const { default: customBible } = await import(`../data/${fileName}.json`);

      const [book, chapter, verseRange] = passageId.split('.');

      const bookData = customBible.data.books.find((b: { id: string; }) => b.id === book);
      if (!bookData) {
        throw new Error(`Book ${book} not found`);
      }

      // Assert that this is a custom Bible chapter
      const chapterData = (bookData.chapters.find((c: { number: string; }) => c.number === chapter)) as CustomBibleChapter;
      if (!chapterData) {
        throw new Error(`Chapter ${chapter} not found in ${book}`);
      }

      let verses: CustomBibleVerse[];
      if (verseRange) {
        const [start, end] = verseRange.split('-').map(Number);

        if (end) {
          verses = (chapterData.verses as CustomBibleVerse[]).filter(v => {
            const verseNum = Number(v.id.split('.')[2]);
            return verseNum >= start && verseNum <= end;
          });
        } else {
          verses = (chapterData.verses as CustomBibleVerse[]).filter(v => {
            const verseNum = Number(v.id.split('.')[2]);
            return verseNum === start;
          });
        }
      } else {
        verses = chapterData.verses as CustomBibleVerse[];
      }

      if (!verses.length) {
        throw new Error('No verses found for the given reference');
      }

      const content = verses.map(verse => {
        const verseNumber = verse.id.split('.')[2];
        const verseContentWithoutNumber = verse.content.replace(/^\d+\s*/, '');
        return `${showVerseNumbers ? `[${verseNumber}] ` : ''}${verseContentWithoutNumber}`;
      }).join(' ');

      return {
        data: {
          id: passageId,
          bibleId,
          bookId: book,
          chapterId: `${book}.${chapter}`,
          reference: chapterData.reference,
          content: content,
          verseCount: verses.length,
          copyright: customBible.data.copyright || ''
        }
      };
    } catch (error) {
      console.error('Error fetching custom Bible passage:', error);
      throw error;
    }
  }

    // API.bible fetch
    const response = await fetch(
        `/api/bible/passage?` + 
        new URLSearchParams({
        bibleId,
        passageId,
        showVerseNumbers: showVerseNumbers.toString()
        })
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch passage');
    }

    return response.json();
  };

  // Helper function to get custom Bible versions
// Helper function to get custom Bible versions
const getCustomBibleVersions = async (): Promise<BibleVersion[]> => {
    try {
      // Use the IDs from our mapping
      const customBibleIds = Object.keys(CUSTOM_BIBLE_FILES);
      
      const versions = await Promise.all(
        customBibleIds.map(async (id) => {
          const fileName = CUSTOM_BIBLE_FILES[id];
          const { default: bibleData } = await import(`../data/${fileName}.json`);
          return bibleData.data;
        })
      );
  
      return versions;
    } catch (error) {
      console.error('Error loading custom Bible versions:', error);
      return [];
    }
  };