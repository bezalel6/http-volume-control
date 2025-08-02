'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Slider,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  AppBar,
  Toolbar,
  SelectChangeEvent,
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Refresh as RefreshIcon,
  Speaker as SpeakerIcon,
  Apps as AppsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { audioAPI } from '@/lib/api-client';
import { AudioDevice, AudioApplication } from '@/types/audio';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
  const { mode, toggleColorMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Device state
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [device, setDevice] = useState<string>('DefaultRenderDevice');
  const [volume, setVolume] = useState<number>(50);
  const [muted, setMuted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);
  
  // Application state
  const [applications, setApplications] = useState<AudioApplication[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);
  
  // UI state
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load devices on mount
  useEffect(() => {
    loadDevices();
    loadApplications();
  }, []);

  // Load current volume when device changes
  useEffect(() => {
    if (device) {
      loadCurrentVolume();
    }
  }, [device]);

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const response = await audioAPI.getDevices();
      if (response.success) {
        setDevices(response.devices);
        if (response.defaultDevice && !device) {
          setDevice(response.defaultDevice);
        }
      } else {
        setError(response.error || 'Failed to load devices');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoadingDevices(false);
    }
  };

  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const response = await audioAPI.getApplications();
      if (response.success) {
        setApplications(response.applications);
      } else {
        setError(response.error || 'Failed to load applications');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoadingApps(false);
    }
  };

  const loadCurrentVolume = async () => {
    try {
      const response = await audioAPI.getVolume({ device });
      if (response.success) {
        setVolume(response.volume);
        setMuted(response.muted);
      }
    } catch (err) {
      console.error('Failed to load current volume:', err);
    }
  };

  const handleVolumeChange = useCallback(
    async (_event: Event, newValue: number | number[]) => {
      const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
      setVolume(newVolume);
      
      setLoading(true);
      try {
        const response = await audioAPI.setVolume({ device, volume: newVolume });
        if (response.success) {
          setSuccess('Volume updated');
        } else {
          setError(response.error || 'Failed to set volume');
          setVolume(volume); // Revert on error
        }
      } catch (err) {
        setError('Failed to connect to API');
        setVolume(volume); // Revert on error
      } finally {
        setLoading(false);
      }
    },
    [device, volume]
  );

  const handleApplicationVolumeChange = useCallback(
    async (app: AudioApplication, newVolume: number) => {
      setLoading(true);
      try {
        const response = await audioAPI.setApplicationVolume({
          processPath: app.processPath,
          volume: newVolume,
          instanceId: app.instanceId
        });
        
        if (response.success) {
          setApplications(prev => 
            prev.map(a => 
              a.processPath === app.processPath && a.instanceId === app.instanceId
                ? { ...a, volume: newVolume }
                : a
            )
          );
          setSuccess('Application volume updated');
        } else {
          setError(response.error || 'Failed to set application volume');
        }
      } catch (err) {
        setError('Failed to connect to API');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const toggleMute = async () => {
    setLoading(true);
    try {
      const response = await audioAPI.setMute({ device, mute: !muted });
      if (response.success) {
        setMuted(response.muted);
        setSuccess(response.muted ? 'Muted' : 'Unmuted');
      } else {
        setError(response.error || 'Failed to toggle mute');
      }
    } catch (err) {
      setError('Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (event: SelectChangeEvent) => {
    setDevice(event.target.value);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <VolumeUpIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HTTP Volume Control
          </Typography>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab icon={<SpeakerIcon />} label="Devices" iconPosition="start" />
            <Tab icon={<AppsIcon />} label="Applications" iconPosition="start" />
          </Tabs>

          {activeTab === 0 ? (
            <Box>
              {/* Device Selection */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <FormControl fullWidth>
                    <InputLabel>Audio Device</InputLabel>
                    <Select
                      value={device}
                      onChange={handleDeviceChange}
                      disabled={loadingDevices || loading}
                      label="Audio Device"
                    >
                      {devices.map((dev) => (
                        <MenuItem key={dev.id} value={dev.name}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>
                              {dev.name} {dev.isDefault && <Chip label="Default" size="small" color="primary" />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dev.volume}%
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    onClick={loadDevices}
                    disabled={loading || loadingDevices}
                    startIcon={loadingDevices ? <CircularProgress size={20} /> : <RefreshIcon />}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Box>

              {/* Volume Control */}
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h6">Volume Control</Typography>
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <IconButton
                        onClick={toggleMute}
                        disabled={loading}
                        color={muted ? "error" : "default"}
                      >
                        {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                      </IconButton>
                      
                      <Slider
                        value={volume}
                        onChange={handleVolumeChange}
                        disabled={loading || muted}
                        marks
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />
                      
                      <Typography sx={{ minWidth: 50 }}>
                        {volume}%
                      </Typography>
                    </Stack>

                    {muted && (
                      <Alert severity="info" icon={<VolumeOffIcon />}>
                        Device is muted
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box>
              {/* Applications Header */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Running Applications</Typography>
                <Button
                  variant="outlined"
                  onClick={loadApplications}
                  disabled={loadingApps}
                  startIcon={loadingApps ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>

              {/* Applications List */}
              {loadingApps ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Loading applications...
                  </Typography>
                </Box>
              ) : applications.length === 0 ? (
                <Alert severity="info">
                  No applications with audio found
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {applications.map((app, index) => (
                    <Card key={`${app.processPath}-${app.instanceId || index}`}>
                      <CardContent>
                        <Stack direction="row" spacing={2}>
                          {/* Application Icon */}
                          <Avatar
                            sx={{ width: 48, height: 48, bgcolor: 'background.default' }}
                            variant="rounded"
                          >
                            {app.iconPath ? (
                              <Image
                                src={app.iconPath}
                                alt={`${app.name} icon`}
                                width={48}
                                height={48}
                                style={{ objectFit: 'contain' }}
                              />
                            ) : (
                              <Typography variant="h6" color="text.secondary">
                                {app.name.charAt(0).toUpperCase()}
                              </Typography>
                            )}
                          </Avatar>

                          {/* Application Details */}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium">
                              {app.name} {app.instanceId && <Chip label={app.instanceId} size="small" />}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {app.processPath}
                            </Typography>
                            
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                              <Typography sx={{ minWidth: 50 }}>
                                {Math.round(app.volume)}%
                              </Typography>
                              <Slider
                                value={app.volume}
                                onChange={(_e, value) => handleApplicationVolumeChange(app, value as number)}
                                disabled={loading}
                                step={5}
                                min={0}
                                max={100}
                                valueLabelDisplay="auto"
                                sx={{ flex: 1 }}
                              />
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Paper>

        {/* Status Messages */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}