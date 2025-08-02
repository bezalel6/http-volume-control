# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HTTP Volume Control is a Next.js 15 application that provides a web interface for controlling Windows audio devices and application volumes using the `svcl.exe` and `GetNir.exe` command-line utilities.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Architecture

### Core Components

1. **External Dependencies**
   - `svcl.exe` - Windows audio control utility (must be placed in project root)
   - `GetNir.exe` - CSV filtering utility (must be placed in project root)
   - Both executables are used via piped commands for audio operations

2. **API Layer** (`/src/app/api/audio/`)
   - `/volume` - GET/POST for device volume control
   - `/mute` - POST for mute/unmute operations
   - `/devices` - GET for listing audio devices
   - `/applications` - GET for listing running applications with audio
   - `/applications/volume` - POST for application volume control

3. **Service Layer** (`/src/lib/audio-service.ts`)
   - Encapsulates all `svcl.exe` command execution
   - Uses piped commands with `GetNir.exe` for filtering
   - Parses CSV output directly from stdout (no temp files)
   - Includes command logging wrapper for debugging

4. **Client Layer** (`/src/lib/api-client.ts`)
   - Type-safe API client
   - Handles all HTTP communication with backend
   - Provides error handling and response typing

5. **Type Definitions** (`/src/types/audio.ts`)
   - Comprehensive TypeScript interfaces for all audio operations
   - Includes device, application, and error types

## Key Implementation Details

### Command Execution Pattern
The AudioService uses piped commands to avoid temporary files:
```typescript
`"${this.svclPath}" /scomma "" /Columns "..." | "${this.getNirPath}" "..." "..."`
```

### CSV Parsing
Custom CSV parser handles quoted fields properly, as Windows device names may contain commas.

### Device Identification
- Devices can be targeted by name, with "DefaultRenderDevice" as a special identifier
- Applications are targeted by process name (e.g., "chrome.exe")

### Error Handling
- Command execution errors are logged and wrapped in typed AudioError objects
- API endpoints return consistent error responses with appropriate HTTP status codes

## Important Notes

- The application requires Windows OS due to dependency on `svcl.exe`
- Multiple instances of the same application (e.g., Steam) are tracked with instanceId
- The UI provides tabbed interface for Devices and Applications
- Volume changes are real-time via slider controls

For detailed svcl.exe command documentation, see `cli.md` in the project root.