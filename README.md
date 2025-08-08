# Pepper - Video Playback Rate Controller

A browser extension that gives you precise control over video playback speeds across any website. Whether you're watching educational content, entertainment, or any other video, Pepper helps you control the playback rate with simple keyboard shortcuts.

## Features

- Control video playback speed on any website
- Keyboard shortcuts for quick speed adjustments
- Per-website speed memory
- Visual feedback with an unobtrusive overlay
- Works in both normal and fullscreen modes
- Supports all major video platforms (YouTube, Vimeo, Netflix, etc.)

## Installation

### Chrome/Edge
1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions` or `edge://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Pepper icon should appear in your browser toolbar

### Building from Source
```bash
# Clone the repository
git clone https://github.com/Rochakgill/VideoPlaybackRateExt.git

# Navigate to the extension directory
cd VideoPlaybackRateExt
```

## Usage

### Keyboard Shortcuts

- **Shift + >** or **Shift + .**: Increase playback rate by 0.25x
- **Shift + <** or **Shift + ,**: Decrease playback rate by 0.25x
- **Command/Ctrl + Shift + .**: Set maximum speed (16x)
- **Command/Ctrl + Shift + ,**: Reset to normal speed (1x)

### Features
- **Per-site Memory**: The extension remembers your preferred playback rate for each website
- **Visual Feedback**: A temporary overlay shows the current playback rate when changed
- **Default Speed**: When set to 1x speed, the setting is cleared for that site
- **Range**: Supports speeds from 0.25x to 16x

### Popup Interface
Click the Pepper icon in your toolbar to:
- Use the slider for precise speed control
- Click preset buttons for common speeds (1x, 1.25x, 1.5x, 2x)

## Privacy

Pepper:
- Does not collect any user data
- Only stores playback rate preferences locally
- Requires minimal permissions (only for video control)
- Does not track browsing history or user behavior

## Supported Browsers

- Google Chrome (v88+)
- Microsoft Edge (v88+)
- Other Chromium-based browsers should work but are not officially tested

## Troubleshooting

If the playback rate control isn't working:
1. Make sure the video is playing
2. Try refreshing the page
3. Check if the extension is enabled
4. Some sites may take a moment to initialize - try changing the speed again after a few seconds

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is open source under the MIT License.

## Contact

For bugs and feature requests, please [create an issue](mailto:rochakgill1@gmail.com) or email rochakgill1@gmail.com

## Version History

- 3.0: Added keyboard shortcuts and fullscreen support
- 2.0: Added per-site memory and visual feedback
- 1.0: Initial release with basic speed control
