'use client';

import { useState, useEffect, useCallback } from 'react';
import { audioAPI } from '@/lib/api-client';
import { AudioDevice, AudioApplication } from '@/types/audio';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'devices' | 'applications'>('devices');
  
  // Device state
  const [volume, setVolume] = useState(50);
  const [device, setDevice] = useState('DefaultRenderDevice');
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Application state
  const [applications, setApplications] = useState<AudioApplication[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, []);

  // Load applications when tab changes to applications
  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    }
  }, [activeTab]);

  // Load current volume when device changes
  useEffect(() => {
    if (device && activeTab === 'devices') {
      loadCurrentVolume();
    }
  }, [device]);

  const loadDevices = async () => {
    setLoadingDevices(true);
    const response = await audioAPI.getDevices();
    
    if (response.success) {
      setDevices(response.devices);
      // Update volume from device info
      const selectedDevice = response.devices.find(d => d.name === device);
      if (selectedDevice) {
        setVolume(selectedDevice.volume);
      } else if (!response.devices.find(d => d.name === device)) {
        setDevice(response.defaultDevice);
      }
    } else {
      setError(response.error || 'Failed to load devices');
      setDevices([{ 
        name: 'DefaultRenderDevice',
        deviceName: 'Default Render Device',
        id: 'DefaultRenderDevice',
        volume: 100,
        isDefault: true, 
        type: 'render' 
      }]);
    }
    
    setLoadingDevices(false);
  };

  const loadApplications = async () => {
    setLoadingApps(true);
    setError(null);
    const response = await audioAPI.getApplications();
    
    if (response.success) {
      setApplications(response.applications);
    } else {
      setError(response.error || 'Failed to load applications');
    }
    
    setLoadingApps(false);
  };

  const loadCurrentVolume = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const response = await audioAPI.getVolume(device);
    
    if (response.success) {
      setVolume(response.volume);
      setIsMuted(response.muted);
    } else {
      setError(response.error || 'Failed to get volume');
    }
    
    setLoading(false);
  }, [device]);

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleVolumeSet = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const response = await audioAPI.setVolume(device, volume);
    
    if (response.success) {
      setSuccess('Volume updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.error || 'Failed to set volume');
    }
    
    setLoading(false);
  };

  const handleMuteToggle = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const newMuteState = !isMuted;
    const response = await audioAPI.setMute(device, newMuteState);
    
    if (response.success) {
      setIsMuted(newMuteState);
      setSuccess(`Device ${newMuteState ? 'muted' : 'unmuted'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.error || 'Failed to change mute state');
    }
    
    setLoading(false);
  };

  const handleApplicationVolumeChange = async (app: AudioApplication, newVolume: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    const response = await audioAPI.setApplicationVolume(app.processPath, newVolume, app.instanceId);
    
    if (response.success) {
      setSuccess(`${app.name} volume updated`);
      setTimeout(() => setSuccess(null), 3000);
      // Update local state
      setApplications(apps => 
        apps.map(a => 
          a.processPath === app.processPath && a.instanceId === app.instanceId 
            ? { ...a, volume: newVolume }
            : a
        )
      );
    } else {
      setError(response.error || 'Failed to set application volume');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: '#f8f9fa'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        marginBottom: '2rem',
        color: '#1a1a1a'
      }}>
        HTTP Volume Control
      </h1>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('devices')}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'devices' ? '#3182ce' : '#e2e8f0',
            color: activeTab === 'devices' ? 'white' : '#4a5568',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Devices
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'applications' ? '#3182ce' : '#e2e8f0',
            color: activeTab === 'applications' ? 'white' : '#4a5568',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Applications
        </button>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '2.5rem', 
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        width: '100%',
        maxWidth: '600px'
      }}>
        {activeTab === 'devices' ? (
          <>
            {/* Device Dropdown */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#4a5568'
              }}>
                Audio Device
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  disabled={loadingDevices || loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    cursor: loadingDevices ? 'not-allowed' : 'pointer',
                    backgroundColor: 'white',
                    color: '#1a202c'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3182ce'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  {devices.map((dev) => (
                    <option 
                      key={dev.id} 
                      value={dev.name}
                      style={{
                        backgroundColor: 'white',
                        color: '#1a202c',
                        padding: '0.5rem'
                      }}
                    >
                      {dev.name} {dev.isDefault ? '(Default)' : ''} - {dev.volume}%
                    </option>
                  ))}
                </select>
                <button
                  onClick={loadDevices}
                  disabled={loading || loadingDevices}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3182ce',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading || loadingDevices ? 'not-allowed' : 'pointer',
                    opacity: loading || loadingDevices ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {loadingDevices ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Volume Control */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#4a5568'
              }}>
                Volume: {volume}%
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  disabled={loading || isMuted}
                  style={{ 
                    flex: 1,
                    opacity: isMuted ? 0.5 : 1,
                    cursor: isMuted ? 'not-allowed' : 'pointer'
                  }}
                />
                <button
                  onClick={handleVolumeSet}
                  disabled={loading || isMuted}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#3182ce',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading || isMuted ? 'not-allowed' : 'pointer',
                    opacity: loading || isMuted ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  Set
                </button>
              </div>
            </div>

            {/* Mute Toggle */}
            <div style={{ marginBottom: '2rem' }}>
              <button
                onClick={handleMuteToggle}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: isMuted ? '#e53e3e' : '#48bb78',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>
                  {isMuted ? '🔇' : '🔊'}
                </span>
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Applications List */}
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2d3748' }}>
                Running Applications
              </h2>
              <button
                onClick={loadApplications}
                disabled={loadingApps}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3182ce',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loadingApps ? 'not-allowed' : 'pointer',
                  opacity: loadingApps ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loadingApps ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                No applications with audio found
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app, index) => (
                  <div 
                    key={`${app.processPath}-${app.instanceId || index}`}
                    style={{ 
                      background: '#f7fafc', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                      {app.name} {app.instanceId ? `(${app.instanceId})` : ''}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.75rem' }}>
                      {app.processPath}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#4a5568', minWidth: '50px' }}>
                        {Math.round(app.volume)}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={app.volume}
                        onChange={(e) => handleApplicationVolumeChange(app, Number(e.target.value))}
                        disabled={loading}
                        style={{ 
                          flex: 1,
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Status Messages */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            borderRadius: '8px',
            color: '#c53030',
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            padding: '1rem',
            background: '#f0fff4',
            borderRadius: '8px',
            color: '#22543d',
            fontSize: '0.875rem',
            marginTop: '1rem'
          }}>
            ✅ {success}
          </div>
        )}
      </div>
    </div>
  );
}