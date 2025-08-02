import React from 'react';
import {
  Box,
  IconButton,
  Typography,
  Grid,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  Theme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import Image from 'next/image';
import { AudioProcess } from '@/types/audio';

interface SimpleWhitelistProps {
  processes: AudioProcess[];
  selectedProcesses: string[];
  onToggleProcess: (processPath: string) => void;
  loading?: boolean;
  mode: 'light' | 'dark';
}

const SimpleWhitelist: React.FC<SimpleWhitelistProps> = ({
  processes,
  selectedProcesses,
  onToggleProcess,
  loading = false,
  mode
}) => {
  // Detect mobile landscape orientation
  const isMobileLandscape = useMediaQuery((theme: Theme) => 
    `${theme.breakpoints.down('sm')} and (orientation: landscape)`
  );
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (processes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">
          No applications found
        </Typography>
      </Box>
    );
  }

  // Show only active processes first, then others
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Box sx={{ height: isMobileLandscape ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
      {!isMobileLandscape && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Tap applications to show/hide them from volume control
        </Typography>
      )}

      <Grid container spacing={1} sx={{ flex: 1, overflow: isMobileLandscape ? 'auto' : 'visible' }}>
        {sortedProcesses.map((process) => {
          const isSelected = selectedProcesses.includes(process.processPath);
          
          return (
            <Grid item xs={4} sm={3} key={process.processPath}>
              <Tooltip title={process.name} arrow>
                <Box
                  onClick={() => onToggleProcess(process.processPath)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                    opacity: isSelected ? 1 : 0.6,
                    bgcolor: isSelected 
                      ? (mode === 'dark' ? 'primary.dark' : 'primary.light')
                      : (mode === 'dark' ? 'grey.900' : 'grey.100'),
                    '&:hover': {
                      transform: isSelected ? 'scale(1.05)' : 'scale(0.95)',
                      opacity: 1,
                    },
                    '&:active': {
                      transform: 'scale(0.85)',
                    },
                  }}
                >
                  {/* App Icon */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    {process.iconPath ? (
                      <Image
                        src={process.iconPath}
                        alt={process.name}
                        width={64}
                        height={64}
                        style={{ 
                          objectFit: 'contain',
                          filter: isSelected ? 'none' : 'grayscale(50%)',
                        }}
                      />
                    ) : (
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          color: isSelected 
                            ? (mode === 'dark' ? 'primary.contrastText' : 'primary.main')
                            : (mode === 'dark' ? 'grey.700' : 'grey.400'),
                          fontWeight: 700,
                          userSelect: 'none',
                        }}
                      >
                        {process.name.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2,
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  )}

                  {/* Active Indicator */}
                  {process.isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.3)',
                        animation: 'pulse 2s infinite',
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* Add pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }
      `}</style>
    </Box>
  );
};

export default SimpleWhitelist;