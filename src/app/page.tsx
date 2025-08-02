'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Card,
  CardContent,
  Slider,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Avatar,
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
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import { useTheme } from '@/components/ThemeProvider';
import { useAudio } from '@/app/hooks/useAudio';
import Settings from '@/components/settings';
import { AudioApplication } from '@/types/audio';

export default function Home() {
  const { mode, toggleColorMode } = useTheme();
  const audio = useAudio();
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleVolumeChange = async (_event: Event, value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    await audio.setVolume(newVolume);
  };

  const handleApplicationVolumeChange = async (
    app: AudioApplication,
    value: number
  ) => {
    await audio.setApplicationVolume(app, value);
    setSuccessMessage('Application volume updated');
  };

  const handleMuteToggle = async () => {
    await audio.toggleMute();
    setSuccessMessage(audio.muted ? 'Unmuted' : 'Muted');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: { xs: 48, sm: 56 } }}>
          <VolumeUpIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              fontWeight: 500,
              color: 'text.primary'
            }}
          >
            Volume Control
          </Typography>
          <IconButton
            onClick={toggleFullscreen}
            size="small"
            sx={{ color: 'text.primary', mr: 0.5 }}
          >
            {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
          <IconButton
            onClick={toggleColorMode}
            size="small"
            sx={{ color: 'text.primary' }}
          >
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 }, px: { xs: 1, sm: 2 } }}>
        <Paper elevation={1} sx={{ p: { xs: 1, sm: 2 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 1, sm: 2 }, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ flexGrow: 1 }}
            >
              <Tab
                icon={<SpeakerIcon sx={{ fontSize: 20 }} />}
                label="System"
                sx={{ minHeight: 48, fontSize: '0.875rem' }}
              />
              <Tab
                icon={<AppsIcon sx={{ fontSize: 20 }} />}
                label="Apps"
                sx={{ minHeight: 48, fontSize: '0.875rem' }}
              />
            </Tabs>
            <Settings onSettingsChange={audio.loadApplications} />
          </Box>

          {activeTab === 0 ? (
            <Box>
              {/* Default Device Volume Control */}
              <Card variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          System Audio
                        </Typography>
                        {audio.defaultDevice && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {audio.defaultDevice}
                          </Typography>
                        )}
                      </Box>
                      <IconButton
                        onClick={audio.loadDevices}
                        disabled={audio.loadingDevices}
                        size="small"
                      >
                        {audio.loadingDevices ? <CircularProgress size={20} /> : <RefreshIcon />}
                      </IconButton>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton
                        onClick={handleMuteToggle}
                        disabled={audio.loadingVolume}
                        color={audio.muted ? "error" : "default"}
                      >
                        {audio.muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                      </IconButton>

                      <Slider
                        value={audio.volume}
                        onChange={handleVolumeChange}
                        disabled={audio.loadingVolume || audio.muted}
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        sx={{
                          flex: 1,
                          '& .MuiSlider-thumb': {
                            width: 16,
                            height: 16,
                          },
                          '& .MuiSlider-track': {
                            height: 4,
                          },
                          '& .MuiSlider-rail': {
                            height: 4,
                          },
                        }}
                      />

                      <Typography
                        variant="body1"
                        sx={{
                          minWidth: 45,
                          textAlign: 'right',
                          fontWeight: 'medium'
                        }}
                      >
                        {audio.volume}%
                      </Typography>
                    </Stack>

                    {audio.muted && (
                      <Alert
                        severity="info"
                        icon={<VolumeOffIcon />}
                        sx={{ py: 0.5 }}
                      >
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
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Applications</Typography>
                <IconButton
                  onClick={audio.loadApplications}
                  disabled={audio.loadingApplications}
                  size="small"
                >
                  {audio.loadingApplications ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Box>

              {/* Applications List */}
              {audio.applications.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary',
                  }}
                >
                  <VolumeOffIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    No applications playing audio
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {audio.applications.map((app, index) => (
                    <Card
                      key={`${app.processPath}-${app.instanceId || index}`}
                      variant="outlined"
                      sx={{
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        borderRadius: 1,
                        '&:hover': {
                          borderColor: 'primary.main',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Stack direction="row" alignItems="center" sx={{ p: 1.5 }}>
                          {/* Compact Icon */}
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'transparent',
                              mr: 1.5,
                            }}
                            variant="rounded"
                          >
                            {app.iconPath ? (
                              <Image
                                src={app.iconPath}
                                alt={`${app.name} icon`}
                                width={40}
                                height={40}
                                style={{ objectFit: 'contain' }}
                              />
                            ) : (
                              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                {app.name.charAt(0).toUpperCase()}
                              </Typography>
                            )}
                          </Avatar>

                          {/* App Name */}
                          <Box sx={{ flex: '0 0 auto', mr: 2, minWidth: 0 }}>
                            <Typography variant="body1" fontWeight="medium" noWrap>
                              {app.name}
                            </Typography>
                            {app.instanceId && (
                              <Typography variant="caption" color="text.secondary">
                                #{app.instanceId}
                              </Typography>
                            )}
                          </Box>

                          {/* Volume Control - Full Width */}
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Slider
                              value={app.volume}
                              onChange={(_e, value) => handleApplicationVolumeChange(app, value as number)}
                              disabled={audio.loadingVolume}
                              step={5}
                              min={0}
                              max={100}
                              valueLabelDisplay="auto"
                              sx={{
                                flex: 1,
                                '& .MuiSlider-thumb': {
                                  width: 16,
                                  height: 16,
                                },
                                '& .MuiSlider-track': {
                                  height: 4,
                                },
                                '& .MuiSlider-rail': {
                                  height: 4,
                                },
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 40,
                                textAlign: 'right',
                                fontWeight: 'medium'
                              }}
                            >
                              {Math.round(app.volume)}%
                            </Typography>
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
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={audio.clearError} severity="error" sx={{ width: '100%' }}>
            {audio.error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}