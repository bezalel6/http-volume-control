import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@/lib/audio-service';
import { ApplicationListResponse } from '@/types/audio';

const audioService = new AudioService();

export async function GET(request: NextRequest) {
  try {
    const applications = await audioService.getApplications();
    
    const response: ApplicationListResponse = {
      success: true,
      applications,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApplicationListResponse = {
      success: false,
      applications: [],
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Failed to get applications'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}