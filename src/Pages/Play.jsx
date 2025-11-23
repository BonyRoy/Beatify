import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FaHeart, FaRegHeart, FaBars } from 'react-icons/fa';
import dance from '../Images/dance.gif';
import './Play.css';
import Artists from '../Components/Artists';

const Play = () => {
  const navigate = useNavigate();
  const [musicList, setMusicList] = useState([]);
  const [filteredMusicList, setFilteredMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const audioRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    fetchMusicList();
    // Load favorites (UUIDs) from localStorage
    const savedFavorites = localStorage.getItem('beatifyFavorites');
    if (savedFavorites) {
      try {
        const favoriteUUIDs = JSON.parse(savedFavorites);
        setFavorites(new Set(favoriteUUIDs));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  const fetchMusicList = async () => {
    try {
      const q = query(collection(db, 'music'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const tracks = [];

      querySnapshot.forEach(doc => {
        tracks.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setMusicList(tracks);
      setFilteredMusicList(tracks);
    } catch (error) {
      console.error('Error fetching music:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = musicList;

    // Filter by favorites if showFavoritesOnly is true
    if (showFavoritesOnly) {
      filtered = filtered.filter(track => {
        const trackIdentifier = track.uuid || track.id;
        return favorites.has(trackIdentifier);
      });
    }

    // Filter by selected artist
    if (selectedArtist) {
      filtered = filtered.filter(track => {
        const trackArtist = track.artist?.toLowerCase() || '';
        const artistName = selectedArtist.toLowerCase();
        return trackArtist.includes(artistName);
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(track => {
        const query = searchQuery.toLowerCase();
        return (
          track.name?.toLowerCase().includes(query) ||
          track.artist?.toLowerCase().includes(query) ||
          track.genre?.toLowerCase().includes(query) ||
          track.album?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredMusicList(filtered);
  }, [searchQuery, musicList, showFavoritesOnly, favorites, selectedArtist]);

  const playTrack = track => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [currentTrack, isPlaying]);

  const playNextTrack = () => {
    if (!currentTrack || filteredMusicList.length === 0) return;

    // Find current track index in filteredMusicList
    const currentIndex = filteredMusicList.findIndex(
      track => track.id === currentTrack.id
    );

    if (currentIndex === -1) return;

    // Get next track index (loop to first if last)
    const nextIndex = (currentIndex + 1) % filteredMusicList.length;
    const nextTrack = filteredMusicList[nextIndex];

    // Play next track
    setCurrentTrack(nextTrack);
    setIsPlaying(true);
  };

  const downloadTrack = track => {
    window.open(track.fileUrl, '_blank');
  };

  const toggleFavorite = (track, e) => {
    e.stopPropagation(); // Prevent card click when clicking heart

    // Use UUID if available, otherwise fall back to track ID
    const trackIdentifier = track.uuid || track.id;

    if (!trackIdentifier) {
      console.warn('Track has no UUID or ID:', track);
      return;
    }

    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(trackIdentifier)) {
        newFavorites.delete(trackIdentifier);
      } else {
        newFavorites.add(trackIdentifier);
      }
      // Save UUIDs list to localStorage
      const favoriteUUIDs = [...newFavorites];
      localStorage.setItem('beatifyFavorites', JSON.stringify(favoriteUUIDs));
      return newFavorites;
    });
  };

  const formatDate = timestamp => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const formatReleaseDate = dateString => {
    if (!dateString) return 'Unknown';
    // If it's already in YYYY-MM-DD format
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    // If it's a date object or timestamp
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if invalid date
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatFileSize = bytes => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className='play-container'>
        <div className='loading'>
          <div className='loading-spinner'></div>
          <p>Loading your music library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='play-container'>
      <div className='play-header'>
        <h1>🎧 Beatify</h1>
        <p>Hit play with no delay and enjoy your music your way!!</p>
      </div>

      {/* Hamburger Menu */}
      <div style={{ paddingTop: '20px' }} className='hamburger-menu-container'>
        <div
          className='hamburger-icon'
          onClick={() => setShowMenu(prev => !prev)} // <-- toggle
        >
          <FaBars />
        </div>

        {showMenu && ( // <-- conditionally rendered menu
          <div className='hamburger-dropdown'>
            {/* <button
              disabled={true}
              className='menu-item'
              onClick={() => navigate('/admin')}
            >
              Admin
            </button> */}
            <button
              className='menu-item'
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              {showFavoritesOnly ? 'Show All' : 'Favorites'}
            </button>
          </div>
        )}
      </div>

      {musicList.length > 0 && (
        <div className='search-container'>
          <input
            type='text'
            className='search-input'
            placeholder='🔍 Search by song, artist, genre, or album...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {musicList.length > 0 && (
        <div className='artists-section'>
          <Artists
            searchQuery={searchQuery}
            onArtistClick={artistName => {
              // Toggle: if same artist clicked, deselect; otherwise select new artist
              setSelectedArtist(prev =>
                prev === artistName ? null : artistName
              );
            }}
            selectedArtist={selectedArtist}
          />
        </div>
      )}

      <div className='scrollable-content'>
        {musicList.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>🎵</div>
            <h2>No Music Found</h2>
            <p>Ask Admin to upload some tracks in the panel to get started!</p>
          </div>
        ) : filteredMusicList.length === 0 && showFavoritesOnly ? (
          <div className='empty-state'>
            <div className='empty-icon'>❤️</div>
            <h2>No Favorites Yet</h2>
            <p>
              Start adding songs to your favorites by clicking the heart icon!
            </p>
          </div>
        ) : filteredMusicList.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>🔍</div>
            <h2>No Results Found</h2>
            <p>Try adjusting your search query.</p>
          </div>
        ) : (
          <div className='music-grid'>
            {filteredMusicList.map(track => (
              <div
                key={track.id}
                className={`track-card ${currentTrack?.id === track.id ? 'selected' : ''}`}
                onClick={() => playTrack(track)}
              >
                <div className='track-header'>
                  <h3 className='track-name'>{track.name}</h3>
                  <button
                    className='favorite-button'
                    onClick={e => toggleFavorite(track, e)}
                    aria-label={
                      favorites.has(track.uuid || track.id)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    {favorites.has(track.uuid || track.id) ? (
                      <FaHeart className='heart-icon filled' />
                    ) : (
                      <FaRegHeart className='heart-icon outline' />
                    )}
                  </button>
                </div>
                <p className='track-artist'>by {track.artist}</p>
                <div className='track-grid-container'>
                  <div className='track-details'>
                    <span className='track-genre'>{track.genre}</span>
                    <div className='track-album-container'>
                      <div className='track-album-wrapper'>
                        <span className='track-album'>
                          Movie/Album: {track.album}
                        </span>
                        <span className='track-album track-album-duplicate'>
                          Movie/Album: {track.album}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='track-image-container'>
                    <img
                      style={{
                        borderRadius: '31px',
                        width: '60%',
                        height: 'auto',
                        objectFit: 'cover',
                      }}
                      src={dance}
                    />
                  </div>
                  <span>Released: {formatReleaseDate(track.releaseDate)}</span>
                  <span>Size: {formatFileSize(track.fileSize)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentTrack && (
        <div className='audio-player'>
          <div className='player-info'>
            <h4>{currentTrack.name}</h4>
            <p>
              {currentTrack.artist} - {currentTrack.album}
            </p>
          </div>
          <audio
            ref={audioRef}
            controls
            autoPlay={isPlaying}
            src={currentTrack.fileUrl}
            onEnded={playNextTrack}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {!currentTrack && (
        <div className='fixed-action-bar'>
          <div className='no-track-selected'>
            Select a track to play/download
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;
