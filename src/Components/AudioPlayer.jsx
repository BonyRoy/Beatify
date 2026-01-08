import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaStepForward,
  FaStepBackward,
  FaPlay,
  FaPause,
  FaSlidersH,
  FaDownload,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import '../Pages/Play.css';

const AudioPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  duration,
  onTimeUpdate,
  onSeek,
  showEqualizer = false,
  onToggleEqualizer,
  onDownload,
  playbackSpeed = 1,
  onSpeedChange,
  onTrackEnd,
  onTrackPlay,
  formatTime,
  enableDownload = true,
  enableSpeedControl = true,
  enableEqualizer = false,
  onAudioRef, // Callback to expose audio ref to parent
  onDuration, // Callback to update duration in parent
  isMinimized = false, // Whether player is minimized
  onMinimizeToggle, // Callback to toggle minimize state
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const wasDraggingRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const savedTimeRef = useRef(0); // Store current playback time

  // Expose audio ref to parent component
  useEffect(() => {
    if (onAudioRef) {
      onAudioRef(audioRef.current);
    }
  }, [onAudioRef, currentTrack]);

  // Mark as mounted after initial render to enable transitions
  useEffect(() => {
    // Small delay to prevent initial animation
    const timer = setTimeout(() => {
      setIsMounted(!!currentTrack);
    }, 50);

    return () => clearTimeout(timer);
  }, [currentTrack]);

  // Apply playback speed to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Auto-play when track changes
  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [currentTrack, isPlaying]);

  const updateProgress = useCallback(
    clientX => {
      if (!audioRef.current || !duration || !progressBarRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      if (onTimeUpdate) {
        onTimeUpdate(newTime);
      }
    },
    [duration, onTimeUpdate]
  );

  const handleSeek = e => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    if (!audioRef.current || !duration) return;
    updateProgress(e.clientX);
    if (onSeek) {
      onSeek(audioRef.current.currentTime);
    }
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

  // Add global mouse/touch event listeners for dragging
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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    if (onPlayPause) {
      onPlayPause(!isPlaying);
    }
  };

  const defaultFormatTime = seconds => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeFormatter = formatTime || defaultFormatTime;

  // Preserve playback position when switching views
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      savedTimeRef.current = audioRef.current.currentTime;
    }
  }, [isMinimized, currentTrack]);

  // Restore playback position after audio element is recreated
  useEffect(() => {
    if (!currentTrack) return;

    const audio = audioRef.current;
    if (audio && savedTimeRef.current > 0) {
      // Only restore if we're playing the same track
      const restoreTime = () => {
        if (audio && savedTimeRef.current > 0) {
          audio.currentTime = savedTimeRef.current;
          savedTimeRef.current = 0; // Reset after restoring
        }
      };

      // Try to restore immediately if already loaded
      if (audio.readyState >= 2) {
        restoreTime();
      } else {
        // Wait for audio to load
        audio.addEventListener('loadeddata', restoreTime, {
          once: true,
        });
        return () => {
          if (audio) {
            audio.removeEventListener('loadeddata', restoreTime);
          }
        };
      }
    }
  }, [isMinimized, currentTrack]);

  // Update saved time continuously while playing
  useEffect(() => {
    if (!audioRef.current || !isPlaying || !currentTrack) return;

    const interval = setInterval(() => {
      if (audioRef.current) {
        savedTimeRef.current = audioRef.current.currentTime;
      }
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  if (!currentTrack) {
    return (
      <div className='fixed-action-bar'>
        <div className='no-track-selected'>Select a track to play/download</div>
      </div>
    );
  }

  // Shared audio element that persists across both views
  const audioElement = (
    <audio
      key={currentTrack?.id} // Key ensures proper remounting when track changes
      ref={audioRef}
      autoPlay={isPlaying}
      src={currentTrack?.fileUrl}
      onEnded={onTrackEnd}
      onPlay={() => {
        if (onPlayPause) {
          onPlayPause(true);
        }
        if (onTrackPlay && currentTrack) {
          onTrackPlay(currentTrack);
        }
      }}
      onPause={() => {
        if (onPlayPause) {
          onPlayPause(false);
        }
      }}
      onTimeUpdate={() => {
        if (audioRef.current && !isDragging) {
          const newTime = audioRef.current.currentTime;
          savedTimeRef.current = newTime; // Keep saved time updated
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
        }
      }}
      onLoadedMetadata={() => {
        if (audioRef.current && onDuration) {
          onDuration(audioRef.current.duration);
        }
      }}
      onLoadedData={() => {
        if (audioRef.current && onDuration) {
          onDuration(audioRef.current.duration);
        }
        // Restore playback position when audio loads
        if (audioRef.current && savedTimeRef.current > 0) {
          audioRef.current.currentTime = savedTimeRef.current;
          savedTimeRef.current = 0;
        }
      }}
    >
      Your browser does not support the audio element.
    </audio>
  );

  // Minimized player view
  if (isMinimized) {
    return (
      <div
        className={`audio-player minimized ${isMounted ? 'mounted' : ''}`}
        onClick={onMinimizeToggle}
        style={{ cursor: 'pointer' }}
      >
        <div className='minimized-player-content'>
          <div className='minimized-player-info'>
            <h4>{currentTrack.name}</h4>
            <p>
              {currentTrack.artist} - {currentTrack.album}
            </p>
          </div>
          <div className='minimized-player-controls'>
            <button
              className='control-button minimized-play-pause'
              onClick={e => {
                e.stopPropagation();
                handlePlayPause();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        </div>
        {audioElement}
      </div>
    );
  }

  return (
    <div
      className={`audio-player ${showEqualizer ? 'has-equalizer' : ''} ${isMounted ? 'mounted' : ''}`}
    >
      {onMinimizeToggle && (
        <button
          className='minimize-player-button'
          onClick={onMinimizeToggle}
          aria-label='Minimize player'
          title='Minimize player'
        >
          <FaChevronDown />
        </button>
      )}
      <div className='player-content'>
        <div className='player-info'>
          <div className='player-info-buttons'>
            {enableEqualizer && (
              <button
                className={`equalizer-toggle-button ${showEqualizer ? 'active' : ''}`}
                onClick={onToggleEqualizer}
                aria-label='Toggle equalizer'
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <FaSlidersH />
              </button>
            )}
            {enableDownload && onDownload && (
              <button
                className='download-track-button'
                onClick={onDownload}
                aria-label='Download track'
              >
                <FaDownload />
              </button>
            )}
            {enableSpeedControl && onSpeedChange && (
              <button
                className='speed-button-top'
                onClick={onSpeedChange}
                aria-label={`Playback speed: ${playbackSpeed}x`}
                title={`Playback speed: ${playbackSpeed}x`}
              >
                {playbackSpeed}x
              </button>
            )}
          </div>
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
            onClick={onPrevious}
            aria-label='Previous track'
          >
            <FaStepBackward />
          </button>
          <button
            className='control-button play-pause-button'
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            className='control-button next-button'
            onClick={onNext}
            aria-label='Next track'
          >
            <FaStepForward />
          </button>
        </div>
        <div className='progress-container'>
          <span className='time-display'>{timeFormatter(currentTime)}</span>
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
                width: duration ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
            <div
              className='progress-handle'
              style={{
                left: duration ? `${(currentTime / duration) * 100}%` : '0%',
              }}
            />
          </div>
          <span className='time-display'>{timeFormatter(duration)}</span>
        </div>
      </div>
      {audioElement}
    </div>
  );
};

export default AudioPlayer;
