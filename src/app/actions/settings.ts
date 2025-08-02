'use server';

import { SettingsService } from '@/lib/settings-service';
import { Settings } from '@/types/settings';

const settingsService = new SettingsService();

// Type for action results
type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSettings(): Promise<ActionResult<Settings>> {
  try {
    const settings = await settingsService.loadSettings();
    return { success: true, data: settings };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to load settings' 
    };
  }
}

export async function updateSettings(updates: Partial<Settings>): Promise<ActionResult<Settings>> {
  try {
    const settings = await settingsService.updateSettings(updates);
    return { success: true, data: settings };
  } catch (error) {
    console.error('Failed to update settings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update settings' 
    };
  }
}