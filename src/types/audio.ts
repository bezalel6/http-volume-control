// Audio API Types

export interface VolumeRequest {
  device: string;
  volume: number; // 0-100
}

export interface VolumeResponse {
  success: boolean;
  device: string;
  volume: number;
  timestamp: string;
  error?: string;
}

export interface MuteRequest {
  device: string;
  mute: boolean;
}

export interface MuteResponse {
  success: boolean;
  device: string;
  muted: boolean;
  timestamp: string;
  error?: string;
}

export interface GetVolumeRequest {
  device: string;
}

export interface GetVolumeResponse {
  success: boolean;
  device: string;
  volume: number;
  muted: boolean;
  timestamp: string;
  error?: string;
}

export interface AudioDevice {
  name: string;
  deviceName: string;
  id: string;
  volume: number;
  isDefault: boolean;
  type: 'render' | 'capture';
}

export interface DeviceListResponse {
  success: boolean;
  devices: AudioDevice[];
  defaultDevice: string;
  timestamp: string;
  error?: string;
}

export interface AudioApplication {
  name: string;
  processPath: string;
  volume: number;
  instanceId?: string;
  iconPath?: string;
}

export interface ApplicationListResponse {
  success: boolean;
  applications: AudioApplication[];
  timestamp: string;
  error?: string;
}

export interface ApplicationVolumeRequest {
  processPath: string;
  volume: number;
  instanceId?: string;
}

export interface ApplicationVolumeResponse {
  success: boolean;
  processPath: string;
  volume: number;
  timestamp: string;
  error?: string;
}

export interface AudioError {
  message: string;
  code: 'DEVICE_NOT_FOUND' | 'INVALID_VOLUME' | 'COMMAND_FAILED' | 'UNKNOWN_ERROR' | 'APPLICATION_NOT_FOUND';
}

export interface AudioProcess {
  name: string;
  processPath: string;
  iconPath?: string;
  isActive: boolean; // Currently playing audio
}

export interface ProcessListResponse {
  success: boolean;
  processes: AudioProcess[];
  timestamp: string;
  error?: string;
}