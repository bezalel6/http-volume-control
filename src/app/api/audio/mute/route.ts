import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';
import { MuteRequest, MuteResponse } from '@/types/audio';

const audioService = new AudioService();

export async function POST(request: NextRequest) {
  try {
    const body: MuteRequest = await request.json();
    const { device, mute } = body;
    
    if (!device || mute === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: device and mute' },
        { status: 400 }
      );
    }
    
    await audioService.setMute(device, mute);
    
    const response: MuteResponse = {
      success: true,
      device,
      muted: mute,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: MuteResponse = {
      success: false,
      device: '',
      muted: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to set mute state'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}