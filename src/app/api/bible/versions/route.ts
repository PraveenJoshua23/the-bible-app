import { NextResponse } from 'next/server';

const API_URL = 'https://api.scripture.api.bible/v1';
const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY;

export async function GET() {
    try {
        console.log('API Key present:', !!process.env.NEXT_PUBLIC_BIBLE_API_KEY);
        const response = await fetch(`${API_URL}/bibles`, {
            headers: {
                'api-key': API_KEY!
            },
            next: {
                revalidate: 3600 // Cache for 1 hour
            }
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Bible versions fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bible versions' },
            { status: 500 }
        );
    }
}