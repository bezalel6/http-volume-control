import { NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';

// GET /api/audio/processes
export async function GET() {
  try {
    const audioService = new AudioService();
    const processes = await audioService.getAllProcesses();
    
    return NextResponse.json({
      success: true,
      processes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get processes:', error);
    
    return NextResponse.json(
      {
        success: false,
        processes: [],
        error: error instanceof Error ? error.message : 'Failed to get processes',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}