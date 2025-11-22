# 🎵 Beatify - Music Upload Admin Panel

A modern React application for uploading and managing music files with Firebase integration.

## ✨ Features

- 🎧 **Music Player**: Browse and play uploaded music tracks
- 📁 **File Upload**: Upload audio files with drag-and-drop support
- 📝 **Metadata Management**: Add track name, artist, genre, album, and release date
- 🔥 **Firebase Integration**: Secure file storage and database management
- 📊 **Upload Progress**: Real-time upload progress tracking
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- ✅ **Form Validation**: Client-side validation for all required fields
- 🧭 **Navigation**: Easy switching between Play and Admin pages
- 📱 **Mobile Friendly**: Fully responsive design for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v20.19.0 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd beatify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase** (Follow the detailed guide below)

4. **Configure Firebase**
   - Copy your Firebase config to `src/firebase/config.js`
   - Or create a `.env` file with your Firebase credentials

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Navigate the app**
   - Visit `http://localhost:5174/` to access the music player
   - Go to `http://localhost:5174/admin` to upload new music

## 🔥 Firebase Setup

### Quick Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "Beatify"
3. Enable **Firestore Database** and **Storage**
4. Copy your config to `src/firebase/config.js`

### Detailed Setup

See [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) for complete step-by-step instructions.

## 🛠️ Configuration

### Environment Variables (Recommended)

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Direct Configuration

Alternatively, update `src/firebase/config.js` directly with your Firebase project settings.

## 📱 Usage

### Music Player Features (`/play`)

- **Browse Library**: View all uploaded music tracks
- **Play Music**: Built-in audio player with controls
- **Track Information**: Display metadata (artist, album, genre, etc.)
- **Download**: Direct download links for each track
- **Responsive Grid**: Beautiful card-based layout

### Admin Panel Features (`/admin`)

- **Upload Music**: Select audio files (MP3, WAV, etc.)
- **Add Metadata**: Fill in track information
- **Select from Lists**: Choose from predefined artists and genres
- **Track Progress**: Monitor upload status in real-time
- **Validation**: Automatic form validation before upload

### Supported Audio Formats

- MP3
- WAV
- M4A
- FLAC
- OGG
- And other browser-supported audio formats

## 🏗️ Project Structure

```
beatify/
├── src/
│   ├── Pages/
│   │   ├── Admin.jsx          # Admin upload page (/admin)
│   │   ├── Admin.css          # Admin page styles
│   │   ├── Play.jsx           # Music player page (/play)
│   │   └── Play.css           # Play page styles
│   ├── firebase/
│   │   └── config.js          # Firebase configuration
│   ├── App.jsx                # Main app with routing
│   ├── App.css                # Navigation and layout styles
│   └── main.jsx               # App entry point
├── public/                    # Static assets
├── FIREBASE_SETUP_GUIDE.md    # Detailed Firebase setup
└── README.md                  # This file
```

## 🎨 Customization

### Adding New Artists/Genres

Edit the arrays in `src/Pages/Admin.jsx`:

```javascript
const genres = ['Pop', 'Rock', 'Hip Hop' /* add more */];
const artists = ['Taylor Swift', 'Drake' /* add more */];
```

### Styling

Modify `src/Pages/Admin.css` to customize the appearance.

### Firebase Rules

Update security rules in Firebase Console for production use.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🔒 Security

### Development vs Production

- **Development**: Uses test mode rules (open access)
- **Production**: Implement proper authentication and security rules

### Recommended Production Rules

See the Firebase setup guide for production-ready security rules.

## 🐛 Troubleshooting

### Common Issues

1. **Permission Denied**: Check Firebase security rules
2. **File Upload Fails**: Verify Firebase Storage is enabled
3. **Config Errors**: Double-check Firebase configuration values
4. **CORS Issues**: Ensure proper domain configuration in Firebase

### Getting Help

- Check browser console for detailed error messages
- Verify Firebase project settings
- Ensure all Firebase services are enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React + Vite
- Powered by Firebase
- UI inspired by modern design principles
