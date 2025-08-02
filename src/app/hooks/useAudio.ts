'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AudioDevice, AudioApplication } from '@/types/audio';
import * as actions from '@/app/actions/audio';

interface UseAudioState {
  // Device state
  devices: AudioDevice[];
  defaultDevice: string;
  currentDevice: string;
  volume: number;
  muted: boolean;
  
  // Application state
  applications: AudioApplication[];
  
  // Loading states
  loadingDevices: boolean;
  loadingApplications: boolean;
  loadingVolume: boolean;
  
  // Error state
  error: string | null;
}

interface UseAudioActions {
  // Device actions
  loadDevices: () => Promise<void>;
  loadVolume: (device?: string) => Promise<void>;
  setDevice: (device: string) => void;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setMute: (mute: boolean) => Promise<void>;
  
  // Application actions
  loadApplications: () => Promise<void>;
  setApplicationVolume: (app: AudioApplication, volume: number) => Promise<void>;
  
  // Utility
  refresh: () => Promise<void>;
  clearError: () => void;
}

export type UseAudioReturn = UseAudioState & UseAudioActions;

// Debounce hook
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]) as T;
}

export function useAudio(): UseAudioReturn {
  // State
  const [state, setState] = useState<UseAudioState>({
    devices: [],
    defaultDevice: 'DefaultRenderDevice',
    currentDevice: 'DefaultRenderDevice',
    volume: 50,
    muted: false,
    applications: [],
    loadingDevices: false,
    loadingApplications: false,
    loadingVolume: false,
    error: null,
  });

  // Volume update queue for optimistic updates
  const volumeUpdateRef = useRef<{ device: string; volume: number } | null>(null);

  // Load devices
  const loadDevices = useCallback(async () => {
    setState(prev => ({ ...prev, loadingDevices: true, error: null }));
    
    const result = await actions.getDevices();
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        devices: result.data.devices,
        defaultDevice: result.data.defaultDevice,
        loadingDevices: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loadingDevices: false,
        error: result.error,
      }));
    }
  }, []);

  // Load volume for current device
  const loadVolume = useCallback(async (device?: string) => {
    const targetDevice = device || state.currentDevice;
    setState(prev => ({ ...prev, loadingVolume: true, error: null }));
    
    const result = await actions.getVolume(targetDevice);
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        volume: result.data.volume,
        muted: result.data.muted,
        loadingVolume: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loadingVolume: false,
        error: result.error,
      }));
    }
  }, [state.currentDevice]);

  // Load applications
  const loadApplications = useCallback(async () => {
    setState(prev => ({ ...prev, loadingApplications: true, error: null }));
    
    const result = await actions.getApplications();
    
    if (result.success) {
      setState(prev => ({
        ...prev,
        applications: result.data,
        loadingApplications: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        loadingApplications: false,
        error: result.error,
      }));
    }
  }, []);

  // Set current device
  const setDevice = useCallback((device: string) => {
    setState(prev => ({ ...prev, currentDevice: device }));
  }, []);

  // Internal volume setter (not debounced)
  const setVolumeInternal = useCallback(async (volume: number) => {
    volumeUpdateRef.current = { device: state.currentDevice, volume };
    
    const result = await actions.setVolume(state.currentDevice, volume);
    
    // Only update if this is still the latest update
    if (volumeUpdateRef.current?.volume === volume) {
      if (!result.success) {
        // Revert on error
        await loadVolume();
        setState(prev => ({ ...prev, error: result.error }));
      }
      volumeUpdateRef.current = null;
    }
  }, [state.currentDevice, loadVolume]);

  // Debounced volume setter for UI
  const setVolume = useDebounce(async (volume: number) => {
    // Optimistic update
    setState(prev => ({ ...prev, volume, error: null }));
    await setVolumeInternal(volume);
  }, 100);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    const newMuted = !state.muted;
    
    // Optimistic update
    setState(prev => ({ ...prev, muted: newMuted, error: null }));
    
    const result = await actions.setMute(state.currentDevice, newMuted);
    
    if (!result.success) {
      // Revert on error
      setState(prev => ({ 
        ...prev, 
        muted: !newMuted,
        error: result.error 
      }));
    }
  }, [state.currentDevice, state.muted]);

  // Set mute state
  const setMute = useCallback(async (mute: boolean) => {
    setState(prev => ({ ...prev, muted: mute, error: null }));
    
    const result = await actions.setMute(state.currentDevice, mute);
    
    if (!result.success) {
      setState(prev => ({ 
        ...prev, 
        muted: !mute,
        error: result.error 
      }));
    }
  }, [state.currentDevice]);

  // Set application volume
  const setApplicationVolume = useCallback(async (
    app: AudioApplication, 
    volume: number
  ) => {
    // Optimistic update
    setState(prev => ({
      ...prev,
      applications: prev.applications.map(a =>
        a.processPath === app.processPath && a.instanceId === app.instanceId
          ? { ...a, volume }
          : a
      ),
      error: null,
    }));
    
    const result = await actions.setApplicationVolume(
      app.processPath, 
      volume, 
      app.instanceId
    );
    
    if (!result.success) {
      // Revert on error
      setState(prev => ({
        ...prev,
        applications: prev.applications.map(a =>
          a.processPath === app.processPath && a.instanceId === app.instanceId
            ? { ...a, volume: app.volume }
            : a
        ),
        error: result.error,
      }));
    }
  }, []);

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      loadDevices(),
      loadApplications(),
      loadVolume(),
    ]);
  }, [loadDevices, loadApplications, loadVolume]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Load initial data
  useEffect(() => {
    loadDevices();
    loadApplications();
  }, [loadDevices, loadApplications]);

  // Load volume when device changes
  useEffect(() => {
    if (state.currentDevice) {
      loadVolume();
    }
  }, [state.currentDevice, loadVolume]);

  // Optional: Auto-refresh applications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadApplications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadApplications]);

  // Return memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
    // State
    ...state,
    
    // Actions
    loadDevices,
    loadVolume,
    setDevice,
    setVolume,
    toggleMute,
    setMute,
    loadApplications,
    setApplicationVolume,
    refresh,
    clearError,
  }), [
    state,
    loadDevices,
    loadVolume,
    setDevice,
    setVolume,
    toggleMute,
    setMute,
    loadApplications,
    setApplicationVolume,
    refresh,
    clearError,
  ]);
}