import {
  VolumeRequest,
  VolumeResponse,
  MuteRequest,
  MuteResponse,
  GetVolumeResponse,
  DeviceListResponse,
  ApplicationListResponse,
  ApplicationVolumeRequest,
  ApplicationVolumeResponse
} from '@/types/audio';

class AudioAPIClient {
  private baseUrl = '/api/audio';

  async getVolume(device: string): Promise<GetVolumeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/volume?device=${encodeURIComponent(device)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get volume');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        device,
        volume: 0,
        muted: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async setVolume(device: string, volume: number): Promise<VolumeResponse> {
    try {
      const request: VolumeRequest = { device, volume };
      
      const response = await fetch(`${this.baseUrl}/volume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set volume');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        device,
        volume,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async setMute(device: string, mute: boolean): Promise<MuteResponse> {
    try {
      const request: MuteRequest = { device, mute };
      
      const response = await fetch(`${this.baseUrl}/mute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set mute state');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        device,
        muted: mute,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async getDevices(): Promise<DeviceListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/devices`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get device list');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        devices: [],
        defaultDevice: 'DefaultRenderDevice',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async getApplications(): Promise<ApplicationListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/applications`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get applications');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        applications: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  async setApplicationVolume(
    processPath: string, 
    volume: number, 
    instanceId?: string
  ): Promise<ApplicationVolumeResponse> {
    try {
      const request: ApplicationVolumeRequest = { processPath, volume, instanceId };
      
      const response = await fetch(`${this.baseUrl}/applications/volume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to set application volume');
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        processPath,
        volume,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }
}

export const audioAPI = new AudioAPIClient();