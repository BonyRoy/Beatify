import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FaHeart, FaRegHeart, FaBars } from 'react-icons/fa';
import dance from '../Images/dance.gif';
import './Play.css';

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
  const audioRef = useRef(null);

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
  }, [searchQuery, musicList, showFavoritesOnly, favorites]);

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
      <div className='hamburger-menu-container'>
        <div className='hamburger-icon'>
          <FaBars />
        </div>
        <div className='hamburger-dropdown'>
          <button className='menu-item' onClick={() => navigate('/admin')}>
            Admin
          </button>
          <button
            className='menu-item'
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? 'Show All' : 'Favorites'}
          </button>
        </div>
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

      {musicList.length === 0 ? (
        <div className='empty-state'>
          <div className='empty-icon'>🎵</div>
          <h2>No Music Found</h2>
          <p>Upload some tracks in the Admin panel to get started!</p>
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
        <div style={{ marginBottom: '150px' }}>
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
                <div className='track-details'>
                  <span className='track-genre'>{track.genre}</span>
                  <span className='track-album'>
                    Movie/Album: {track.album}
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}
                >
                  <div className='track-meta'>
                    <span>Released: {track.releaseDate}</span>
                    <span>Size: {formatFileSize(track.fileSize)}</span>

                    {/* <span>Uploaded: {formatDate(track.uploadedAt)}</span> */}
                    {/* {track.uuid && (
                    <span className='track-uuid'>
                      UUID: <code>{track.uuid}</code>
                    </span>
                  )} */}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px',
                    }}
                  >
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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            onEnded={() => setIsPlaying(false)}
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className='fixed-action-bar'>
        {currentTrack ? (
          <button
            className='fixed-download-button'
            onClick={() => downloadTrack(currentTrack)}
          >
            📥 Download
          </button>
        ) : (
          <div className='no-track-selected'>
            Select a track to play/download
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
