import { NextResponse } from 'next/server';
import { exportVersion } from '../../../utils/exportVersion';

export async function POST(request: Request) {
  try {
    const { name, abbreviation, copyright, info } = await request.json();
    
    const exportPath = await exportVersion({
      name,
      abbreviation,
      copyright,
      info
    });

    return NextResponse.json({ 
      success: true,
      path: exportPath
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}