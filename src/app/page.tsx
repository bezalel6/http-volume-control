'use client';

import { useState } from 'react';
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
import { useTheme } from '@/components/ThemeProvider';
import { useAudio } from '@/app/hooks/useAudio';
import Settings from '@/components/settings';

export default function Home() {
  const { mode, toggleColorMode } = useTheme();
  const audio = useAudio();
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVolumeChange = async (_event: Event, value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    await audio.setVolume(newVolume);
  };

  const handleApplicationVolumeChange = async (
    app: any,
    value: number
  ) => {
    await audio.setApplicationVolume(app, value);
    setSuccessMessage('Application volume updated');
  };

  const handleMuteToggle = async () => {
    await audio.toggleMute();
    setSuccessMessage(audio.muted ? 'Unmuted' : 'Muted');
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ flexGrow: 1 }}
            >
              <Tab icon={<SpeakerIcon />} label="Default Device" iconPosition="start" />
              <Tab icon={<AppsIcon />} label="Applications" iconPosition="start" />
            </Tabs>
            <Settings />
          </Box>

          {activeTab === 0 ? (
            <Box>
              {/* Default Device Volume Control */}
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Default Audio Device</Typography>
                      <Button
                        size="small"
                        onClick={audio.loadDevices}
                        disabled={audio.loadingDevices}
                        startIcon={audio.loadingDevices ? <CircularProgress size={16} /> : <RefreshIcon />}
                      >
                        Refresh
                      </Button>
                    </Box>

                    {/* Current Device Info */}
                    {audio.defaultDevice && (
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {audio.defaultDevice}
                        </Typography>
                      </Box>
                    )}

                    <Stack direction="row" spacing={2} alignItems="center">
                      <IconButton
                        onClick={handleMuteToggle}
                        disabled={audio.loadingVolume}
                        color={audio.muted ? "error" : "default"}
                        size="large"
                      >
                        {audio.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                      </IconButton>

                      <Slider
                        value={audio.volume}
                        onChange={handleVolumeChange}
                        disabled={audio.loadingVolume || audio.muted}
                        marks
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                      />

                      <Typography sx={{ minWidth: 50, fontSize: '1.1rem', fontWeight: 'medium' }}>
                        {audio.volume}%
                      </Typography>
                    </Stack>

                    {audio.muted && (
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
                  onClick={audio.loadApplications}
                  disabled={audio.loadingApplications}
                  startIcon={audio.loadingApplications ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  Refresh
                </Button>
              </Box>

              {/* Applications List */}
              {audio.applications.length === 0 && !audio.loadingApplications ? (
                <Alert severity="info">
                  No applications with audio found
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {audio.applications.map((app, index) => (
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
                                disabled={audio.loadingVolume}
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
          open={!!audio.error}
          autoHideDuration={6000}
          onClose={audio.clearError}
        >
          <Alert onClose={audio.clearError} severity="error" sx={{ width: '100%' }}>
            {audio.error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}