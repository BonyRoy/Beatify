import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
  FaHeart,
  FaRegHeart,
  FaBars,
  FaMusic,
  FaList,
  FaHeadphones,
  FaSearch,
} from 'react-icons/fa';
import dance from '../Images/dance.gif';
import dance2 from '../Images/dance2.gif';
import dance3 from '../Images/dance3.gif';
import dance4 from '../Images/dance4.gif';
import dance5 from '../Images/dance5.gif';
import dance6 from '../Images/dance6.gif';
import './Play.css';
import Artists from '../Components/Artists';
import Playlists from '../Components/Playlists';
import PlaylistDetail from '../Components/PlaylistDetail';

// Theme gradients array
const THEMES = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Violet
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Cyan
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint-Pink
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Coral-Pink
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Peach
  'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', // Red-Blue
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // Lavender-Blue
];

// Hardcoded playlist track mappings
const playlistTracks = {
  'Old Melodies': [],
  'Romantic Hits': [],
  'Party Anthems': [],
  'Chill Vibes': [],
  'Workout Mix': [],
  EDM: [],
  Global: [],
  Thar: [
    '4de44c58-7b04-4934-9774-ce0ede19cee8',
    '5c120cbd-8274-458a-9554-d60bb6ae1014',
    'aae0a4cc-4c88-4af5-a93f-d89f3e5f051e',
    'a07902d5-12ed-4bea-b3fe-d1f8b93b0a4c',
    'c64a9313-f6d7-4298-a16b-45611a9d0ed4',
    '2b4c3553-fb3a-4aed-9134-2227c7965ad2',
    '340837c7-8ff6-4f22-bd4f-17f24466ed05',
    '990e2d10-890d-4ce7-a819-b043b57e811a',
    'b9915cc9-9a59-4757-9227-c86e27f0c260',
    'c315071c-4f54-4ddd-b8b2-c0e409ed4cca',
    '340c96d5-8926-44b1-856c-e1a7076e0331',
    '332dfa14-6e0d-460d-a35f-78495b1b9cb0',
    '439bb5df-b96d-4e1c-8ef3-e688b1e75edd',
    '5a9cf65b-57b7-4857-9f42-03ee40ee4c97',
  ],
};

// Array of dance GIFs (moved outside component to avoid recreation on each render)
const danceGifs = [dance, dance2, dance3, dance4, dance5, dance6];

const Play = () => {
  // const navigate = useNavigate();
  const [musicList, setMusicList] = useState([]);
  const [filteredMusicList, setFilteredMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [playlistFavorites, setPlaylistFavorites] = useState(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const audioRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const shouldAutoResumeRef = useRef(false); // Track if we should auto-resume after interruption
  const [displayedTracksCount, setDisplayedTracksCount] = useState(10); // Lazy loading: start with 10 tracks
  const scrollableContentRef = useRef(null); // Ref for scrollable content container

  // Shuffle the GIFs on each reload
  const [shuffledGifs, setShuffledGifs] = useState([]);

  useEffect(() => {
    // Fisher-Yates shuffle algorithm
    const shuffleArray = array => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    setShuffledGifs(shuffleArray(danceGifs));
  }, []);

  // Function to get a dance GIF for each track
  const getRandomDanceGif = trackIndex => {
    if (shuffledGifs.length === 0) return dance; // fallback
    return shuffledGifs[trackIndex % shuffledGifs.length];
  };

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

    // Load playlist favorites from localStorage
    const savedPlaylistFavorites = localStorage.getItem(
      'beatifyPlaylistFavorites'
    );
    if (savedPlaylistFavorites) {
      try {
        const playlistNames = JSON.parse(savedPlaylistFavorites);
        setPlaylistFavorites(new Set(playlistNames));
      } catch (error) {
        console.error('Error loading playlist favorites:', error);
      }
    }

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('beatifyTheme');
    if (savedTheme !== null) {
      try {
        const themeIndex = parseInt(savedTheme, 10);
        if (themeIndex >= 0 && themeIndex < THEMES.length) {
          setCurrentTheme(themeIndex);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
    // Reset displayed tracks count when filters change
    setDisplayedTracksCount(10);
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

  const playNextTrack = useCallback(() => {
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
  }, [currentTrack, filteredMusicList]);

  // Media Session API for notification center player
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      // Media Session API not supported
      return;
    }

    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      // Clear media session when no track
      navigator.mediaSession.metadata = null;
      return;
    }

    // Set media metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name || 'Unknown Track',
      artist: currentTrack.artist || 'Unknown Artist',
      album: currentTrack.album || 'Unknown Album',
      artwork: [
        // You can add album artwork URLs here if available
        // For now, using a default or placeholder
        {
          src: currentTrack.artworkUrl || currentTrack.coverUrl || '',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    });

    // Handle play action from notification
    navigator.mediaSession.setActionHandler('play', () => {
      if (audio && audio.paused) {
        audio.play().catch(error => {
          console.error('Error playing audio from notification:', error);
        });
        setIsPlaying(true);
      }
    });

    // Handle pause action from notification
    navigator.mediaSession.setActionHandler('pause', () => {
      if (audio && !audio.paused) {
        audio.pause();
        setIsPlaying(false);
      }
    });

    // Handle next track action from notification
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextTrack();
    });

    // Handle previous track action from notification
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (!currentTrack || filteredMusicList.length === 0) return;

      const currentIndex = filteredMusicList.findIndex(
        track => track.id === currentTrack.id
      );

      if (currentIndex === -1) return;

      // Get previous track (loop to last if first)
      const prevIndex =
        currentIndex === 0 ? filteredMusicList.length - 1 : currentIndex - 1;
      const prevTrack = filteredMusicList[prevIndex];

      setCurrentTrack(prevTrack);
      setIsPlaying(true);
    });

    // Update playback state
    const updatePlaybackState = () => {
      if (audio) {
        navigator.mediaSession.playbackState = audio.paused
          ? 'paused'
          : 'playing';
      }
    };

    // Listen to audio events to update playback state
    audio.addEventListener('play', updatePlaybackState);
    audio.addEventListener('pause', updatePlaybackState);

    // Initial state
    updatePlaybackState();

    return () => {
      audio.removeEventListener('play', updatePlaybackState);
      audio.removeEventListener('pause', updatePlaybackState);
    };
  }, [currentTrack, isPlaying, filteredMusicList, playNextTrack]);

  // Lazy loading: Load more tracks on scroll
  useEffect(() => {
    const scrollableElement = scrollableContentRef.current;
    if (!scrollableElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
      // Load more when user is within 200px of the bottom
      const threshold = 200;

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        // Check if there are more tracks to load
        if (displayedTracksCount < filteredMusicList.length) {
          setDisplayedTracksCount(prev =>
            Math.min(prev + 10, filteredMusicList.length)
          );
        }
      }
    };

    scrollableElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollableElement.removeEventListener('scroll', handleScroll);
    };
  }, [displayedTracksCount, filteredMusicList.length]);

  // Handle audio interruptions (like phone calls)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let resumeTimeout = null;

    const handlePause = () => {
      // If audio was playing and gets paused, it might be due to system interruption
      // Only set auto-resume if isPlaying is still true (user didn't manually pause)
      if (isPlaying && currentTrack) {
        shouldAutoResumeRef.current = true;
      } else {
        // User manually paused, don't auto-resume
        shouldAutoResumeRef.current = false;
      }
      // Clear any pending resume attempts when paused
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    const handlePlay = () => {
      // If audio starts playing, clear the auto-resume flag
      shouldAutoResumeRef.current = false;
      setIsPlaying(true);
      // Clear any pending resume attempts
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }
    };

    // Handle visibility change (when app comes back to foreground after call)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // App went to background (call might be starting), clear any resume attempts
        if (resumeTimeout) {
          clearTimeout(resumeTimeout);
          resumeTimeout = null;
        }
        return;
      }

      // App came back to foreground - check if we should resume
      if (
        document.visibilityState === 'visible' &&
        shouldAutoResumeRef.current &&
        isPlaying &&
        currentTrack
      ) {
        // Clear any existing timeout
        if (resumeTimeout) {
          clearTimeout(resumeTimeout);
        }
        // Wait 2 seconds to ensure call has fully ended before resuming
        resumeTimeout = setTimeout(() => {
          if (
            audioRef.current &&
            shouldAutoResumeRef.current &&
            isPlaying &&
            currentTrack &&
            audioRef.current.paused &&
            document.visibilityState === 'visible'
          ) {
            audioRef.current.play().catch(error => {
              console.error('Error resuming audio after interruption:', error);
              // If play fails, clear the flag to prevent retry loops
              shouldAutoResumeRef.current = false;
            });
          }
          resumeTimeout = null;
        }, 2000);
      }
    };

    // Handle when audio is suspended by system (e.g., during call)
    const handleSuspend = () => {
      if (isPlaying && currentTrack) {
        shouldAutoResumeRef.current = true;
      }
    };

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('suspend', handleSuspend);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('suspend', handleSuspend);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
    };
  }, [isPlaying, currentTrack]);

  // const downloadTrack = track => {
  //   window.open(track.fileUrl, '_blank');
  // };

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

  const togglePlaylistFavorite = (playlistName, e) => {
    e.stopPropagation(); // Prevent card click when clicking heart

    setPlaylistFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(playlistName)) {
        newFavorites.delete(playlistName);
      } else {
        newFavorites.add(playlistName);
      }
      // Save playlist names to localStorage
      const playlistNames = [...newFavorites];
      localStorage.setItem(
        'beatifyPlaylistFavorites',
        JSON.stringify(playlistNames)
      );
      return newFavorites;
    });
  };

  const shuffleTheme = () => {
    setCurrentTheme(prevTheme => {
      const nextTheme = (prevTheme + 1) % THEMES.length;
      localStorage.setItem('beatifyTheme', nextTheme.toString());
      return nextTheme;
    });
  };

  // const formatDate = timestamp => {
  //   if (!timestamp) return 'Unknown';
  //   const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  //   return date.toLocaleDateString();
  // };

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

  // Show playlist detail view when a playlist is selected
  if (selectedPlaylist && playlistTracks[selectedPlaylist]) {
    return (
      <PlaylistDetail
        playlistName={selectedPlaylist}
        trackIds={playlistTracks[selectedPlaylist]}
        onBack={() => setSelectedPlaylist(null)}
        currentTheme={THEMES[currentTheme]}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        formatReleaseDate={formatReleaseDate}
        formatFileSize={formatFileSize}
        getRandomDanceGif={getRandomDanceGif}
      />
    );
  }

  return (
    <div
      className='play-container'
      style={{ background: THEMES[currentTheme] }}
    >
      <div className='play-header'>
        <h1>
          <FaHeadphones
            style={{ marginRight: '10px', verticalAlign: 'middle' }}
          />
          Beatify
        </h1>
        <p style={{ paddingTop: '10px' }}>
          Where Music Finds You & Every Beat Moves You.
        </p>
      </div>

      {/* Hamburger Menu */}
      <div className='hamburger-menu-container' ref={menuRef}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {showFavoritesOnly ? (
                <>
                  <FaList style={{ fontSize: '18px' }} />
                  Show All
                </>
              ) : (
                <>
                  <FaHeart style={{ fontSize: '18px', color: '#ff4757' }} />
                  Favorites
                </>
              )}
            </button>
            <button
              className='menu-item'
              onClick={() => setShowPlaylists(!showPlaylists)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {showPlaylists ? (
                <>
                  <FaMusic style={{ fontSize: '18px' }} />
                  Show Tracks
                </>
              ) : (
                <>
                  <FaList style={{ fontSize: '18px' }} />
                  Playlists
                </>
              )}
            </button>
            <button
              className='menu-item'
              onClick={shuffleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: THEMES[currentTheme],
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  flexShrink: 0,
                }}
              />
              Theme
            </button>
          </div>
        )}
      </div>

      {showPlaylists ? (
        <>
          {musicList.length > 0 && (
            <div className='search-container'>
              <div style={{ position: 'relative', width: '100%' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1rem',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type='text'
                  className='search-input'
                  placeholder='Search playlists...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '50px' }}
                />
              </div>
            </div>
          )}
          <Playlists
            searchQuery={searchQuery}
            favorites={playlistFavorites}
            onToggleFavorite={togglePlaylistFavorite}
            showFavoritesOnly={showFavoritesOnly}
            currentTrack={currentTrack}
            onPlaylistClick={playlistName => {
              setSelectedPlaylist(playlistName);
            }}
            selectedPlaylist={selectedPlaylist}
          />
        </>
      ) : (
        <>
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
          {musicList.length > 0 && (
            <div className='search-container'>
              <div style={{ position: 'relative', width: '100%' }}>
                <FaSearch
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '1rem',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type='text'
                  className='search-input'
                  placeholder='Search by song, artist, genre, or album...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '50px' }}
                />
              </div>
            </div>
          )}

          <div className='scrollable-content' ref={scrollableContentRef}>
            {musicList.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <FaMusic style={{ fontSize: '4rem', color: '#667eea' }} />
                </div>
                <h2>No Music Found</h2>
                <p>
                  Ask Admin to upload some tracks in the panel to get started!
                </p>
              </div>
            ) : filteredMusicList.length === 0 && showFavoritesOnly ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <FaHeart style={{ fontSize: '4rem', color: '#e74c3c' }} />
                </div>
                <h2>No Favorites Yet</h2>
                <p>
                  Start adding songs to your favorites by clicking the heart
                  icon!
                </p>
              </div>
            ) : filteredMusicList.length === 0 ? (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <FaSearch style={{ fontSize: '4rem', color: '#667eea' }} />
                </div>
                <h2>No Results Found</h2>
                <p>Try adjusting your search query.</p>
              </div>
            ) : (
              <div
                className='music-grid'
                style={{
                  paddingBottom: currentTrack ? '68px' : '0px',
                }}
              >
                {filteredMusicList
                  .slice(0, displayedTracksCount)
                  .map((track, index) => (
                    <div
                      key={track.id}
                      className={`track-card ${currentTrack?.id === track.id ? 'selected' : ''}`}
                      onClick={() => playTrack(track)}
                    >
                      <div className='track-content-wrapper'>
                        <div className='track-image-container'>
                          <img
                            src={getRandomDanceGif(index)}
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
                                  {formatReleaseDate(track.releaseDate)}
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
                          <div className='track-meta-info'>
                            <span className='track-meta-separator'>Size:</span>
                            <span className='track-meta-item'>
                              {formatFileSize(track.fileSize)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
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
