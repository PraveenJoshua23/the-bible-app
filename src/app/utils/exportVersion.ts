import fs from 'fs/promises';
import path from 'path';

interface VersionExport {
  id: string;
  name: string;
  nameLocal: string;
  abbreviation: string;
  abbreviationLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  type: string;
  updatedAt: string;
  copyright: string;
  info: string;
  contents: Array<{
    book: string;
    chapter: number;
    content: string;
  }>;
}

interface Chapter {
  text: string;
}

interface Book {
  chapters: Record<string, Chapter>;
}

interface Progress {
  books: Record<string, Book>;
}

export async function exportVersion(
  details: {
    name: string;
    abbreviation: string;
    copyright?: string;
    info?: string;
  }
) {
  try {
    // Read the progress file
    const progressPath = path.join(process.cwd(), 'src/bible-import/processed/progress.json');
    const progressData = await fs.readFile(progressPath, 'utf-8');
    const progress: Progress = JSON.parse(progressData);

    // Create the version export
    const versionExport: VersionExport = {
      id: `custom-${details.abbreviation.toLowerCase()}`,
      name: details.name,
      nameLocal: details.name,
      abbreviation: details.abbreviation,
      abbreviationLocal: details.abbreviation,
      language: {
        id: "eng",
        name: "English",
        nameLocal: "English",
        script: "Latin",
        scriptDirection: "LTR"
      },
      countries: [{
        id: "WLD",
        name: "World",
        nameLocal: "World"
      }],
      type: "text",
      updatedAt: new Date().toISOString(),
      copyright: details.copyright || "",
      info: details.info || "",
      contents: []
    };

    // Convert the progress data into the Bible app format
    Object.entries(progress.books).forEach(([bookId, bookData]: [string, Book]) => {
      Object.entries(bookData.chapters).forEach(([chapter, chapterData]: [string, Chapter]) => {
        versionExport.contents.push({
          book: bookId,
          chapter: parseInt(chapter),
          content: chapterData.text
        });
      });
    });

    // Sort contents by book and chapter
    versionExport.contents.sort((a, b) => {
      if (a.book !== b.book) return a.book.localeCompare(b.book);
      return a.chapter - b.chapter;
    });

    // Validate completeness
    const totalChapters = versionExport.contents.length;
    if (totalChapters !== 1189) {
      console.warn(`Warning: Bible version is incomplete. Found ${totalChapters} chapters out of 1189.`);
    }

    // Save the exported version
    const exportDir = path.join(process.cwd(), 'public/bibles');
    await fs.mkdir(exportDir, { recursive: true });
    
    const exportPath = path.join(exportDir, `${details.abbreviation.toLowerCase()}.json`);
    await fs.writeFile(exportPath, JSON.stringify(versionExport, null, 2));

    console.log(`Version exported successfully to ${exportPath}`);
    console.log(`Total chapters: ${totalChapters}`);
    return exportPath;

  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}