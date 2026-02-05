# Example: Adding a Valentine's Day Campaign

This example shows how to add a Valentine's Day promotional campaign to Beatify.

## Step 1: Prepare Your Background Image

1. Create or download a Valentine's Day themed background image
2. Save it to `/src/Images/playlistbg/valentines.png`

## Step 2: Import the Image

Add this import at the top of `/src/Pages/Play.jsx` (around line 28):

```javascript
import valentinesBgImg from '../Images/playlistbg/valentines.png';
```

## Step 3: Add Campaign Configuration

In the `PROMOTIONAL_CAMPAIGNS` array in `/src/Pages/Play.jsx`, add this configuration:

```javascript
const PROMOTIONAL_CAMPAIGNS = [
  {
    id: 'bharat-republic-day',
    startDate: '2026-01-01',
    endDate: '2026-01-26',
    backgroundImage: indianFlagImg,
    playlistName: 'Bharat',
    themeIndex: 10,
    title: 'Feel the Spirit of Patriotism!',
    buttonText: 'Explore the new "Bharat" Playlist',
    autoCloseDuration: 10000,
  },
  // Add Valentine's Day campaign here:
  {
    id: 'valentines-day-2026',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    backgroundImage: valentinesBgImg,
    playlistName: 'Romantic Hits',
    themeIndex: 11, // Valentine's theme
    title: 'Celebrate Love! ❤️',
    buttonText: '💕 Explore Romantic Playlist',
    autoCloseDuration: 10000,
  },
];
```

## Step 4: Ensure Playlist Exists

Make sure the "Romantic Hits" playlist has tracks assigned in the `playlistTracks` object (around line 52):

```javascript
const playlistTracks = {
  Bharat: [
    '32d36fc7-d69a-4217-b004-baf9412988ec',
    // ... more track IDs
  ],
  'Romantic Hits': [
    // Add your romantic track IDs here
    'track-id-1',
    'track-id-2',
    'track-id-3',
  ],
  // ... other playlists
};
```

## Step 5: Test the Campaign

### Option A: Wait for the Date
Simply wait until February 10, 2026, and the modal will automatically appear.

### Option B: Test Immediately
Temporarily change the dates to test now:

```javascript
{
  id: 'valentines-day-2026',
  startDate: '2026-02-03', // Today's date
  endDate: '2026-02-10',   // Some future date
  // ... rest of config
}
```

Then reload the app and you should see the modal!

## Step 6: Verify Behavior

When the modal appears, it should:
1. ✅ Display the Valentine's background image
2. ✅ Show the title "Celebrate Love! ❤️"
3. ✅ Show the button "💕 Explore Romantic Playlist"
4. ✅ Auto-close after 10 seconds with progress bar
5. ✅ When clicked, navigate to "Romantic Hits" playlist
6. ✅ Automatically switch to Valentine's theme (index 11)

## Complete Code Example

Here's what the relevant section should look like:

```javascript
// At the top of the file (after other imports, around line 28)
import indianFlagImg from '../Images/playlistbg/bharat.png';
import valentinesBgImg from '../Images/playlistbg/valentines.png';

// In the component (around line 82-129)
const PROMOTIONAL_CAMPAIGNS = [
  {
    id: 'bharat-republic-day',
    startDate: '2026-01-01',
    endDate: '2026-01-26',
    backgroundImage: indianFlagImg,
    playlistName: 'Bharat',
    themeIndex: 10,
    title: 'Feel the Spirit of Patriotism!',
    buttonText: 'Explore the new "Bharat" Playlist',
    autoCloseDuration: 10000,
  },
  {
    id: 'valentines-day-2026',
    startDate: '2026-02-10',
    endDate: '2026-02-14',
    backgroundImage: valentinesBgImg,
    playlistName: 'Romantic Hits',
    themeIndex: 11,
    title: 'Celebrate Love! ❤️',
    buttonText: '💕 Explore Romantic Playlist',
    autoCloseDuration: 10000,
  },
];
```

## Tips for Creating Great Campaigns

1. **Choose Complementary Colors**: Make sure text is readable on your background
2. **Optimize Images**: Use WebP format for faster loading
3. **Test on Mobile**: Ensure the modal looks good on all screen sizes
4. **Keep Text Short**: Mobile screens have limited space
5. **Use Emojis Sparingly**: They're fun but can look cluttered
6. **Set Appropriate Duration**: 8-12 seconds is ideal for auto-close

## More Campaign Ideas

- 🎃 Halloween: October 28-31
- 🎄 Christmas: December 20-25
- 🎆 New Year: December 31 - January 1
- 🕉️ Diwali: Based on lunar calendar
- 🎉 Birthday specials: Your birthday!
- 🏏 IPL Season: April-May
- 🎸 Music festivals: As per event dates

Happy campaigning! 🎉
