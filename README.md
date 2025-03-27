# Secure Notes - Chrome Extension

A secure, password-protected note-taking Chrome extension with group organization and cross-device synchronization.

![Secure Notes Screenshot](screenshots/secure-notes.png)

## Features

- **Password Protection**: Access your notes with a secure password
- **Group Organization**: Organize notes into custom groups
- **Cross-Device Sync**: Automatically sync notes across devices
- **Responsive Design**: Clean, modern interface with Bootstrap 5 styling
- **Simple & Fast**: Lightweight extension that loads quickly

## How It Works

### Security

- Password-protected access to your notes
- Notes are only visible after successful authentication
- Password is stored as a secure hash, not in plain text

### Note Management

- Create, view, and delete notes
- Organize notes into customizable groups
- Notes display with timestamps and group tags
- Filter notes by specific groups

### Data Synchronization

- Notes automatically sync across all of your devices
- Uses Chrome's built-in sync storage API
- No external server or account needed beyond your Chrome profile

## Installation

### From Chrome Web Store

1. Visit the [Secure Notes extension page](https://chrome.google.com/webstore/detail/secure-notes/YOUR_EXTENSION_ID) on Chrome Web Store
2. Click "Add to Chrome"
3. Confirm the installation

### From Source

1. Clone this repository:
   ```
   git clone https://github.com/YOUR_USERNAME/secure-notes.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your toolbar

## Usage

### First Time Setup

1. Click the Secure Notes icon in your Chrome toolbar
2. Enter a password to secure your notes
3. This password will be required for future access

### Creating Notes

1. After logging in, type your note in the text area
2. Select a group from the dropdown (or use "Default")
3. Click "Save Note" or press Ctrl+Enter

### Managing Groups

1. Click "Manage Groups" to create or delete note groups
2. Enter a group name and click "Add" to create a new group
3. Click "Delete" next to any custom group to remove it
   - Notes in deleted groups are moved to the Default group

### Viewing Notes

1. Use the tabs to filter notes by group
2. Notes are displayed with newest at the top
3. Each note shows its creation time and group

### Deleting Notes

1. Click the "X" button on any note to delete it
2. Confirm the deletion when prompted

## Developer Information

### Project Structure

```
secure-notes/
├── manifest.json      # Extension configuration
├── popup.html         # Main UI
├── popup.js           # Application logic
├── README.md          # Documentation
└── images/            # Icons and images
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Technologies Used

- **JavaScript**: Core application logic
- **Chrome Storage API**: Data persistence and synchronization
- **Bootstrap 5**: Styling (implemented with inline CSS for CSP compliance)
- **Chrome Extension APIs**: Integration with browser

### Chrome Sync Implementation

The extension uses `chrome.storage.sync` to automatically synchronize notes across devices where the user is signed into Chrome with the same account.

## Privacy & Security

- All data is stored locally in your browser using Chrome's storage API
- Data syncs across your devices through your Chrome profile
- No data is sent to external servers
- Notes are only accessible after password authentication

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Bootstrap 5](https://getbootstrap.com/)
- Developed for Chrome using Extension Manifest V3

---

Made with ❤️ by [Your Name]
