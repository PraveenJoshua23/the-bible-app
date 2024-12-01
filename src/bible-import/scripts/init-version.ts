import { BibleVersionProcessor } from '@/bible-import/utils/BibleVersionProcessor';
import fs from 'fs/promises';
import path from 'path';

async function initializeVersion(
    name: string,
    abbreviation: string,
    language: string = 'en'
) {
    const processor = new BibleVersionProcessor({
        name,
        abbreviation,
        language
    });

    // Create necessary directories
    const dirs = ['data', 'processed'];
    for (const dir of dirs) {
        await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
    }

    // Save initial state
    await fs.writeFile(
        path.join(__dirname, '../processed/version-info.json'),
        JSON.stringify({
            name,
            abbreviation,
            language,
            created: new Date().toISOString()
        }, null, 2)
    );

    return processor;
}

export { initializeVersion};