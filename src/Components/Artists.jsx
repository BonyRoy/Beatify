import React, { useState, useEffect } from 'react';
import arjit from '../Images/arjitsingh.jpeg';
import mohit from '../Images/mohit.webp';
import rahet from '../Images/rahet.png';
import shankar from '../Images/shankar.jpeg';
import richa from '../Images/richa.jpeg';
import javedali from '../Images/javedali.jpeg';
import honey from '../Images/honey.jpg';
import badshah from '../Images/badshah.jpeg';
import ShreyaGhoshal from '../Images/Shreya Ghoshal.jpeg';
import SonuNigam from '../Images/Sonu Nigam.jpg';
import Shaan from '../Images/Shaan.jpeg';
import HimeshReshammiya from '../Images/Himesh Reshammiya.webp';
import JubinNautiyal from '../Images/Jubin Nautiyal.jpeg';
import SajidWajid from '../Images/SajidWajid.jpeg';
import BabulSupriyo from '../Images/BabulSupriyo .jpeg';
import GuruRandhawa from '../Images/Guru Randhawa.webp';
import SukhwinderSingh from '../Images/Sukhwinder Singh.webp';
import Papon from '../Images/Papon.jpg';
import AbhijeetBhattacharya from '../Images/AbhijeetBhattacharya.webp';
import VishalShekhar from '../Images/Vishal-Shekhar .jpeg';
import AtifAslam from '../Images/Atif Aslam.jpg';
import KK from '../Images/KK.jpeg';
import DiljitDosanjh from '../Images/Diljit Dosanjh.jpeg';
import ShafqatAmanatAli from '../Images/ShafqatAmanatAli.jpeg';
import ARRahman from '../Images/ARRahman.jpg';
import SunidhiChauhan from '../Images/Sunidhi Chauhan.jpeg';
import AjayAtul from '../Images/Ajay-Atul.webp';
import AyushmannKhurrana from '../Images/AyushmannKhurrana.jpeg';
import ArmaanMalik from '../Images/ArmaanMalik.webp';
import HarrdySandhu from '../Images/HarrdySandhu.webp';
import VishalMishra from '../Images/VishalMishra.jpeg';
import HarshitSaxena from '../Images/Harshit Saxena .jpeg';
import AlkaYagnik from '../Images/Alka Yagnik.jpg';
import UditNarayan from '../Images/Udit Narayan.jpeg';
import KumarSanu from '../Images/Kumar Sanu.jpeg';

const Artists = ({ searchQuery = '', onArtistClick, selectedArtist }) => {
  const allArtists = [
    {
      id: 1,
      name: 'Arijit Singh',
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
    {
      id: 7,
      name: 'Honey Singh',
      image: honey,
    },
    {
      id: 8,
      name: 'Badshah',
      image: badshah,
    },

    {
      id: 9,
      name: 'Jubin Nautiyal',
      image: JubinNautiyal,
    },
    {
      id: 10,
      name: 'Himesh Reshammiya',
      image: HimeshReshammiya,
    },
    {
      id: 11,
      name: 'Shaan',
      image: Shaan,
    },
    {
      id: 12,
      name: 'Sonu Nigam',
      image: SonuNigam,
    },
    {
      id: 13,
      name: 'Sajid Wajid',
      image: SajidWajid,
    },
    {
      id: 14,
      name: 'Shreya Ghoshal',
      image: ShreyaGhoshal,
    },
    {
      id: 15,
      name: 'Babul Supriyo',
      image: BabulSupriyo,
    },
    {
      id: 16,
      name: 'Guru Randhawa',
      image: GuruRandhawa,
    },
    {
      id: 17,
      name: 'Sukhwinder Singh',
      image: SukhwinderSingh,
    },
    {
      id: 18,
      name: 'Papon',
      image: Papon,
    },
    {
      id: 19,
      name: 'Abhijeet',
      image: AbhijeetBhattacharya,
    },
    {
      id: 20,
      name: 'Vishal-Shekhar',
      image: VishalShekhar,
    },
    {
      id: 21,
      name: 'Atif Aslam',
      image: AtifAslam,
    },
    {
      id: 22,
      name: 'KK',
      image: KK,
    },
    {
      id: 23,
      name: 'Diljit Dosanjh',
      image: DiljitDosanjh,
    },
    {
      id: 24,
      name: 'Shafqat Amanat Ali',
      image: ShafqatAmanatAli,
    },
    {
      id: 25,
      name: 'Sunidhi Chauhan',
      image: SunidhiChauhan,
    },
    {
      id: 26,
      name: 'A. R. Rahman',
      image: ARRahman,
    },
    {
      id: 27,
      name: 'Ajay-Atul',
      image: AjayAtul,
    },
    {
      id: 28,
      name: 'Ayushmann Khurrana',
      image: AyushmannKhurrana,
    },
    {
      id: 29,
      name: 'Armaan Malik',
      image: ArmaanMalik,
    },
    {
      id: 30,
      name: 'Harrdy Sandhu',
      image: HarrdySandhu,
    },
    {
      id: 31,
      name: 'Vishal Mishra',
      image: VishalMishra,
    },
    {
      id: 32,
      name: 'Harshit Saxena',
      image: HarshitSaxena,
    },
    {
      id: 33,
      name: 'Alka Yagnik',
      image: AlkaYagnik,
    },
    {
      id: 34,
      name: 'Udit Narayan',
      image: UditNarayan,
    },
    {
      id: 35,
      name: 'Kumar Sanu',
      image: KumarSanu,
    },
  ];

  const [artists, setArtists] = useState(allArtists);

  // Load clicked artists from localStorage and reorder on mount
  useEffect(() => {
    const clickedArtists = JSON.parse(
      localStorage.getItem('clickedArtists') || '[]'
    );

    if (clickedArtists.length > 0) {
      // Create a map for quick lookup
      const artistMap = new Map(
        allArtists.map(artist => [artist.name, artist])
      );

      // Separate clicked and non-clicked artists
      const clicked = [];
      const notClicked = [];

      // Add clicked artists in order (most recent first)
      clickedArtists.forEach(artistName => {
        if (artistMap.has(artistName)) {
          clicked.push(artistMap.get(artistName));
        }
      });

      // Add remaining artists that weren't clicked
      allArtists.forEach(artist => {
        if (!clickedArtists.includes(artist.name)) {
          notClicked.push(artist);
        }
      });

      // Combine: clicked artists first, then others
      setArtists([...clicked, ...notClicked]);
    }
  }, []);

  // Handle artist click - save to localStorage only (reordering happens on reload)
  const handleArtistClick = artistName => {
    // Get current clicked artists from localStorage
    const clickedArtists = JSON.parse(
      localStorage.getItem('clickedArtists') || '[]'
    );

    // Remove if already exists (to avoid duplicates)
    const updatedClicked = clickedArtists.filter(name => name !== artistName);

    // Add to the beginning of the list (most recent first)
    updatedClicked.unshift(artistName);

    // Limit to last 10 clicked artists to avoid localStorage bloat
    const limitedClicked = updatedClicked.slice(0, 10);

    // Save to localStorage (reordering will happen on next reload)
    localStorage.setItem('clickedArtists', JSON.stringify(limitedClicked));

    // Call the original onArtistClick if provided
    onArtistClick?.(artistName);
  };

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
          padding: '10px 0px',
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
              onClick={() => handleArtistClick(artist.name)}
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
