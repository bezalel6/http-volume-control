"use client";

import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useMediaQuery,
  Theme,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { AudioProcess } from "@/types/audio";

interface SimpleWhitelistProps {
  processes: AudioProcess[];
  selectedProcesses: string[];
  onToggleProcess: (processPath: string) => void;
  loading?: boolean;
  mode: "light" | "dark";
}

const SimpleWhitelist: React.FC<SimpleWhitelistProps> = ({
  processes,
  selectedProcesses,
  onToggleProcess,
  loading = false,
  mode,
}) => {
  // Detect mobile landscape orientation
  const isMobileLandscape = useMediaQuery(
    (theme: Theme) =>
      `${theme.breakpoints.down("sm")} and (orientation: landscape)`
  );
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (processes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography color="text.secondary">No applications found</Typography>
      </Box>
    );
  }

  // Show only active processes first, then others
  const sortedProcesses = [...processes].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Box
      sx={{
        height: isMobileLandscape ? "100%" : "auto",
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 1, sm: 1.5, md: 2 },
        overflow: isMobileLandscape ? "auto" : "visible",
        px: 2,
        py: 2,
        pb: 4,
      }}
    >
      {sortedProcesses.map((process) => {
        const isSelected = selectedProcesses.includes(process.processPath);

        return (
          <Box
            key={process.processPath}
            onClick={() => onToggleProcess(process.processPath)}
            sx={{
              position: "relative",
              width: { xs: "72px", sm: "80px", md: "88px" },
              height: { xs: "72px", sm: "80px", md: "88px" },
              cursor: "pointer",
              transition: "opacity 0.15s ease, transform 0.15s ease",
              opacity: isSelected ? 1 : 0.4,
              transform: isSelected ? "scale(1)" : "scale(0.9)",
              overflow: "visible",
              "&:hover": {
                opacity: isSelected ? 1 : 0.7,
                transform: "scale(1)",
                "& .process-name": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <ProcessSelector isSelected={isSelected} process={process} />
          </Box>
        );
      })}
    </Box>
  );
};

function ProcessSelector({
  process,
  isSelected,
}: {
  process: AudioProcess;
  isSelected: boolean;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ProcessLogo isSelected={isSelected} process={process} />
      </Box>
      <Typography
        className="process-name"
        variant="body2"
        sx={{
          position: "absolute",
          bottom: -20,
          left: -10,
          right: -10,
          textAlign: "center",
          fontSize: { xs: "0.75rem", sm: "0.875rem", md: "0.875rem" },
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "visible",
          px: 0.5,
          opacity: 0,
          transform: "translateY(4px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          color: (theme) => 
            isSelected 
              ? theme.palette.primary.main 
              : theme.palette.mode === 'dark' 
                ? theme.palette.grey[300] 
                : theme.palette.text.secondary,
          backgroundColor: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
          borderRadius: 0.5,
          py: 0.25,
        }}
      >
        {process.name}
      </Typography>
    </Box>
  );
}

function ProcessLogo({
  process,
  isSelected,
}: {
  process: AudioProcess;
  isSelected: boolean;
}) {
  const { mode } = useTheme().palette;
  return (
    <>
      {process.iconPath ? (
        <Image
          src={process.iconPath}
          alt={process.name}
          width={48}
          height={48}
          draggable={false}
          style={{
            objectFit: "contain",
            userSelect: "none",
            filter: isSelected ? "none" : "grayscale(100%)",
            transition: "filter 0.15s ease",
          }}
        />
      ) : (
        <Typography
          variant="h4"
          sx={{
            color: isSelected
              ? mode === "dark"
                ? "primary.light"
                : "primary.main"
              : "text.disabled",
            fontWeight: 700,
            userSelect: "none",
            transition: "color 0.15s ease",
            fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
          }}
        >
          {process.name.charAt(0).toUpperCase()}
        </Typography>
      )}
    </>
  );
}
export default SimpleWhitelist;
