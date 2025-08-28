# SGEX Workbench Desktop App

Cross-platform desktop application for the WHO SMART Guidelines Exchange (SGEX) Workbench.

## Overview

The SGEX Desktop App provides a native desktop experience for the SGEX Workbench, allowing users to access the full functionality of the web application through a local server with system tray integration.

## Features

- 🖥️ **Cross-platform support**: Windows, macOS, and Linux
- 🔧 **System tray integration**: Quick access from your system tray or menu bar
- 🌐 **Automatic browser launch**: Opens your default browser when ready
- 📊 **Smart port selection**: Automatically selects random high ports (40000-49999) to avoid conflicts
- 🔄 **Service auto-restart**: Automatically restarts the service if it fails
- 📝 **Comprehensive logging**: Full logging with electron-log for troubleshooting
- 🚀 **One-click installation**: Native installers for each platform

## Installation

### From GitHub Releases

1. Go to the [Releases page](https://github.com/litlfred/sgex/releases)
2. Download the appropriate installer for your platform:
   - **Windows**: `.exe` installer
   - **macOS**: `.dmg` disk image or `.pkg` installer
   - **Linux**: `.AppImage` portable application
3. Run the installer and follow the installation prompts
4. Launch "SGEX Workbench" from your applications menu or desktop

### From Source

```bash
# Clone the repository
git clone https://github.com/litlfred/sgex.git
cd sgex

# Install dependencies
npm install

# Build and run in development mode
npm run electron-dev

# Or build distributables
npm run dist        # All platforms
npm run dist:win    # Windows only
npm run dist:mac    # macOS only
npm run dist:linux  # Linux only
```

## Usage

### First Launch

1. Launch the SGEX Workbench application
2. Look for the SGEX icon in your system tray (Windows/Linux) or menu bar (macOS)
3. The app will automatically:
   - Start the local SGEX service on a random high port
   - Open your default browser to the correct URL
   - Display a "Server Running" status in the tray menu

### Tray Menu Options

Right-click the tray icon to access:

- **Open in Browser**: Manually open SGEX in your default browser
- **Restart Service**: Restart the SGEX service if needed
- **Show Logs**: Open the log file location for troubleshooting
- **Quit**: Stop the service and exit the application

### Troubleshooting

If the service fails to start:

1. Check the tray icon - it will show "Server Stopped" status
2. Right-click and select "Show Logs" to view error details
3. Try "Restart Service" from the tray menu
4. The app will automatically attempt to restart failed services

## Development

### Project Structure

```
public/electron/
├── main.js          # Main Electron process
├── server.js        # Express server for serving React build
└── icons/           # Platform-specific icons

.github/workflows/
└── desktop-app-release.yml  # GitHub Actions for automated builds
```

### Testing

```bash
# Test the desktop app functionality
npm run test:desktop

# Test React build
npm run build

# Test Electron packaging
npm run build:electron-dir
```

### Key Technologies

- **Electron**: Cross-platform desktop app framework
- **Express**: Local web server for serving the React build
- **electron-builder**: Native installer creation
- **electron-log**: Logging and debugging

## Architecture

The desktop app consists of:

1. **Main Process** (`main.js`): Manages the Electron app lifecycle, system tray, and service monitoring
2. **Server Process** (`server.js`): Express server that serves the React build on localhost
3. **React Build**: The complete SGEX web application built as static assets

### Service Management

- **Port Selection**: Randomly selects from high ports (40000-49999) to avoid conflicts
- **Health Monitoring**: Continuously monitors service health with automatic restart
- **Resilience**: Implements exponential backoff for restart attempts
- **Logging**: Comprehensive logging of all service events

## System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.13 High Sierra or later
- **Linux**: Ubuntu 18.04 or equivalent distributions

## Building for Distribution

The project includes automated GitHub Actions that:

1. Deploy the web version to GitHub Pages
2. Build native installers for all platforms
3. Create GitHub releases with downloadable installers

### Manual Build

```bash
# Build for all platforms (requires platform-specific tools)
npm run dist

# Platform-specific builds
npm run dist:win    # Requires Windows or Wine
npm run dist:mac    # Requires macOS
npm run dist:linux  # Works on any platform
```

## Configuration

The app configuration is managed through `package.json` in the `build` section:

- **App ID**: `org.who.sgex-workbench`
- **Product Name**: SGEX Workbench
- **Default Ports**: 40000-49999 range
- **Auto-start**: Enabled by default
- **Desktop Shortcuts**: Created during installation

## License

This project is licensed under the same license as the main SGEX Workbench project.

## Contributing

Please refer to the main project's [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Support

For issues specific to the desktop app:

1. Check the logs using "Show Logs" from the tray menu
2. Try restarting the service using "Restart Service"
3. File an issue on the [GitHub repository](https://github.com/litlfred/sgex/issues) with:
   - Your operating system and version
   - Log files from the application
   - Steps to reproduce the issue