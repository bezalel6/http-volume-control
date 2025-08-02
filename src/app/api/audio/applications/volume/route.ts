import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';
import { ApplicationVolumeRequest, ApplicationVolumeResponse } from '@/types/audio';

const audioService = new AudioService();

export async function POST(request: NextRequest) {
  try {
    const body: ApplicationVolumeRequest = await request.json();
    const { processPath, volume, instanceId } = body;
    
    if (!processPath || volume === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: processPath and volume' },
        { status: 400 }
      );
    }
    
    if (volume < 0 || volume > 100) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    await audioService.setApplicationVolume(processPath, volume, instanceId);
    
    const response: ApplicationVolumeResponse = {
      success: true,
      processPath,
      volume,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApplicationVolumeResponse = {
      success: false,
      processPath: '',
      volume: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to set application volume'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}