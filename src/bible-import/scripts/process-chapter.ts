import { BibleVersionProcessor } from '@/bible-import/utils/BibleVersionProcessor';
import fs from 'fs/promises';
import path from 'path';

async function processChapter(
    processor: BibleVersionProcessor,
    bookAbbr: string,
    chapterNum: number,
    chapterText: string
) {
    try {
        await processor.addChapter(bookAbbr, chapterNum, chapterText);
        
        // Save progress after each chapter
        const progress = processor.getProgress();
        await fs.writeFile(
            path.join(__dirname, '../processed/progress.json'),
            JSON.stringify(progress, null, 2)
        );
        
        console.log(`Successfully processed ${bookAbbr} ${chapterNum}`);
        console.log(`Progress: ${progress.completedChapters}/${progress.totalChapters} chapters`);
    } catch (error) {
        console.error(`Error processing ${bookAbbr} ${chapterNum}:`, error);
        throw error;
    }
}

export  {processChapter};