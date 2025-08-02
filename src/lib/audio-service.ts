import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { AudioError, AudioDevice, AudioApplication } from '@/types/audio';

const execAsync = promisify(exec);

export class AudioService {
  private svclPath: string;
  private getNirPath: string;

  constructor() {
    // Path to svcl.exe and GetNir.exe in project root
    this.svclPath = path.join(process.cwd(), 'svcl.exe');
    this.getNirPath = path.join(process.cwd(), 'GetNir.exe');
  }

  private async execWithLogging(command: string): Promise<{ stdout: string; stderr: string }> {
    console.log('[AudioService] Executing command:', command);
    try {
      const result = await execAsync(command);
      console.log('[AudioService] Command output:', result.stdout.substring(0, 200) + (result.stdout.length > 200 ? '...' : ''));
      return result;
    } catch (error) {
      console.error('[AudioService] Command failed:', error);
      throw error;
    }
  }

  private sanitizeDevice(device: string): string {
    // Remove any potentially dangerous characters
    return device.replace(/[^a-zA-Z0-9\s\-_]/g, '');
  }

  private validateVolume(volume: number): number {
    return Math.max(0, Math.min(100, Math.round(volume)));
  }

  private async executeCommand(args: string[]): Promise<string> {
    const command = `"${this.svclPath}" ${args.join(' ')}`;
    
    try {
      const { stdout, stderr } = await this.execWithLogging(command);
      if (stderr && !stdout) {
        throw new Error(stderr);
      }
      return stdout.trim();
    } catch (error) {
      console.error('AudioService command error:', error);
      throw this.createError(error);
    }
  }

  private createError(error: unknown): AudioError {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    let code: AudioError['code'] = 'UNKNOWN_ERROR';
    if (message.includes('not found') || message.includes('cannot find')) {
      code = 'DEVICE_NOT_FOUND';
    } else if (message.includes('volume')) {
      code = 'INVALID_VOLUME';
    } else if (message.includes('command')) {
      code = 'COMMAND_FAILED';
    }
    
    return { message, code };
  }

  async setVolume(device: string, volume: number): Promise<void> {
    const sanitizedDevice = this.sanitizeDevice(device);
    const validVolume = this.validateVolume(volume);
    
    await this.executeCommand([
      '/SetVolume',
      `"${sanitizedDevice}"`,
      validVolume.toString()
    ]);
  }

  async getVolume(device: string): Promise<{ volume: number; muted: boolean }> {
    const sanitizedDevice = this.sanitizeDevice(device);
    
    // Get volume percentage
    const volumeOutput = await this.executeCommand([
      '/GetPercent',
      `"${sanitizedDevice}"`,
      '/Stdout'
    ]);
    
    // Get mute state
    const muteOutput = await this.executeCommand([
      '/GetMute',
      `"${sanitizedDevice}"`,
      '/Stdout'
    ]);
    
    // Parse volume (should be a number)
    const volume = parseInt(volumeOutput) || 0;
    
    // Parse mute state (should be "1" for muted, "0" for unmuted)
    const muted = muteOutput.trim() === '1';
    
    return { volume, muted };
  }

  async mute(device: string): Promise<void> {
    const sanitizedDevice = this.sanitizeDevice(device);
    
    await this.executeCommand([
      '/Mute',
      `"${sanitizedDevice}"`
    ]);
  }

  async unmute(device: string): Promise<void> {
    const sanitizedDevice = this.sanitizeDevice(device);
    
    await this.executeCommand([
      '/Unmute',
      `"${sanitizedDevice}"`
    ]);
  }

  async setMute(device: string, mute: boolean): Promise<void> {
    if (mute) {
      await this.mute(device);
    } else {
      await this.unmute(device);
    }
  }

  async getDevices(): Promise<{ devices: AudioDevice[]; defaultDevice: string }> {
    try {
      // Use piped command to get device info
      const command = `"${this.svclPath}" /scomma "" /Columns "Name,Default,Device Name,Command-Line Friendly ID,Volume Percent" | "${this.getNirPath}" "Device Name,Name,Volume Percent,Default" "Default=Render"`;
      const { stdout } = await this.execWithLogging(command);
      
      // Parse CSV content
      const lines = stdout.split('\n').filter(line => line.trim());
      const devices: AudioDevice[] = [];
      let defaultDevice = '';
      let defaultDeviceActualName = '';
      
      for (const line of lines) {
        // Parse TSV line - GetNir outputs tab-separated values
        const parts = this.parseTSVLine(line);
        
        if (parts.length >= 4) {
          const [deviceName, name, volumeStr, defaultStatus] = parts;
          const volume = parseFloat(volumeStr) || 0;
          const isDefault = defaultStatus.toLowerCase() === 'render';
          
          devices.push({
            name: name.trim(),
            deviceName: deviceName.trim(),
            id: name.trim(), // Using name as ID for now
            volume,
            isDefault,
            type: 'render'
          });
          
          if (isDefault) {
            defaultDevice = name.trim();
            defaultDeviceActualName = deviceName.trim();
          }
        }
      }
      
      // No longer adding DefaultRenderDevice to the list - we just return the actual default device name
      
      // Return the actual default device name, not the placeholder
      return { devices, defaultDevice: defaultDevice || 'DefaultRenderDevice' };
    } catch (error) {
      console.error('Failed to get devices:', error);
      // Return empty array with error info - let the API layer handle the fallback
      throw this.createError(error);
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current) {
      result.push(current.trim());
    }
    
    return result;
  }

  private parseTSVLine(line: string): string[] {
    // GetNir outputs tab-separated values
    return line.split('\t').map(field => field.trim());
  }

  async getApplications(): Promise<AudioApplication[]> {
    try {
      // Use piped command to get application info - only show applications that are playing audio (Direction=Render)
      const command = `"${this.svclPath}" /scomma "" /Columns "Name,Type,Process Path,Volume Percent,Direction" | "${this.getNirPath}" "Name,Volume Percent,Process Path" "Type=Application && 'Process Path' EndsWith .exe && Direction=Render"`;
      
      const { stdout } = await this.execWithLogging(command);
      
      // Parse CSV content
      const lines = stdout.split('\n').filter(line => line.trim());
      const applications: AudioApplication[] = [];
      const appMap = new Map<string, number>(); // Track instances per process path
      
      for (const line of lines) {
        // Parse TSV line - GetNir outputs tab-separated values
        const parts = this.parseTSVLine(line);
        
        if (parts.length >= 3) {
          const [name, volumeStr, processPath] = parts;
          const volume = parseFloat(volumeStr) || 0;
          
          // Handle multiple instances
          const instanceCount = appMap.get(processPath) || 0;
          appMap.set(processPath, instanceCount + 1);
          
          applications.push({
            name: name.trim(),
            processPath: processPath.trim(),
            volume,
            instanceId: instanceCount > 0 ? `instance-${instanceCount}` : undefined
          });
        }
      }
      
      return applications;
    } catch (error) {
      console.error('Failed to get applications:', error);
      return [];
    }
  }

  async setApplicationVolume(processPath: string, volume: number, _instanceId?: string): Promise<void> {
    const validVolume = this.validateVolume(volume);
    
    // For applications, we use the process name (filename) as the identifier
    const processName = path.basename(processPath);
    
    try {
      // If there are multiple instances, we might need to handle it differently
      // For now, setting by process name will affect all instances
      await this.executeCommand([
        '/SetVolume',
        `"${processName}"`,
        validVolume.toString()
      ]);
    } catch (error) {
      // If the error is about not finding the app, throw a specific error
      const errorObj = this.createError(error);
      if (errorObj.message.includes('not found')) {
        errorObj.message = `Application ${processName} not found`;
        errorObj.code = 'APPLICATION_NOT_FOUND';
      }
      throw errorObj;
    }
  }
}