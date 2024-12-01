import { processChapter } from "./process-chapter";
import { initializeVersion } from './init-version';

async function main() {
    try {
        // Initialize your version
        const processor = await initializeVersion(
            "Your Bible Version Name",
            "YBV",
            "en"
        );

        // Example of processing a chapter
        const sampleChapter = `[1]First verse text here. [2]Second verse text here.`;
        await processChapter(processor, 'gen', 1, sampleChapter);

        console.log('Successfully processed chapter');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();