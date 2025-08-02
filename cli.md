# SVCL.exe Command-Line Protocol Documentation

## Overview

SoundVolumeCommandLine (svcl.exe) is a Windows command-line utility for controlling audio devices and application volumes. It provides comprehensive control over Windows audio settings through a simple command-line interface.

## Core Command Structure

```
svcl.exe /<Command> <Target> [Parameters] [Options]
```

## Device/Target Selection

### Selection Methods

1. **By Device Name**
   ```
   svcl.exe /SetVolume "Speakers" 50
   svcl.exe /SetVolume "Microphone" 75
   ```

2. **By Application Name**
   ```
   svcl.exe /SetVolume "chrome.exe" 50
   svcl.exe /SetVolume "spotify.exe" 80
   ```

3. **By Device ID**
   ```
   svcl.exe /SetVolume "{0.0.0.00000000}.{GUID}" 50
   ```

4. **Using Wildcards**
   ```
   svcl.exe /SetVolume "Realtek*" 50
   svcl.exe /SetVolume "*Headphones*" 75
   ```

## Volume Control Commands

### /SetVolume
Sets the volume to a specific percentage (0-100).

```bash
# Set device volume
svcl.exe /SetVolume "Speakers" 50

# Set application volume
svcl.exe /SetVolume "chrome.exe" 75

# Set volume for all matching devices
svcl.exe /SetVolume "*USB*" 60
```

### /ChangeVolume
Increases or decreases volume by a specified amount.

```bash
# Increase volume by 10%
svcl.exe /ChangeVolume "Speakers" 10

# Decrease volume by 5%
svcl.exe /ChangeVolume "Speakers" -5

# Increase app volume
svcl.exe /ChangeVolume "spotify.exe" 15
```

### /ChangeVolumeDecibel
Changes volume by decibels instead of percentage.

```bash
# Decrease by 6 dB
svcl.exe /ChangeVolumeDecibel "Speakers" -6

# Increase by 3 dB
svcl.exe /ChangeVolumeDecibel "Microphone" 3
```

### /SetVolumeChannels
Controls individual audio channels (stereo/surround).

```bash
# Set left and right channels separately
svcl.exe /SetVolumeChannels "Speakers" 50 100

# Set 5.1 surround channels
svcl.exe /SetVolumeChannels "Speakers" 100 100 50 50 75 75
```

## Mute Control Commands

### /Mute
Mutes the specified device or application.

```bash
svcl.exe /Mute "Speakers"
svcl.exe /Mute "discord.exe"
```

### /Unmute
Unmutes the specified device or application.

```bash
svcl.exe /Unmute "Speakers"
svcl.exe /Unmute "discord.exe"
```

### /Switch
Toggles the mute state.

```bash
svcl.exe /Switch "Speakers"
svcl.exe /Switch "teams.exe"
```

## Default Device Management

### /SetDefault
Sets the default audio device.

```bash
# Set default render device (speakers/headphones)
svcl.exe /SetDefault "Speakers" 0

# Set default capture device (microphone)
svcl.exe /SetDefault "Microphone" 1

# Set default communications device
svcl.exe /SetDefault "Headset" 2
```

Device Types:
- 0 = Default Device (Render)
- 1 = Default Device (Capture)
- 2 = Default Communications Device

### /SwitchDefault
Cycles through available devices.

```bash
# Switch to next render device
svcl.exe /SwitchDefault 0

# Switch to next capture device
svcl.exe /SwitchDefault 1
```

### /SetAppDefault
Sets the default device for a specific application.

```bash
svcl.exe /SetAppDefault "discord.exe" "Headset" 0
svcl.exe /SetAppDefault "obs64.exe" "Microphone" 1
```

## Information Retrieval

### /GetPercent
Gets the current volume percentage.

```bash
# Get device volume
svcl.exe /GetPercent "Speakers"

# Get application volume
svcl.exe /GetPercent "chrome.exe"

# Use with /Stdout for scripting
svcl.exe /GetPercent "Speakers" /Stdout
```

### /GetMute
Gets the current mute state.

```bash
svcl.exe /GetMute "Speakers" /Stdout
```

## Advanced Features

### Spatial Sound Control
```bash
# Enable Windows Sonic
svcl.exe /SetSpatial "Speakers" "Windows Sonic for Headphones"

# Enable Dolby Atmos
svcl.exe /SetSpatial "Speakers" "Dolby Atmos for Headphones"

# Disable spatial sound
svcl.exe /SetSpatial "Speakers" ""
```

### Device Enable/Disable
```bash
# Toggle device state
svcl.exe /DisableEnable "Speakers"

# Disable device
svcl.exe /Disable "Microphone"

# Enable device
svcl.exe /Enable "Microphone"
```

### Wait for Application
```bash
# Wait for app to start, then set volume
svcl.exe /SetVolume "game.exe" 30 /WaitForApp
```

## Output Options

### /Stdout
Redirects output to standard output for scripting.

```bash
# Get volume for script processing
volume=$(svcl.exe /GetPercent "Speakers" /Stdout)

# Get mute state
muted=$(svcl.exe /GetMute "Speakers" /Stdout)
```

### Export Formats
```bash
# Export device list to CSV
svcl.exe /scomma devices.csv

# Export to XML
svcl.exe /sxml devices.xml

# Export to HTML
svcl.exe /shtml devices.html
```

## Practical Examples

### Volume Management Script
```bash
# Save current volume
current_vol=$(svcl.exe /GetPercent "Speakers" /Stdout)

# Mute for meeting
svcl.exe /Mute "Speakers"

# Restore after meeting
svcl.exe /Unmute "Speakers"
svcl.exe /SetVolume "Speakers" $current_vol
```

### Application Audio Routing
```bash
# Route music to speakers, games to headphones
svcl.exe /SetAppDefault "spotify.exe" "Speakers" 0
svcl.exe /SetAppDefault "game.exe" "Headphones" 0
```

### Quick Audio Profiles
```bash
# Gaming profile
svcl.exe /SetDefault "Headphones" 0
svcl.exe /SetVolume "Headphones" 70
svcl.exe /SetVolume "discord.exe" 80

# Music profile
svcl.exe /SetDefault "Speakers" 0
svcl.exe /SetVolume "Speakers" 50
svcl.exe /SetSpatial "Speakers" ""
```

## Error Handling

Common error scenarios:
- Device not found: Returns error code, no action taken
- Invalid volume (>100 or <0): Clamps to valid range
- Application not running: Command fails unless /WaitForApp is used
- Access denied: May need to run as administrator for some operations

## Notes

- Windows Vista or later required
- Some operations may require administrator privileges
- Device names are case-insensitive
- Wildcards (*) are supported in device/app names
- Multiple commands can be chained in a single call
- Changes are immediate and persistent across reboots