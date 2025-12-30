import React, { useState, useEffect, useRef } from 'react';
import { storage, db } from '../firebase/config';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
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
  const [isOtherGenre, setIsOtherGenre] = useState(false);
  const [isOtherArtist, setIsOtherArtist] = useState(false);
  const [customGenre, setCustomGenre] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [existingTracks, setExistingTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [artistDropdownOpen, setArtistDropdownOpen] = useState(false);
  const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Admin password - change this to your desired password
  const ADMIN_PASSWORD = '8369877891';

  // Predefined lists for dropdowns
  const genres = [
    'Bollywood-Romantic',
    'Filmi-Dance',
    'Filmi-Classical',
    'Filmi-Sufi',
    'Filmi-Folk',
    'Bollywood-Pop',
    'Bollywood-Hip Hop',
    'Bollywood-R&B',
    'Bollywood-Rock',
    'Bollywood-Electronic',
    'Bollywood-Jazz',
    'Bollywood-Reggae',
    'Bollywood-Blues',
    'Bollywood-Indie',
    'Bollywood-Alternative',
    'Bollywood-Punk',
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
    'Lata Mangeshkar',
    'Asha Bhosle',
    'Mohammed Rafi',
    'Kishore Kumar',
    'Mukesh',
    'Manna Dey',
    'Udit Narayan',
    'Kumar Sanu',
    'Sonu Nigam',
    'Alka Yagnik',
    'Shreya Ghoshal',
    'Arijit Singh',
    'Neha Kakkar',
    'Armaan Malik',
    'Javed Ali',
    'Sunidhi Chauhan',
    'Kanika Kapoor',
    'Badshah',
    'Darshan Raval',
  ];

  useEffect(() => {
    // Check if user was previously authenticated (stored in sessionStorage)
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchExistingTracks();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchExistingTracks();
    }
  }, [isAuthenticated]);

  const fetchExistingTracks = async () => {
    try {
      setLoadingTracks(true);
      const q = query(collection(db, 'music'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const tracks = [];
      querySnapshot.forEach(doc => {
        tracks.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setExistingTracks(tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = e => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsOtherGenre(true);
      setFormData(prev => ({ ...prev, genre: '' }));
    } else {
      setIsOtherGenre(false);
      setFormData(prev => ({ ...prev, genre: value }));
    }
  };

  const handleArtistChange = e => {
    const value = e.target.value;
    if (value === 'Other') {
      setIsOtherArtist(true);
      setFormData(prev => ({ ...prev, artist: '' }));
    } else {
      setIsOtherArtist(false);
      setFormData(prev => ({ ...prev, artist: value }));
    }
  };

  const resetArtistToDropdown = () => {
    setIsOtherArtist(false);
    setCustomArtist('');
    setFormData(prev => ({ ...prev, artist: '' }));
  };

  const resetGenreToDropdown = () => {
    setIsOtherGenre(false);
    setCustomGenre('');
    setFormData(prev => ({ ...prev, genre: '' }));
  };

  // Custom Dropdown Component
  const CustomDropdown = ({
    // id,
    value,
    options,
    onChange,
    placeholder,
    onOtherSelect,
    isOpen,
    setIsOpen,
  }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = event => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, setIsOpen]);

    const handleSelect = optionValue => {
      if (optionValue === 'Other') {
        onOtherSelect();
      } else {
        onChange({ target: { value: optionValue } });
      }
      setIsOpen(false);
    };

    const selectedLabel =
      value === '' ? placeholder : options.find(opt => opt === value) || value;

    return (
      <div className='custom-dropdown' ref={dropdownRef}>
        <div
          className='custom-dropdown-toggle'
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedLabel}</span>
          <span className='dropdown-arrow'>{isOpen ? '▲' : '▼'}</span>
        </div>
        {isOpen && (
          <div className='custom-dropdown-menu'>
            {options.map((option, index) => (
              <div
                key={index}
                className={`custom-dropdown-item ${
                  value === option ? 'selected' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))}
            <div
              className='custom-dropdown-item other-option'
              onClick={() => handleSelect('Other')}
            >
              Other
            </div>
          </div>
        )}
      </div>
    );
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

    // Use custom values if "Other" is selected
    const finalGenre = isOtherGenre ? customGenre : formData.genre;
    const finalArtist = isOtherArtist ? customArtist : formData.artist;

    if (!musicFile && !editingTrackId) {
      alert('Please select a music file');
      return;
    }

    if (
      !formData.name ||
      !finalArtist ||
      !finalGenre ||
      !formData.album ||
      !formData.releaseDate
    ) {
      alert('Please fill in all fields');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let downloadURL = '';
      let fileName = '';
      let fileSize = 0;

      if (editingTrackId) {
        // Editing existing track
        const existingTrack = existingTracks.find(t => t.id === editingTrackId);
        if (musicFile) {
          // New file uploaded, delete old one and upload new
          if (existingTrack.fileName) {
            const oldFileRef = ref(storage, `music/${existingTrack.fileName}`);
            try {
              await deleteObject(oldFileRef);
            } catch (error) {
              console.warn('Error deleting old file:', error);
            }
          }

          const timestamp = Date.now();
          fileName = `${timestamp}_${musicFile.name}`;
          const storageRef = ref(storage, `music/${fileName}`);
          setUploadProgress(25);
          const snapshot = await uploadBytes(storageRef, musicFile);
          setUploadProgress(50);
          downloadURL = await getDownloadURL(snapshot.ref);
          fileSize = musicFile.size;
        } else {
          // No new file, keep existing
          downloadURL = existingTrack.fileUrl;
          fileName = existingTrack.fileName;
          fileSize = existingTrack.fileSize;
        }

        setUploadProgress(75);
        // Update Firestore document
        const trackRef = doc(db, 'music', editingTrackId);
        await updateDoc(trackRef, {
          name: formData.name,
          artist: finalArtist,
          genre: finalGenre,
          album: formData.album,
          releaseDate: formData.releaseDate,
          fileUrl: downloadURL,
          fileName: fileName,
          fileSize: fileSize,
          ...(musicFile && { originalFileName: musicFile.name }),
        });

        setUploadProgress(100);
        alert('Track updated successfully!');
        setEditingTrackId(null);
      } else {
        // Creating new track
        const timestamp = Date.now();
        fileName = `${timestamp}_${musicFile.name}`;
        const storageRef = ref(storage, `music/${fileName}`);

        setUploadProgress(25);
        const snapshot = await uploadBytes(storageRef, musicFile);

        setUploadProgress(50);
        downloadURL = await getDownloadURL(snapshot.ref);
        fileSize = musicFile.size;

        setUploadProgress(75);
        // Save metadata to Firestore
        await addDoc(collection(db, 'music'), {
          uuid: trackUUID,
          name: formData.name,
          artist: finalArtist,
          genre: finalGenre,
          album: formData.album,
          releaseDate: formData.releaseDate,
          fileUrl: downloadURL,
          fileName: fileName,
          originalFileName: musicFile.name,
          fileSize: fileSize,
          uploadedAt: serverTimestamp(),
          createdBy: 'admin',
        });

        setUploadProgress(100);
        alert('Music uploaded successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        artist: '',
        genre: '',
        album: '',
        releaseDate: '',
      });
      setMusicFile(null);
      setTrackUUID(generateUUID());
      setIsOtherGenre(false);
      setIsOtherArtist(false);
      setCustomGenre('');
      setCustomArtist('');
      if (document.getElementById('musicFile')) {
        document.getElementById('musicFile').value = '';
      }

      // Refresh tracks list
      await fetchExistingTracks();
    } catch (error) {
      console.error('Error uploading/updating music:', error);
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = track => {
    setEditingTrackId(track.id);
    setFormData({
      name: track.name || '',
      artist: track.artist || '',
      genre: track.genre || '',
      album: track.album || '',
      releaseDate: track.releaseDate || '',
    });

    // Check if genre/artist is in predefined lists
    const genreInList = genres.includes(track.genre);
    const artistInList = artists.includes(track.artist);

    setIsOtherGenre(!genreInList);
    setIsOtherArtist(!artistInList);

    if (!genreInList) {
      setCustomGenre(track.genre || '');
    }
    if (!artistInList) {
      setCustomArtist(track.artist || '');
    }

    setTrackUUID(track.uuid || generateUUID());
    setMusicFile(null);
    if (document.getElementById('musicFile')) {
      document.getElementById('musicFile').value = '';
    }

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async trackId => {
    if (!window.confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      const track = existingTracks.find(t => t.id === trackId);

      // Delete from Firestore
      await deleteDoc(doc(db, 'music', trackId));

      // Delete from Storage
      if (track.fileName) {
        const fileRef = ref(storage, `music/${track.fileName}`);
        try {
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('Error deleting file from storage:', error);
        }
      }

      alert('Track deleted successfully!');
      await fetchExistingTracks();
    } catch (error) {
      console.error('Error deleting track:', error);
      alert('Error deleting track: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingTrackId(null);
    setFormData({
      name: '',
      artist: '',
      genre: '',
      album: '',
      releaseDate: '',
    });
    setMusicFile(null);
    setIsOtherGenre(false);
    setIsOtherArtist(false);
    setCustomGenre('');
    setCustomArtist('');
    setTrackUUID(generateUUID());
    if (document.getElementById('musicFile')) {
      document.getElementById('musicFile').value = '';
    }
  };

  const handlePasswordSubmit = e => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      setPasswordInput('');
      sessionStorage.setItem('adminAuthenticated', 'true');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  // Password Modal
  if (!isAuthenticated) {
    return (
      <div className='admin-container'>
        <div className='password-modal-overlay'>
          <div className='password-modal'>
            <div className='password-modal-header'>
              <h2>🔒 Admin Access Required</h2>
              <p>Please enter the password to access the admin panel</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className='password-form'>
              <div className='password-input-group'>
                <input
                  type='password'
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder='Enter password'
                  className='password-input'
                  autoFocus
                />
                {passwordError && (
                  <div className='password-error'>{passwordError}</div>
                )}
              </div>
              <button type='submit' className='password-submit-btn'>
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='admin-container'>
      <div className='admin-header'>
        <h1 style={{ color: 'black' }}>🎵 Music Upload Admin Panel</h1>
        <p style={{ color: 'black' }}>
          Upload new music tracks to your library
        </p>
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
              required={!editingTrackId}
            />
            <label htmlFor='musicFile' className='file-input-label'>
              {musicFile
                ? `Selected: ${musicFile.name}`
                : editingTrackId
                  ? 'Choose New Music File (Optional)'
                  : 'Choose Music File'}
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
              <label
                htmlFor='artist'
                onClick={isOtherArtist ? resetArtistToDropdown : undefined}
                className={isOtherArtist ? 'clickable-label' : ''}
                title={isOtherArtist ? 'Click to switch back to dropdown' : ''}
              >
                Artist * {isOtherArtist && '← Click to go back'}
              </label>
              {isOtherArtist ? (
                <input
                  type='text'
                  id='artist'
                  name='artist'
                  value={customArtist}
                  onChange={e => setCustomArtist(e.target.value)}
                  placeholder='Enter custom artist name'
                  required
                />
              ) : (
                <CustomDropdown
                  id='artist'
                  value={formData.artist}
                  options={artists}
                  onChange={handleArtistChange}
                  placeholder='Select Artist'
                  onOtherSelect={() => {
                    setIsOtherArtist(true);
                    setFormData(prev => ({ ...prev, artist: '' }));
                  }}
                  isOpen={artistDropdownOpen}
                  setIsOpen={setArtistDropdownOpen}
                />
              )}
            </div>

            <div className='form-group'>
              <label
                htmlFor='genre'
                onClick={isOtherGenre ? resetGenreToDropdown : undefined}
                className={isOtherGenre ? 'clickable-label' : ''}
                title={isOtherGenre ? 'Click to switch back to dropdown' : ''}
              >
                Genre * {isOtherGenre && '← Click to go back'}
              </label>
              {isOtherGenre ? (
                <input
                  type='text'
                  id='genre'
                  name='genre'
                  value={customGenre}
                  onChange={e => setCustomGenre(e.target.value)}
                  placeholder='Enter custom genre'
                  required
                />
              ) : (
                <CustomDropdown
                  id='genre'
                  value={formData.genre}
                  options={genres}
                  onChange={handleGenreChange}
                  placeholder='Select Genre'
                  onOtherSelect={() => {
                    setIsOtherGenre(true);
                    setFormData(prev => ({ ...prev, genre: '' }));
                  }}
                  isOpen={genreDropdownOpen}
                  setIsOpen={setGenreDropdownOpen}
                />
              )}
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

        <div className='form-actions'>
          <button type='submit' className='upload-button' disabled={uploading}>
            {uploading
              ? '🔄 Uploading...'
              : editingTrackId
                ? '💾 Update Track'
                : '🚀 Upload Music'}
          </button>
          {editingTrackId && (
            <button
              type='button'
              className='cancel-button'
              onClick={handleCancelEdit}
              disabled={uploading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Tracks List */}
      <div className='existing-tracks-section'>
        <h2>📋 Existing Tracks</h2>
        {loadingTracks ? (
          <div className='loading-tracks'>Loading tracks...</div>
        ) : (
          <>
            <div className='tracks-count-container'>
              <span className='tracks-count'>
                Total: <strong>{existingTracks.length}</strong>
                {searchQuery.trim() && (
                  <>
                    {' | '}
                    Showing:{' '}
                    <strong>
                      {
                        existingTracks.filter(track => {
                          if (!searchQuery.trim()) return true;
                          const query = searchQuery.toLowerCase();
                          return (
                            track.name?.toLowerCase().includes(query) ||
                            track.artist?.toLowerCase().includes(query) ||
                            track.genre?.toLowerCase().includes(query) ||
                            track.album?.toLowerCase().includes(query) ||
                            track.uuid?.toLowerCase().includes(query)
                          );
                        }).length
                      }
                    </strong>
                  </>
                )}
              </span>
            </div>
            <div className='search-container'>
              <input
                type='text'
                placeholder='🔍 Search tracks by name, artist, genre, album...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='search-input'
              />
            </div>
            {existingTracks.length === 0 ? (
              <div className='no-tracks'>No tracks uploaded yet.</div>
            ) : (
              <div className='tracks-list-container'>
                <div className='tracks-list'>
                  {existingTracks
                    .filter(track => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        track.name?.toLowerCase().includes(query) ||
                        track.artist?.toLowerCase().includes(query) ||
                        track.genre?.toLowerCase().includes(query) ||
                        track.album?.toLowerCase().includes(query) ||
                        track.uuid?.toLowerCase().includes(query)
                      );
                    })
                    .map(track => (
                      <div key={track.id} className='track-item'>
                        <div className='track-item-info'>
                          <h3>{track.name}</h3>
                          <p>
                            <strong>Artist:</strong> {track.artist} |{' '}
                            <strong>Genre:</strong> {track.genre} |{' '}
                            <strong>Album:</strong> {track.album}
                          </p>
                          <p>
                            <strong>Release Date:</strong> {track.releaseDate} |{' '}
                            <strong>UUID:</strong> {track.uuid || 'N/A'}
                          </p>
                        </div>
                        <div className='track-item-actions'>
                          <button
                            className='edit-button'
                            onClick={() => handleEdit(track)}
                            disabled={uploading}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className='delete-button'
                            onClick={() => handleDelete(track.id)}
                            disabled={uploading}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
