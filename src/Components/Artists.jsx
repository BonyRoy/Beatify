import React from 'react';
import arjit from '../Images/arjitsingh.jpeg';
import mohit from '../Images/mohit.webp';
import rahet from '../Images/rahet.png';
import shankar from '../Images/shankar.jpeg';
import richa from '../Images/richa.jpeg';
import javedali from '../Images/javedali.jpeg';

const Artists = ({ searchQuery = '', onArtistClick, selectedArtist }) => {
  const artists = [
    {
      id: 1,
      name: 'Arjit Singh',
      image: arjit,
    },
    {
      id: 2,
      name: 'Mohit Chauhan',
      image: mohit,
    },
    {
      id: 3,
      name: 'Rahat Fateh Ali Khan',
      image: rahet,
    },
    {
      id: 4,
      name: 'Shankar Mahadevan',
      image: shankar,
    },
    {
      id: 5,
      name: 'Richa Sharma',
      image: richa,
    },
    {
      id: 6,
      name: 'Javed Ali',
      image: javedali,
    },
  ];

  // Filter artists based on search query
  const filteredArtists = searchQuery.trim()
    ? artists.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : artists;

  return (
    <>
      <div
        style={{
          padding: '10px',
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          justifyContent: 'flex-start',
        }}
      >
        {filteredArtists.map(artist => {
          const isSelected = selectedArtist === artist.name;
          return (
            <div
              key={artist.id}
              onClick={() => onArtistClick?.(artist.name)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                flex: 1,
                minWidth: '120px',
                cursor: 'pointer',
                opacity: isSelected ? 1 : 0.7,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <img
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: isSelected
                    ? '3px solid #4CAF50'
                    : '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                src={artist.image}
                alt={artist.name}
              />
              <h6 style={{ color: 'white', margin: 0 }}>{artist.name}</h6>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Artists;
