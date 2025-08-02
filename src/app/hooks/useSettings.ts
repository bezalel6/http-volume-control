'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, defaultSettings } from '@/types/settings';
import * as actions from '@/app/actions/settings';

interface UseSettingsState {
  settings: Settings;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

interface UseSettingsActions {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

export type UseSettingsReturn = UseSettingsState & UseSettingsActions;

export function useSettings(): UseSettingsReturn {
  const [state, setState] = useState<UseSettingsState>({
    settings: defaultSettings,
    loading: true,
    saving: false,
    error: null,
  });

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const result = await actions.getSettings();
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        settings: result.data,
        loading: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: result.error,
      }));
    }
  }, []);

  // Update a single setting
  const updateSetting = useCallback(async <K extends keyof Settings>(
    key: K, 
    value: Settings[K]
  ) => {
    setState(prev => ({ ...prev, saving: true, error: null }));
    
    const updates = { [key]: value } as Partial<Settings>;
    const result = await actions.updateSettings(updates);
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        settings: result.data,
        saving: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        saving: false,
        error: result.error,
      }));
    }
  }, []);

  // Reload settings from server
  const reloadSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    ...state,
    updateSetting,
    reloadSettings,
  };
}