import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';
import { DeviceListResponse } from '@/types/audio';

const audioService = new AudioService();

export async function GET(request: NextRequest) {
  try {
    const { devices, defaultDevice } = await audioService.getDevices();
    
    const response: DeviceListResponse = {
      success: true,
      devices,
      defaultDevice,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to get audio devices:', error);
    
    // Try to get at least the default device name from system
    let defaultDeviceName = 'System Default Audio Device';
    
    const response: DeviceListResponse = {
      success: false,
      devices: [],
      defaultDevice: defaultDeviceName,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to get device list'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}