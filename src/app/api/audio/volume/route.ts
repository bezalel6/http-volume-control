import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';
import { VolumeRequest, VolumeResponse, GetVolumeResponse } from '@/types/audio';

const audioService = new AudioService();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const device = searchParams.get('device') || 'Speakers';
  
  try {
    const { volume, muted } = await audioService.getVolume(device);
    
    const response: GetVolumeResponse = {
      success: true,
      device,
      volume,
      muted,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: GetVolumeResponse = {
      success: false,
      device,
      volume: 0,
      muted: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to get volume'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VolumeRequest = await request.json();
    const { device, volume } = body;
    
    if (!device || volume === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: device and volume' },
        { status: 400 }
      );
    }
    
    if (volume < 0 || volume > 100) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 100' },
        { status: 400 }
      );
    }
    
    await audioService.setVolume(device, volume);
    
    const response: VolumeResponse = {
      success: true,
      device,
      volume,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: VolumeResponse = {
      success: false,
      device: '',
      volume: 0,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to set volume'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}