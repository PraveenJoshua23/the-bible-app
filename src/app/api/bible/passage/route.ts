import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY;

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const bibleId = searchParams.get('bibleId');
        const passageId = searchParams.get('passageId');
        const showVerseNumbers = searchParams.get('showVerseNumbers');

        if (!bibleId || !passageId) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${API_URL}/bibles/${bibleId}/passages/${passageId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=${showVerseNumbers}`,
            {
                headers: {
                    'api-key': API_KEY!
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Bible passage fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bible passage' },
            { status: 500 }
        );
    }
}