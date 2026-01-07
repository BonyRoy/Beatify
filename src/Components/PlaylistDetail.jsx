import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import '../Pages/Play.css';

const PlaylistDetail = ({
  playlistName,
  trackIds,
  onBack,
  currentTheme,
  favorites,
  onToggleFavorite,
  formatReleaseDate,
  formatFileSize,
  getRandomDanceGif,
  // Shared player state from Play.jsx (AudioPlayer rendered by parent)
  currentTrack,
  onPlayTrack,
  setIsPlayerMinimized,
}) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollableContentRef = useRef(null);

  const fetchTracks = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'music'));
      const allTracks = [];

      querySnapshot.forEach(doc => {
        allTracks.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Filter tracks by UUIDs in the playlist
      const trackIdSet = new Set(trackIds);
      const playlistTracks = allTracks.filter(track => {
        const trackIdentifier = track.uuid || track.id;
        return trackIdSet.has(trackIdentifier);
      });

      setTracks(playlistTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  }, [trackIds]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  // Scroll detection for minimizing player
  useEffect(() => {
    const scrollableElement = scrollableContentRef.current;
    if (!scrollableElement) return;

    const handleScroll = () => {
      const { scrollTop } = scrollableElement;
      // Minimize player when scrolling down (more than 100px)
      if (scrollTop > 100 && currentTrack && setIsPlayerMinimized) {
        setIsPlayerMinimized(true);
      } else if (scrollTop <= 100 && setIsPlayerMinimized) {
        setIsPlayerMinimized(false);
      }
    };

    scrollableElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [currentTrack, setIsPlayerMinimized]);

  // Wrapper function for playing tracks
  const handlePlayTrack = track => {
    if (onPlayTrack) {
      onPlayTrack(track);
    }
  };

  const toggleFavorite = (track, e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(track, e);
    }
  };

  if (loading) {
    return (
      <div
        className='play-container'
        style={{
          background:
            currentTheme || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className='loading'>
          <div className='loading-spinner'></div>
          <p>Loading tracks...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className='play-container'
      style={{
        background:
          currentTheme || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Header */}
      <div className='play-header' style={{ position: 'relative' }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <FaArrowLeft />
        </button>
        <h2>{playlistName}</h2>
      </div>

      {/* Tracks List */}
      <div className='scrollable-content' ref={scrollableContentRef}>
        {tracks.length === 0 ? (
          <div className='empty-state'>
            <div className='empty-icon'>
              <p style={{ fontSize: '2rem' }}>🎵</p>
            </div>
            <h2>No tracks in this playlist</h2>
            <p>This playlist is empty.</p>
          </div>
        ) : (
          <div
            className='music-grid'
            style={{
              paddingBottom: currentTrack ? '68px' : '0px',
            }}
          >
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className={`track-card ${currentTrack?.id === track.id ? 'selected' : ''}`}
                onClick={() => handlePlayTrack(track)}
              >
                <div className='track-content-wrapper'>
                  <div className='track-image-container'>
                    <img
                      src={getRandomDanceGif?.(index) || ''}
                      alt='Dancing animation'
                    />
                  </div>
                  <div className='track-info-wrapper'>
                    <div className='track-header'>
                      <div className='track-title-section'>
                        <h3 className='track-name'>{track.name}</h3>
                        <div className='track-meta-info'>
                          <span className='track-meta-item'>
                            Released on:{' '}
                            {formatReleaseDate?.(track.releaseDate) ||
                              'Unknown'}
                          </span>
                        </div>
                        <div className='track-artist-album-container'>
                          <div className='track-artist-album-wrapper'>
                            <span className='track-artist-album'>
                              {track.artist} - {track.album}
                            </span>
                            <span className='track-artist-album track-artist-album-duplicate'>
                              {track.artist} - {track.album}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className='favorite-button'
                        onClick={e => toggleFavorite(track, e)}
                        aria-label={
                          favorites?.has(track.uuid || track.id)
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                      >
                        {favorites?.has(track.uuid || track.id) ? (
                          <FaHeart className='heart-icon filled' />
                        ) : (
                          <FaRegHeart className='heart-icon outline' />
                        )}
                      </button>
                    </div>
                    <div className='track-meta-info'>
                      <span className='track-meta-separator'>Size:</span>
                      <span className='track-meta-item'>
                        {formatFileSize?.(track.fileSize) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* AudioPlayer is rendered by parent Play.jsx to prevent restart when switching views */}
    </div>
  );
};

export default PlaylistDetail;
