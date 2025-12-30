import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaStepForward,
  FaStepBackward,
  FaPlay,
  FaPause,
  FaSlidersH,
} from 'react-icons/fa';
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizerGains, setEqualizerGains] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodesRef = useRef([]);
  const biquadFiltersRef = useRef([]);
  const isSourceCreatedRef = useRef(false);

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

  // Initialize Web Audio API and equalizer
  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      if (!isSourceCreatedRef.current) {
        try {
          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.disconnect();
            } catch {
              // Source might already be disconnected
            }
          }

          const source = audioContext.createMediaElementSource(
            audioRef.current
          );
          sourceNodeRef.current = source;
          isSourceCreatedRef.current = true;

          const frequencies = [
            31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
          ];

          const masterGain = audioContext.createGain();
          masterGain.gain.value = 1;

          const filters = [];

          frequencies.forEach((freq, index) => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = equalizerGains[index];
            filters.push(filter);
          });

          let currentNode = source;
          filters.forEach(filter => {
            currentNode.connect(filter);
            currentNode = filter;
          });
          currentNode.connect(masterGain);
          masterGain.connect(audioContext.destination);

          biquadFiltersRef.current = filters;
          gainNodesRef.current = [masterGain];
        } catch (error) {
          console.error('Error creating audio source:', error);
        }
      } else {
        if (biquadFiltersRef.current.length > 0) {
          equalizerGains.forEach((gain, index) => {
            if (biquadFiltersRef.current[index]) {
              biquadFiltersRef.current[index].gain.value = gain;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  }, [equalizerGains]);

  useEffect(() => {
    if (biquadFiltersRef.current.length > 0) {
      equalizerGains.forEach((gain, index) => {
        if (biquadFiltersRef.current[index]) {
          biquadFiltersRef.current[index].gain.value = gain;
        }
      });
    }
  }, [equalizerGains]);

  const playTrack = track => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      initializeAudioContext();
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [currentTrack, isPlaying, initializeAudioContext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      const handleCanPlay = () => {
        initializeAudioContext();
      };
      audio.addEventListener('canplay', handleCanPlay);
      return () => {
        if (audio) {
          audio.removeEventListener('canplay', handleCanPlay);
        }
      };
    }
  }, [currentTrack, initializeAudioContext]);

  const playNextTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      track => track.id === currentTrack.id
    );

    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];

    setCurrentTrack(nextTrack);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [currentTrack, tracks]);

  const playPreviousTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;

    const currentIndex = tracks.findIndex(
      track => track.id === currentTrack.id
    );

    if (currentIndex === -1) return;

    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    const prevTrack = tracks[prevIndex];

    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    setCurrentTime(0);
  }, [currentTrack, tracks]);

  const formatTime = seconds => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEqualizerChange = (index, value) => {
    const newGains = [...equalizerGains];
    newGains[index] = parseFloat(value);
    setEqualizerGains(newGains);
  };

  const resetEqualizer = () => {
    setEqualizerGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  const updateProgress = useCallback(
    clientX => {
      if (!audioRef.current || !duration || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleSeek = e => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    if (!audioRef.current || !duration) return;
    updateProgress(e.clientX);
  };

  const handleMouseDown = e => {
    e.preventDefault();
    wasDraggingRef.current = false;
    setIsDragging(true);
    updateProgress(e.clientX);
  };

  const handleMouseMove = useCallback(
    e => {
      if (isDragging) {
        wasDraggingRef.current = true;
        updateProgress(e.clientX);
      }
    },
    [isDragging, updateProgress]
  );

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  }, []);

  const handleTouchStart = e => {
    e.preventDefault();
    wasDraggingRef.current = false;
    setIsDragging(true);
    const touch = e.touches[0];
    updateProgress(touch.clientX);
  };

  const handleTouchMove = useCallback(
    e => {
      if (isDragging) {
        wasDraggingRef.current = true;
        const touch = e.touches[0];
        updateProgress(touch.clientX);
      }
    },
    [isDragging, updateProgress]
  );

  const handleTouchEnd = useCallback(() => {
    setTimeout(() => {
      setIsDragging(false);
    }, 0);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

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
            className={`music-grid ${showEqualizer ? 'has-equalizer' : ''}`}
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

      {/* Audio Player */}
      {currentTrack && (
        <div className={`audio-player ${showEqualizer ? 'has-equalizer' : ''}`}>
          <div className='player-content'>
            <div className='player-info'>
              <button
                className={`equalizer-toggle-button ${showEqualizer ? 'active' : ''}`}
                onClick={() => setShowEqualizer(!showEqualizer)}
                aria-label='Toggle equalizer'
              >
                <FaSlidersH />
              </button>
              <div className='player-info-text'>
                <h4>{currentTrack.name}</h4>
                <p>
                  {currentTrack.artist} - {currentTrack.album}
                </p>
              </div>
            </div>
            <div className='player-controls'>
              <button
                className='control-button prev-button'
                onClick={playPreviousTrack}
                aria-label='Previous track'
              >
                <FaStepBackward />
              </button>
              <button
                className='control-button play-pause-button'
                onClick={() => {
                  if (audioRef.current) {
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      audioRef.current.play();
                      setIsPlaying(true);
                    }
                  }
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                className='control-button next-button'
                onClick={playNextTrack}
                aria-label='Next track'
              >
                <FaStepForward />
              </button>
            </div>
            <div className='progress-container'>
              <span className='time-display'>{formatTime(currentTime)}</span>
              <div
                ref={progressBarRef}
                className='progress-bar'
                onClick={handleSeek}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                role='slider'
                tabIndex={0}
                aria-label='Progress bar'
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
              >
                <div
                  className='progress-filled'
                  style={{
                    height: '100%',
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : '0%',
                  }}
                />
                <div
                  className='progress-handle'
                  style={{
                    left: duration
                      ? `${(currentTime / duration) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span className='time-display'>{formatTime(duration)}</span>
            </div>
            {showEqualizer && (
              <div className='equalizer-container'>
                <div className='equalizer-header'>
                  <h5>Equalizer</h5>
                  <button
                    className='equalizer-reset-button'
                    onClick={resetEqualizer}
                    aria-label='Reset equalizer'
                  >
                    Reset
                  </button>
                </div>
                <div className='equalizer-bands'>
                  {[
                    { label: '31', index: 0 },
                    { label: '62', index: 1 },
                    { label: '125', index: 2 },
                    { label: '250', index: 3 },
                    { label: '500', index: 4 },
                    { label: '1k', index: 5 },
                    { label: '2k', index: 6 },
                    { label: '4k', index: 7 },
                    { label: '8k', index: 8 },
                    { label: '16k', index: 9 },
                  ].map(({ label, index }) => (
                    <div key={index} className='equalizer-band'>
                      <input
                        type='range'
                        min='-12'
                        max='12'
                        step='0.5'
                        value={equalizerGains[index]}
                        onChange={e =>
                          handleEqualizerChange(index, e.target.value)
                        }
                        className='equalizer-slider'
                        aria-label={`${label}Hz band`}
                        orient='vertical'
                      />
                      <label className='equalizer-label'>{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <audio
            ref={audioRef}
            autoPlay={isPlaying}
            src={currentTrack.fileUrl}
            onEnded={playNextTrack}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current && !isDragging) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onLoadedData={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
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
