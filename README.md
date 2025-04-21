# YouTube View Filter

![YouTube View Filter Logo](icons/icon128.png)

A Chrome extension that filters out YouTube videos with low view counts, helping you focus on more popular content.

## Features

- **Customizable View Threshold**: Set your preferred minimum view count (100, 1K, 10K, 100K, 1M, or custom)
- **Real-time Filtering**: Automatically hides videos below your threshold as you browse
- **View Count Tracking**: Shows how many low-view videos have been filtered out
- **Persistent Settings**: Your preferences are saved between browsing sessions
- **Works Everywhere**: Functions on YouTube home page, search results, and channel pages

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and active

## Usage

1. Navigate to YouTube.com
2. Click the YouTube View Filter icon in your browser toolbar
3. Adjust the view threshold using the slider or preset buttons
4. Click "Apply Changes" to update the filtering
5. Browse YouTube with only higher-viewed content visible

## How It Works

The extension scans YouTube pages for video elements and extracts their view counts. Videos with view counts below your specified threshold are hidden from view, creating a cleaner browsing experience focused on more popular content.

## Troubleshooting

If videos aren't being filtered correctly:
1. Make sure you're on YouTube.com
2. Try refreshing the page
3. Check that your threshold is set correctly
4. Enable debug mode by opening the browser console and typing `window.toggleYTViewFilterDebug()`

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is licensed under the Apache License Version 2.0 - see the LICENSE file for details.
