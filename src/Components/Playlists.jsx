import React from 'react';
import { FaHeart, FaRegHeart, FaSearch } from 'react-icons/fa';
import oldMelodiesImg from '../Images/playlistbg/oldmelodies.png';
import romanticImg from '../Images/playlistbg/romantic.png';
import partyImg from '../Images/playlistbg/party.png';
import chillVibesImg from '../Images/playlistbg/chillvibes.png';
import gymImg from '../Images/playlistbg/gym.png';
import edmImg from '../Images/playlistbg/edm.png';
import globalImg from '../Images/playlistbg/Globalmusic.png';
import tharImg from '../Images/playlistbg/thar.png';

const Playlists = ({
  searchQuery = '',
  favorites = new Set(),
  onToggleFavorite = () => {},
  showFavoritesOnly = false,
  currentTrack = null,
  onPlaylistClick = () => {},
  selectedPlaylist = null,
}) => {
  const playlists = [
    'Old Melodies',
    'Romantic Hits',
    'Party Anthems',
    'Chill Vibes',
    'Workout Mix',
    'edm',
    'global',
    'Thar',
  ];

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

  // Filter playlists based on favorites first, then search query
  let filteredPlaylists = playlists;

  // Filter by favorites if showFavoritesOnly is true
  if (showFavoritesOnly) {
    filteredPlaylists = filteredPlaylists.filter(playlist =>
      favorites.has(playlist)
    );
  }

  // Filter by search query
  if (searchQuery.trim() !== '') {
    filteredPlaylists = filteredPlaylists.filter(playlist =>
      playlist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const getCardStyle = playlistName => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    backgroundImage: `url(${playlistImages[playlistName]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRadius: '10px',
    padding: '10px',
    width: '100%',
    height: '250px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  });

  const handleMouseEnter = e => {
    const playlistName = e.currentTarget.getAttribute('data-playlist');
    const isSelected = selectedPlaylist === playlistName;
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = isSelected
      ? '0 10px 20px rgba(102, 126, 234, 0.5), 0 3px 6px rgba(0, 0, 0, 0.1)'
      : '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)';
  };

  const handleMouseLeave = e => {
    const playlistName = e.currentTarget.getAttribute('data-playlist');
    const isSelected = selectedPlaylist === playlistName;
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = isSelected
      ? '0 10px 20px rgba(102, 126, 234, 0.4), 0 3px 6px rgba(0, 0, 0, 0.1)'
      : '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
  };

  return (
    <>
      <style>
        {`
          .playlists-container {
          }
          
          .playlists-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            ${currentTrack ? 'padding-bottom: 148px !important;' : 'padding-bottom: 48px !important;'}
          }
          
          @media (min-width: 768px) {
            .playlists-grid {
              grid-template-columns: 1fr 1fr 1fr;
            }
          }
        `}
      </style>
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          width: '100%',
          marginTop: '20px',
        }}
      >
        <div className='playlists-container' style={{ width: '100%' }}>
          {filteredPlaylists.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '50px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                {showFavoritesOnly ? (
                  <FaHeart style={{ fontSize: '3rem', color: '#e74c3c' }} />
                ) : (
                  <FaSearch style={{ fontSize: '3rem', color: '#667eea' }} />
                )}
              </div>
              <h2 style={{ color: 'white', marginBottom: '10px' }}>
                {showFavoritesOnly
                  ? 'No Favorite Playlists'
                  : 'No Playlists Found'}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {showFavoritesOnly
                  ? 'Start adding playlists to your favorites by clicking the heart icon!'
                  : 'Try adjusting your search query.'}
              </p>
            </div>
          ) : (
            <div className='playlists-grid'>
              {filteredPlaylists.map((playlist, index) => (
                <div
                  key={index}
                  data-playlist={playlist}
                  style={{
                    ...getCardStyle(playlist),
                    border:
                      selectedPlaylist === playlist
                        ? '3px solid #667eea'
                        : 'none',
                    boxShadow:
                      selectedPlaylist === playlist
                        ? '0 10px 20px rgba(102, 126, 234, 0.4), 0 3px 6px rgba(0, 0, 0, 0.1)'
                        : '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => onPlaylistClick(playlist)}
                >
                  {/* Dark overlay for better text readability */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '10px',
                      zIndex: 1,
                    }}
                  />

                  <button
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={e => onToggleFavorite(playlist, e)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 1)';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background =
                        'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    aria-label={
                      favorites.has(playlist)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    {favorites.has(playlist) ? (
                      <FaHeart
                        style={{
                          color: '#ff4757',
                          fontSize: '1.3rem',
                        }}
                      />
                    ) : (
                      <FaRegHeart
                        style={{
                          color: '#666',
                          fontSize: '1.3rem',
                        }}
                      />
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: 'white',
                      textAlign: 'center',
                      zIndex: 2,
                      position: 'relative',
                      textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)',
                      padding: '0 20px',
                    }}
                  >
                    {playlist}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Playlists;
