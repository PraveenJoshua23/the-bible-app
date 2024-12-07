
import React from 'react';
import { themes, fonts, fontSizes } from '../utils/themes';
import type { BiblePassage, Settings } from '../types/bible';
import { formatReference } from '../utils/referenceFormatter';

interface BibleContentProps {
    result: BiblePassage | null;
    loading: boolean;
    error: string;
    settings: Settings;
    theme: keyof typeof themes;
    query: string; 
}

export const BibleContent: React.FC<BibleContentProps> = ({
    result,
    loading,
    error,
    settings,
    theme,
    query
}) => {
    return (
        <div className="pt-16 md:pt-24 pb-8">
            <div className={`max-w-2xl mx-auto px-4 py-8 rounded-md ${themes[theme].contentBg}`}>
                {loading && <LoadingState theme={theme} />}
                {error && <ErrorState error={error} theme={theme} />}
                {result && !loading && (
                    <PassageContent
                        result={result}
                        settings={settings}
                        theme={theme}
                        query={query}
                    />
                )}
                {!result && !loading && !error && (
                    <EmptyState theme={theme} />
                )}
            </div>
        </div>
    );
};

// Sub-components
const LoadingState: React.FC<{ theme: keyof typeof themes }> = ({ theme }) => (
    <div 
        className={`
            text-center p-8 rounded-lg
            ${themes[theme].text} 
            animate-pulse
        `}
        role="status"
        aria-label="Loading passage"
    >
        <div className="space-y-4">
            <div className="h-6 w-3/4 mx-auto bg-gray-200 rounded"></div>
            <div className="space-y-3">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
        </div>
        <span className="sr-only">Loading...</span>
    </div>
);

const ErrorState: React.FC<{ 
    error: string; 
    theme: keyof typeof themes;
}> = ({ error, theme }) => (
    <div
        className={`
            text-center p-6 rounded-lg
            ${themes[theme].error}
        `}
        role="alert"
    >
        <span className="font-medium">Error: </span>
        {error}
    </div>
);

const EmptyState: React.FC<{ theme: keyof typeof themes }> = ({ theme }) => (
    <div className={`
        text-center ${themes[theme].text} text-lg
        p-8 rounded-lg border-2 border-dashed
        ${themes[theme].dropdownBg}
    `}>
        <p>Enter a reference to start reading</p>
        <p className="text-sm mt-2 opacity-70">
        Example: &quot;jn 3:16&quot; or &quot;rv 21:1-4&quot;
        </p>
    </div>
);

interface PassageContentProps {
    result: BiblePassage;
    settings: Settings;
    theme: keyof typeof themes;
    query: string;
}


const PassageContent: React.FC<PassageContentProps> = ({
    result,
    settings,
    theme,
    query
}) => {
    // Format the reference using our new utility with original query
    const formattedReference = formatReference(result.reference, query);

    return (
        <div className={`${fonts[settings.font]} leading-relaxed`}>
            <h2 className={`
                text-2xl font-semibold mb-6 text-center
                ${themes[theme].text}
            `}>
                {formattedReference}
            </h2>
            <div className={fontSizes[settings.fontSize]}>
                {formatContent(result.content, settings)}
            </div>
        </div>
    );
};

// Helper function to format the Bible content
const formatContent = (content: string, settings: Settings) => {
    // Clean the HTML and remove special characters
    const cleanContent = content
        .replace(/<p.*?>/g, '') // Remove p tags
        .replace(/<\/p>/g, '\n') // Replace closing p tags with newlines
        .replace(/¶/g, '') // Remove paragraph marks
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();

    // Split into verses (verse numbers in brackets [1], [2], etc.)
    const verses = cleanContent.split(/\[(\d+)\]/).filter(Boolean);

    if (settings.verseDisplay === 'paragraph') {
        return (
            <div className="space-y-4">
                {verses.map((verse, index) => {
                    // If it's a verse number and we want to show verse numbers
                    if (!isNaN(Number(verse)) && settings.showVerseNumbers) {
                        return (
                            <sup 
                                key={`num-${index}`} 
                                className="text-gray-500 mr-1"
                            >
                                {verse}
                            </sup>
                        );
                    }
                    // If it's the verse content
                    if (isNaN(Number(verse))) {
                        return (
                            <span key={`content-${index}`}>
                                {verse.trim()}{' '}
                            </span>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }

    // List view
    return (
        <div className="space-y-4">
            {verses.reduce((acc: JSX.Element[], verse, index, array) => {
                if (!isNaN(Number(verse))) {
                    // If it's a verse number and there's content after it
                    if (index + 1 < array.length) {
                        acc.push(
                            <div 
                                key={`verse-${verse}`} 
                                className="flex items-start gap-2"
                            >
                                {settings.showVerseNumbers && (
                                    <sup className="text-gray-500 mt-1">
                                        {verse}
                                    </sup>
                                )}
                                <span>{array[index + 1].trim()}</span>
                            </div>
                        );
                    }
                }
                return acc;
            }, [])}
        </div>
    );
};

// Optional: Animation variants for content transitions
// const contentVariants = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     exit: { opacity: 0, y: -20 }
// };

export default BibleContent;