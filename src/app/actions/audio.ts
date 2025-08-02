'use server';

import { AudioService } from '@/lib/audio-service';
import { 
  AudioDevice, 
  AudioApplication,
  AudioProcess,
  AudioError
} from '@/types/audio';

const audioService = new AudioService();

// Type for action results
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function getDevices(): Promise<ActionResult<{ devices: AudioDevice[]; defaultDevice: string }>> {
  try {
    const result = await audioService.getDevices();
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to get devices:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get device list' 
    };
  }
}

export async function getVolume(device: string): Promise<ActionResult<{ volume: number; muted: boolean }>> {
  try {
    const result = await audioService.getVolume(device);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to get volume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get volume' 
    };
  }
}

export async function setVolume(device: string, volume: number): Promise<ActionResult<void>> {
  try {
    // Validate volume range
    if (volume < 0 || volume > 100) {
      return { success: false, error: 'Volume must be between 0 and 100' };
    }
    
    await audioService.setVolume(device, volume);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to set volume:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set volume' 
    };
  }
}

export async function setMute(device: string, mute: boolean): Promise<ActionResult<void>> {
  try {
    await audioService.setMute(device, mute);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to set mute state:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set mute state' 
    };
  }
}

export async function getApplications(): Promise<ActionResult<AudioApplication[]>> {
  try {
    const applications = await audioService.getApplications();
    return { success: true, data: applications };
  } catch (error) {
    console.error('Failed to get applications:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get applications' 
    };
  }
}
  
export async function setApplicationVolume(
  processPath: string, 
  volume: number
): Promise<ActionResult<void>> {
  try {
    // Validate volume range
    if (volume < 0 || volume > 100) {
      return { success: false, error: 'Volume must be between 0 and 100' };
    }
    
    await audioService.setApplicationVolume(processPath, volume);
    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to set application volume:', error);
    const audioError = error as AudioError;
    return { 
      success: false, 
      error: audioError.message || 'Failed to set application volume' 
    };
  }
}

export async function getAllProcesses(): Promise<ActionResult<AudioProcess[]>> {
  try {
    const processes = await audioService.getAllProcesses();
    return { success: true, data: processes };
  } catch (error) {
    console.error('Failed to get all processes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get processes' 
    };
  }
}