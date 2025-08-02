'use client';

import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  Theme,
} from '@mui/material';
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
    <Box sx={{
      height: isMobileLandscape ? '100%' : 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0,
      overflow: isMobileLandscape ? 'auto' : 'visible'
    }}>
      {sortedProcesses.map((process) => {
        const isSelected = selectedProcesses.includes(process.processPath);

        return (
          <Box
            key={process.processPath}
            onClick={() => onToggleProcess(process.processPath)}
            sx={{
              position: 'relative',
              width: { xs: '72px', sm: '80px', md: '88px' },
              height: { xs: '72px', sm: '80px', md: '88px' },
              cursor: 'pointer',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              opacity: isSelected ? 1 : 0.4,
              transform: isSelected ? 'scale(1)' : 'scale(0.9)',
              '&:hover': {
                opacity: isSelected ? 1 : 0.7,
                transform: 'scale(1)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
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
                    filter: isSelected ? 'none' : 'grayscale(100%)',
                    transition: 'filter 0.15s ease',
                  }}
                />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    color: isSelected
                      ? (mode === 'dark' ? 'primary.light' : 'primary.main')
                      : 'text.disabled',
                    fontWeight: 700,
                    userSelect: 'none',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {process.name.charAt(0).toUpperCase()}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default SimpleWhitelist;