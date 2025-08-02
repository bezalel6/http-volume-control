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
    <Box sx={{ height: isMobileLandscape ? '100%' : 'auto' }}>
      <Grid container spacing={1} sx={{ overflow: isMobileLandscape ? 'auto' : 'visible' }}>
        {sortedProcesses.map((process) => {
          const isSelected = selectedProcesses.includes(process.processPath);
          
          return (
            <Grid item xs={3} sm={2.4} md={2} key={process.processPath}>
                <Box
                  onClick={() => onToggleProcess(process.processPath)}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease, background-color 0.15s ease',
                    bgcolor: isSelected 
                      ? (mode === 'dark' ? 'primary.dark' : 'primary.main')
                      : (mode === 'dark' ? 'grey.900' : 'grey.100'),
                    opacity: isSelected ? 1 : 0.6,
                    '&:hover': {
                      opacity: 1,
                    },
                    '&:active': {
                      opacity: 0.8,
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
                        width={48}
                        height={48}
                        style={{ 
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: isSelected 
                            ? (mode === 'dark' ? 'white' : 'white')
                            : 'text.secondary',
                          fontWeight: 600,
                          userSelect: 'none',
                        }}
                      >
                        {process.name.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>
                </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SimpleWhitelist;