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
  FaStepForward,
  FaStepBackward,
  FaPlay,
  FaPause,
  FaTimes,
  FaSlidersH,
  FaChartBar,
  FaDownload,
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
  const [isDragging, setIsDragging] = useState(false); // Track if user is dragging progress bar
  const progressBarRef = useRef(null); // Ref for progress bar element
  const wasDraggingRef = useRef(false); // Track if user was dragging to prevent click after drag
  const [showThemeModal, setShowThemeModal] = useState(false); // Track theme modal visibility
  const [showEqualizer, setShowEqualizer] = useState(false); // Track equalizer visibility
  const [showAnalysisModal, setShowAnalysisModal] = useState(false); // Track analysis modal visibility
  const [showDownloadModal, setShowDownloadModal] = useState(false); // Track download modal visibility
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // Track playback speed
  // EQUALIZER DISABLED - COMMENTED OUT REFS
  // const audioContextRef = useRef(null); // Web Audio API context
  // const sourceNodeRef = useRef(null); // Audio source node
  // const gainNodesRef = useRef([]); // Gain nodes for each frequency band
  // const biquadFiltersRef = useRef([]); // Biquad filters for each frequency band
  // const isSourceCreatedRef = useRef(false); // Track if source has been created
  // const [equalizerGains, setEqualizerGains] = useState([
  //   0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // ]); // 10-band equalizer gains
  const currentTrackLoggedRef = useRef(null); // Track if current track has been logged to history

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

  // Initialize Web Audio API and equalizer
  // COMMENTED OUT - CAUSING ISSUES ON MOBILE BROWSERS
  /*
  const initializeAudioContext = useCallback(() => {
    if (!audioRef.current) return;

    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      // Resume audio context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Only create source once per audio element
      if (!isSourceCreatedRef.current) {
        try {
          // Disconnect existing source if any
          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.disconnect();
            } catch {
              // Source might already be disconnected
            }
          }

          // Create media element source from audio element
          const source = audioContext.createMediaElementSource(
            audioRef.current
          );
          sourceNodeRef.current = source;
          isSourceCreatedRef.current = true;

          // Frequency bands for 10-band equalizer (Hz)
          const frequencies = [
            31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
          ];

          // Create a master gain node
          const masterGain = audioContext.createGain();
          masterGain.gain.value = 1;

          // Create filters for each band (connected in series)
          const filters = [];

          frequencies.forEach((freq, index) => {
            // Create a peaking filter for each frequency band
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = equalizerGains[index];
            filters.push(filter);
          });

          // Connect all filters in series: source -> filter1 -> filter2 -> ... -> masterGain -> destination
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
          // If source creation fails, we'll just update existing filters
        }
      } else {
        // Source already exists, just update filter gains
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

  // Update equalizer gains when they change
  useEffect(() => {
    if (biquadFiltersRef.current.length > 0) {
      equalizerGains.forEach((gain, index) => {
        if (biquadFiltersRef.current[index]) {
          biquadFiltersRef.current[index].gain.value = gain;
        }
      });
    }
  }, [equalizerGains]);
  */

  const playTrack = track => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setCurrentTime(0);
    // Reset logged flag for new track
    currentTrackLoggedRef.current = null;
  };

  useEffect(() => {
    if (audioRef.current && isPlaying && currentTrack) {
      // EQUALIZER DISABLED - initializeAudioContext();
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, [currentTrack, isPlaying]);

  // Initialize audio context when component mounts or audio element is ready
  // EQUALIZER DISABLED
  /*
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const handleCanPlay = () => {
        initializeAudioContext();
      };
      audioRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
    }
  }, [currentTrack, initializeAudioContext]);
  */

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
    setCurrentTime(0);
    // Reset logged flag for new track
    currentTrackLoggedRef.current = null;
  }, [currentTrack, filteredMusicList]);

  const playPreviousTrack = useCallback(() => {
    if (!currentTrack || filteredMusicList.length === 0) return;

    // Find current track index in filteredMusicList
    const currentIndex = filteredMusicList.findIndex(
      track => track.id === currentTrack.id
    );

    if (currentIndex === -1) return;

    // Get previous track (loop to last if first)
    const prevIndex =
      currentIndex === 0 ? filteredMusicList.length - 1 : currentIndex - 1;
    const prevTrack = filteredMusicList[prevIndex];

    // Play previous track
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    setCurrentTime(0);
    // Reset logged flag for new track
    currentTrackLoggedRef.current = null;
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
      playPreviousTrack();
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
  }, [
    currentTrack,
    isPlaying,
    filteredMusicList,
    playNextTrack,
    playPreviousTrack,
  ]);

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

  const downloadTrack = track => {
    if (track && track.fileUrl) {
      const link = document.createElement('a');
      link.href = track.fileUrl;
      link.download = track.name || 'track';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadModal(false);
    }
  };

  const openDownloadModal = () => {
    setShowDownloadModal(true);
  };

  const closeDownloadModal = () => {
    setShowDownloadModal(false);
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

  const openThemeModal = () => {
    setShowThemeModal(true);
  };

  const closeThemeModal = () => {
    setShowThemeModal(false);
  };

  // Check if listening history exists and is not empty
  const hasListeningHistory = () => {
    try {
      const savedHistory = localStorage.getItem('beatifyListeningHistory');
      if (!savedHistory) return false;
      const history = JSON.parse(savedHistory);
      return Array.isArray(history) && history.length > 0;
    } catch {
      return false;
    }
  };

  // Get listening history from localStorage
  const getListeningHistory = () => {
    try {
      const savedHistory = localStorage.getItem('beatifyListeningHistory');
      if (!savedHistory) return [];
      const history = JSON.parse(savedHistory);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Error loading listening history:', error);
      return [];
    }
  };

  // Get top 3 artists from localStorage
  const getTop3Artists = () => {
    try {
      const savedTop3 = localStorage.getItem('beatifyTop3Artists');
      if (!savedTop3) return [];
      const top3 = JSON.parse(savedTop3);
      return Array.isArray(top3) && top3.length > 0 ? top3 : [];
    } catch (error) {
      console.error('Error loading top 3 artists:', error);
      return [];
    }
  };

  const openAnalysisModal = () => {
    setShowAnalysisModal(true);
  };

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false);
  };

  const selectTheme = themeIndex => {
    setCurrentTheme(themeIndex);
    localStorage.setItem('beatifyTheme', themeIndex.toString());
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

  const formatTime = seconds => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Track listening history and calculate top 3 artists
  const updateListeningHistory = useCallback(track => {
    if (!track || !track.artist) return;

    try {
      // Get current listening history from localStorage
      const historyKey = 'beatifyListeningHistory';
      const savedHistory = localStorage.getItem(historyKey);
      let listeningHistory = savedHistory ? JSON.parse(savedHistory) : [];

      // Add current track's artist and song name to history
      listeningHistory.push({
        artist: track.artist,
        songName: track.name,
        timestamp: Date.now(),
      });

      // Keep only the last 100 entries
      if (listeningHistory.length > 100) {
        listeningHistory = listeningHistory.slice(-100);
      }

      // Save updated history
      localStorage.setItem(historyKey, JSON.stringify(listeningHistory));

      // Calculate top 3 artists from the last 100 songs
      const artistCounts = {};
      listeningHistory.forEach(entry => {
        const artist = entry.artist;
        artistCounts[artist] = (artistCounts[artist] || 0) + 1;
      });

      // Sort artists by count (descending) and get top 3
      const sortedArtists = Object.entries(artistCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .slice(0, 3) // Get top 3
        .map(([artist]) => artist); // Extract just the artist names

      // Save top 3 artists to localStorage
      localStorage.setItem('beatifyTop3Artists', JSON.stringify(sortedArtists));
    } catch (error) {
      console.error('Error updating listening history:', error);
    }
  }, []);

  // Handle equalizer gain changes
  // COMMENTED OUT - EQUALIZER DISABLED
  /*
  const handleEqualizerChange = (index, value) => {
    const newGains = [...equalizerGains];
    newGains[index] = parseFloat(value);
    setEqualizerGains(newGains);
  };

  // Reset equalizer to flat
  const resetEqualizer = () => {
    setEqualizerGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };
  */

  // Cycle through playback speeds: 1 → 1.25 → 1.5 → 2 → 0.25 → 0.5 → 0.75 → 1
  const cyclePlaybackSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.25, 0.5, 0.75];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    setPlaybackSpeed(nextSpeed);
  };

  // Apply playback speed to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

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
    // Prevent click if user was just dragging
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
    // Small delay to allow click event to check wasDraggingRef
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
    // Small delay to allow any click events to check wasDraggingRef
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
            {hasListeningHistory() && (
              <button
                className='menu-item'
                onClick={openAnalysisModal}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FaChartBar style={{ fontSize: '18px' }} />
                Analysis
              </button>
            )}
            <button
              className='menu-item'
              onClick={openThemeModal}
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
                className={`music-grid ${showEqualizer ? 'has-equalizer' : ''}`}
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
        <div className={`audio-player ${showEqualizer ? 'has-equalizer' : ''}`}>
          <div className='player-content'>
            <div className='player-info'>
              <div className='player-info-buttons'>
                <button
                  className={`equalizer-toggle-button ${showEqualizer ? 'active' : ''}`}
                  onClick={() => setShowEqualizer(!showEqualizer)}
                  aria-label='Toggle equalizer'
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                >
                  <FaSlidersH />
                </button>
                <button
                  className='download-track-button'
                  onClick={openDownloadModal}
                  aria-label='Download track'
                >
                  <FaDownload />
                </button>
                <button
                  className='speed-button-top'
                  onClick={cyclePlaybackSpeed}
                  aria-label={`Playback speed: ${playbackSpeed}x`}
                  title={`Playback speed: ${playbackSpeed}x`}
                >
                  {playbackSpeed}x
                </button>
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
            {/* EQUALIZER DISABLED - CAUSING ISSUES ON MOBILE BROWSERS */}
            {/* {showEqualizer && (
              <div className='equalizer-container'>
                <div className='equalizer-header'>
                  <h5>Equalizer</h5>
                  <button
                    className='equalizer-reset-button'
                    onClick={() => {}}
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
                        value={0}
                        onChange={() => {}}
                        className='equalizer-slider'
                        aria-label={`${label}Hz band`}
                        orient='vertical'
                      />
                      <label className='equalizer-label'>{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
          <audio
            ref={audioRef}
            autoPlay={isPlaying}
            src={currentTrack.fileUrl}
            onEnded={playNextTrack}
            onPlay={() => {
              setIsPlaying(true);
              // Track listening history when track starts playing (only once per track)
              if (
                currentTrack &&
                currentTrackLoggedRef.current !== currentTrack.id
              ) {
                updateListeningHistory(currentTrack);
                currentTrackLoggedRef.current = currentTrack.id;
              }
            }}
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

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className='theme-modal-overlay' onClick={closeThemeModal}>
          <div className='theme-modal' onClick={e => e.stopPropagation()}>
            <div className='theme-modal-header'>
              {/* <h2>Select Theme</h2> */}
              <button
                className='theme-modal-close'
                onClick={closeThemeModal}
                aria-label='Close theme modal'
              >
                <FaTimes />
              </button>
            </div>
            <div className='theme-options-grid'>
              {THEMES.map((theme, index) => (
                <button
                  key={index}
                  className={`theme-option ${currentTheme === index ? 'active' : ''}`}
                  onClick={() => selectTheme(index)}
                  style={{ background: theme }}
                  aria-label={`Select theme ${index + 1}`}
                >
                  {currentTheme === index && (
                    <div className='theme-checkmark'>
                      <FaMusic />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div
          className='analysis-modal-overlay'
          onClick={closeAnalysisModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            className='analysis-modal'
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  color: 'white',
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                Listening History
              </h2>
              <button
                onClick={closeAnalysisModal}
                aria-label='Close analysis modal'
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '18px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <FaTimes />
              </button>
            </div>
            {/* Top 3 Artists Section */}
            {getTop3Artists().length > 0 && (
              <div
                style={{
                  marginBottom: '25px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <h3
                  style={{
                    color: 'white',
                    margin: '0 0 15px 0',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  Top 3 Most Listened Artists
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {getTop3Artists().map((artist, index) => {
                    const medalColors = [
                      {
                        bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        border: '#FFD700',
                      }, // Gold
                      {
                        bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
                        border: '#C0C0C0',
                      }, // Silver
                      {
                        bg: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
                        border: '#CD7F32',
                      }, // Bronze
                    ];
                    const medalLabels = ['🥇', '🥈', '🥉'];
                    const color = medalColors[index] || medalColors[0];

                    return (
                      <div
                        key={index}
                        style={{
                          background: color.bg,
                          borderRadius: '12px',
                          padding: '15px 18px',
                          border: `2px solid ${color.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '22px',
                            lineHeight: '1',
                          }}
                        >
                          {medalLabels[index]}
                        </span>
                        <span
                          style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            flex: 1,
                          }}
                        >
                          {artist}
                        </span>
                        <span
                          style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: 'rgba(0, 0, 0, 0.2)',
                            padding: '4px 10px',
                            borderRadius: '12px',
                          }}
                        >
                          #{index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div
              style={{
                color: 'white',
                fontSize: '12px',
                marginBottom: '15px',
                opacity: 0.9,
              }}
            >
              Last {Math.min(100, getListeningHistory().length)} songs played
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: 'calc(70vh - 300px)',
                overflowY: 'auto',
                paddingRight: '5px',
              }}
            >
              {getListeningHistory()
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 15px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        {entry.songName || 'Unknown Song'}
                      </span>
                      <span
                        style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '12px',
                        }}
                      >
                        {entry.artist || 'Unknown Artist'}
                      </span>
                    </div>
                    <span
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '11px',
                      }}
                    >
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Download Confirmation Modal */}
      {showDownloadModal && currentTrack && (
        <div
          className='download-modal-overlay'
          onClick={closeDownloadModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div
            className='download-modal'
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            <button
              onClick={closeDownloadModal}
              aria-label='Close download modal'
              className='download-modal-close'
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '18px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <FaTimes />
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center',
              }}
            >
              <h2
                style={{
                  color: 'white',
                  margin: '0 0 10px 0',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Download Track
              </h2>
              <div
                style={{
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '16px',
                  marginBottom: '10px',
                }}
              >
                <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                  {currentTrack.name}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  {currentTrack.artist} - {currentTrack.album}
                </p>
              </div>
              <button
                onClick={() => downloadTrack(currentTrack)}
                className='download-modal-button'
                style={{
                  background: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '15px 30px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
                }}
              >
                <FaDownload />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;
