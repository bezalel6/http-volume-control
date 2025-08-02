import React, { useState, useMemo } from 'react';
import { 
  Box, 
  IconButton, 
  Avatar, 
  Tooltip, 
  CircularProgress, 
  Typography, 
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Grid,
  Stack
} from '@mui/material';
import { 
  Check as CheckIcon,
  Search as SearchIcon,
  Apps as AppsIcon,
  PlayCircle as ActiveIcon,
  CheckCircle as SelectedIcon
} from '@mui/icons-material';
import Image from 'next/image';

interface ProcessScrollerProps {
  processes: Array<{
    name: string;
    processPath: string;
    iconPath?: string;
    isActive: boolean;
  }>;
  selectedProcesses: string[];
  onToggleProcess: (processPath: string) => void;
  loading?: boolean;
}

const ProcessScroller: React.FC<ProcessScrollerProps> = ({
  processes,
  selectedProcesses,
  onToggleProcess,
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'selected'>('all');
  
  // Filter and sort processes
  const filteredProcesses = useMemo(() => {
    let filtered = processes;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(p => p.isActive);
        break;
      case 'selected':
        filtered = filtered.filter(p => selectedProcesses.includes(p.processPath));
        break;
    }
    
    // Sort: selected first, then active, then alphabetical
    return filtered.sort((a, b) => {
      const aSelected = selectedProcesses.includes(a.processPath);
      const bSelected = selectedProcesses.includes(b.processPath);
      
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [processes, searchQuery, filter, selectedProcesses]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (processes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No audio applications found
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Controls */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <ToggleButtonGroup
            size="small"
            value={filter}
            exclusive
            onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
          >
            <ToggleButton value="all">
              <Tooltip title="All applications">
                <AppsIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="active">
              <Tooltip title="Currently playing audio">
                <ActiveIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="selected">
              <Tooltip title="Selected applications">
                <SelectedIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          size="small" 
          label={`${processes.length} total`} 
          variant="outlined" 
        />
        <Chip 
          size="small" 
          label={`${processes.filter(p => p.isActive).length} active`} 
          variant="outlined" 
          color="success"
        />
        <Chip 
          size="small" 
          label={`${selectedProcesses.length} selected`} 
          variant="outlined" 
          color="primary"
        />
      </Box>

      {/* Process Grid */}
      {filteredProcesses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No applications match your search
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            maxHeight: 400,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'action.hover',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'action.selected',
              borderRadius: 4,
              '&:hover': {
                bgcolor: 'action.disabled',
              },
            },
          }}
        >
          <Grid container spacing={1}>
            {filteredProcesses.map((process) => {
              const isSelected = selectedProcesses.includes(process.processPath);
              
              return (
                <Grid item xs={6} sm={4} md={3} key={process.processPath}>
                  <Box
                    onClick={() => onToggleProcess(process.processPath)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s',
                      border: 2,
                      borderColor: isSelected ? 'primary.main' : 'transparent',
                      bgcolor: isSelected ? 'primary.main' : 'background.paper',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'transparent',
                        position: 'relative',
                      }}
                      variant="rounded"
                    >
                      {process.iconPath ? (
                        <Image
                          src={process.iconPath}
                          alt={process.name}
                          width={48}
                          height={48}
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <Typography variant="h6" color="text.secondary">
                          {process.name.charAt(0).toUpperCase()}
                        </Typography>
                      )}
                    </Avatar>
                    
                    {/* Status indicators */}
                    <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                      {isSelected && (
                        <CheckIcon
                          sx={{
                            fontSize: 16,
                            color: isSelected ? 'primary.contrastText' : 'primary.main',
                          }}
                        />
                      )}
                      {process.isActive && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            bgcolor: 'success.main',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite',
                          }}
                        />
                      )}
                    </Box>
                    
                    <Typography
                      variant="caption"
                      sx={{
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      noWrap
                    >
                      {process.name}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProcessScroller;