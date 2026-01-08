import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowLeft, FaHeart, FaRegHeart, FaPlay } from 'react-icons/fa';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import '../Pages/Play.css';
import oldMelodiesImg from '../Images/playlistbg/oldmelodies.png';
import romanticImg from '../Images/playlistbg/romantic.png';
import partyImg from '../Images/playlistbg/party.png';
import chillVibesImg from '../Images/playlistbg/chillvibes.png';
import gymImg from '../Images/playlistbg/gym.png';
import edmImg from '../Images/playlistbg/edm.png';
import globalImg from '../Images/playlistbg/Globalmusic.png';
import tharImg from '../Images/playlistbg/thar.png';

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
}) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map playlist names to their background images
  const playlistImages = {
    'Old Melodies': oldMelodiesImg,
    'Romantic Hits': romanticImg,
    'Party Anthems': partyImg,
    'Chill Vibes': chillVibesImg,
    'Workout Mix': gymImg,
    edm: edmImg,
    global: globalImg,
    Thar: tharImg,
  };

  // Get playlist image
  const playlistImage = playlistImages[playlistName] || tharImg;

  // Handle play playlist - plays the first track
  const handlePlayPlaylist = () => {
    if (tracks.length > 0 && onPlayTrack) {
      onPlayTrack(tracks[0]);
    }
  };

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
            left: '1px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
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

      {/* Playlist Cover Image */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
          }}
        >
          <img
            src={playlistImage}
            alt={playlistName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Play button overlay */}
          {tracks.length > 0 && (
            <button
              onClick={handlePlayPlaylist}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#667eea',
                fontSize: '1.5rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                zIndex: 10,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.transform =
                  'translate(-50%, -50%) scale(1.1)';
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform =
                  'translate(-50%, -50%) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(0, 0, 0, 0.3)';
              }}
              aria-label='Play playlist'
            >
              <FaPlay style={{ marginLeft: '3px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Tracks List */}
      <div className='scrollable-content'>
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
