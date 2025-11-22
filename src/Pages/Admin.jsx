import React, { useState } from 'react';
import { storage, db } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './Admin.css';

const Admin = () => {
  // Generate UUID function (using crypto.randomUUID or fallback)
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    genre: '',
    album: '',
    releaseDate: '',
  });
  const [musicFile, setMusicFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trackUUID, setTrackUUID] = useState(generateUUID());

  // Predefined lists for dropdowns
  const genres = [
    'Bollywood-Romantic',
    'Pop',
    'Rock',
    'Hip Hop',
    'R&B',
    'Country',
    'Electronic',
    'Jazz',
    'Classical',
    'Folk',
    'Reggae',
    'Blues',
    'Indie',
    'Alternative',
    'Punk',
  ];

  const artists = [
    'Taylor Swift',
    'Javed Ali',
    'Rahat Fateh Ali Khan, Shankar Mahadevan & Richa Sharma',
    'Mohan Kannan',
    'Drake',
    'Ariana Grande',
    'Ed Sheeran',
    'Billie Eilish',
    'The Weeknd',
    'Dua Lipa',
    'Post Malone',
    'Olivia Rodrigo',
    'Harry Styles',
    'Adele',
    'Bruno Mars',
    'Beyoncé',
    'Justin Bieber',
    'Rihanna',
  ];

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setMusicFile(file);
      // Generate new UUID for each new file upload
      setTrackUUID(generateUUID());
    } else {
      alert('Please select a valid audio file');
      e.target.value = '';
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!musicFile) {
      alert('Please select a music file');
      return;
    }

    if (
      !formData.name ||
      !formData.artist ||
      !formData.genre ||
      !formData.album ||
      !formData.releaseDate
    ) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${musicFile.name}`;
      const storageRef = ref(storage, `music/${fileName}`);

      // Upload file to Firebase Storage
      setUploadProgress(25);
      const snapshot = await uploadBytes(storageRef, musicFile);

      setUploadProgress(50);
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadProgress(75);
      // Save metadata to Firestore
      await addDoc(collection(db, 'music'), {
        uuid: trackUUID,
        name: formData.name,
        artist: formData.artist,
        genre: formData.genre,
        album: formData.album,
        releaseDate: formData.releaseDate,
        fileUrl: downloadURL,
        fileName: fileName,
        originalFileName: musicFile.name,
        fileSize: musicFile.size,
        uploadedAt: serverTimestamp(),
        createdBy: 'admin',
      });

      setUploadProgress(100);

      // Reset form
      setFormData({
        name: '',
        artist: '',
        genre: '',
        album: '',
        releaseDate: '',
      });
      setMusicFile(null);
      setTrackUUID(generateUUID()); // Generate new UUID for next upload
      document.getElementById('musicFile').value = '';

      alert('Music uploaded successfully!');
    } catch (error) {
      console.error('Error uploading music:', error);
      alert('Error uploading music: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className='admin-container'>
      <div className='admin-header'>
        <h1>🎵 Music Upload Admin Panel</h1>
        <p>Upload new music tracks to your library</p>
      </div>

      <form onSubmit={handleSubmit} className='upload-form'>
        <div className='form-section'>
          <h2>📁 Music File</h2>
          <div className='file-input-container'>
            <input
              type='file'
              id='musicFile'
              accept='audio/*'
              onChange={handleFileChange}
              className='file-input'
              required
            />
            <label htmlFor='musicFile' className='file-input-label'>
              {musicFile ? `Selected: ${musicFile.name}` : 'Choose Music File'}
            </label>
          </div>
        </div>

        <div className='form-section'>
          <h2>📝 Track Information</h2>
          <div className='form-grid'>
            <div className='form-group uuid-group'>
              <label htmlFor='uuid'>Track UUID (Auto-generated)</label>
              <input
                type='text'
                id='uuid'
                name='uuid'
                value={trackUUID}
                readOnly
                className='uuid-input'
                title='Unique identifier for this track (auto-generated)'
              />
              <button
                type='button'
                onClick={() => setTrackUUID(generateUUID())}
                className='regenerate-uuid-btn'
                title='Generate new UUID'
              >
                🔄 Regenerate
              </button>
            </div>

            <div className='form-group'>
              <label htmlFor='name'>Track Name *</label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Enter track name'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='artist'>Artist *</label>
              <select
                id='artist'
                name='artist'
                value={formData.artist}
                onChange={handleInputChange}
                required
              >
                <option value=''>Select Artist</option>
                {artists.map((artist, index) => (
                  <option key={index} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='genre'>Genre *</label>
              <select
                id='genre'
                name='genre'
                value={formData.genre}
                onChange={handleInputChange}
                required
              >
                <option value=''>Select Genre</option>
                {genres.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div className='form-group'>
              <label htmlFor='album'>Album *</label>
              <input
                type='text'
                id='album'
                name='album'
                value={formData.album}
                onChange={handleInputChange}
                placeholder='Enter album name'
                required
              />
            </div>

            <div className='form-group'>
              <label htmlFor='releaseDate'>Release Date *</label>
              <input
                type='date'
                id='releaseDate'
                name='releaseDate'
                value={formData.releaseDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        {uploading && (
          <div className='upload-progress'>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        )}

        <button type='submit' className='upload-button' disabled={uploading}>
          {uploading ? '🔄 Uploading...' : '🚀 Upload Music'}
        </button>
      </form>
    </div>
  );
};

export default Admin;
