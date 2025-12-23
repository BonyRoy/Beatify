import React, { useState, useEffect, useRef } from 'react';
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
}) => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchTracks();
  }, [trackIds]);

  const fetchTracks = async () => {
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
  };

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
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      track => track.id === currentTrack.id
    );

    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];

    setCurrentTrack(nextTrack);
    setIsPlaying(true);
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
      <div
        style={{
          //   padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: 'white',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
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
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <FaArrowLeft />
        </button>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.8rem',
              fontWeight: '700',
            }}
          >
            {playlistName}
          </h1>
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
                onClick={() => playTrack(track)}
              >
                <div className='track-header'>
                  <div>
                    <h3 className='track-name'>{track.name}</h3>
                    <p className='track-artist'>by {track.artist}</p>
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
                <div className='track-grid-container'>
                  <div className='track-details'>
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
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.6rem',
                          color: 'rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        Released:{' '}
                        {formatReleaseDate?.(track.releaseDate) || 'Unknown'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6rem',
                          color: 'rgba(255, 255, 255, 0.8)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        Size: {formatFileSize?.(track.fileSize) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className='track-image-container'>
                    <img
                      style={{
                        borderRadius: '31px',
                        width: '60%',
                        height: '62.6px',
                        objectFit: 'cover',
                      }}
                      src={getRandomDanceGif?.(index) || ''}
                      alt='Dancing animation'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio Player */}
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

export default PlaylistDetail;
