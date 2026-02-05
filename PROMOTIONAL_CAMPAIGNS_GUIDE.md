# Promotional Campaigns Configuration Guide

## Overview
The Beatify app now supports configurable promotional campaigns that display welcome modals with custom backgrounds, themes, and playlist redirects during specific date ranges.

## Configuration Location
The promotional campaigns are configured in `/src/Pages/Play.jsx` in the `PROMOTIONAL_CAMPAIGNS` array.

## How to Add a New Campaign

### Step 1: Define Campaign Object
Add a new campaign object to the `PROMOTIONAL_CAMPAIGNS` array:

```javascript
const PROMOTIONAL_CAMPAIGNS = [
  {
    id: 'unique-campaign-id',           // Unique identifier for the campaign
    startDate: 'YYYY-MM-DD',            // Campaign start date (inclusive)
    endDate: 'YYYY-MM-DD',              // Campaign end date (inclusive)
    backgroundImage: imageImport,       // Imported image for modal background
    playlistName: 'Playlist Name',      // Target playlist name (must exist)
    themeIndex: 0,                      // Theme index from THEMES array
    title: 'Your Campaign Title',       // Modal heading text
    buttonText: 'Your Button Text',     // Call-to-action button text
    autoCloseDuration: 10000,           // Auto-close time in milliseconds
  },
  // Add more campaigns here...
];
```

### Step 2: Import Background Image
At the top of `Play.jsx`, import your background image:

```javascript
import yourCampaignImage from '../Images/your-campaign-bg.png';
```

### Step 3: Configure Campaign Details

#### Required Fields:
- **id**: Unique string identifier (e.g., 'valentines-day-2026')
- **startDate**: ISO format date string (e.g., '2026-02-10')
- **endDate**: ISO format date string (e.g., '2026-02-14')
- **backgroundImage**: Imported image variable
- **playlistName**: Name of the playlist to redirect to (must match existing playlist)
- **title**: Text displayed as the modal heading
- **buttonText**: Text displayed on the CTA button

#### Optional Fields:
- **yearIndependent**: Boolean, if `true` the campaign runs every year (ignores year, only checks month/day)
- **themeIndex**: Number (0-11), sets app theme automatically when playlist is opened
- **autoCloseDuration**: Number in milliseconds (default: 10000)

## Example Campaign Configurations

### Example 1: Republic Day Campaign (Current)
```javascript
{
  id: 'bharat-republic-day',
  startDate: '2026-01-01',
  endDate: '2026-01-26',
  backgroundImage: indianFlagImg,
  playlistName: 'Bharat',
  themeIndex: 10, // Indian Flag theme
  title: 'Feel the Spirit of Patriotism!',
  buttonText: 'Explore the new "Bharat" Playlist',
  autoCloseDuration: 10000,
}
```

### Example 2: Valentine's Day Campaign (Year-Independent)
```javascript
{
  id: 'valentines-day',
  startDate: '2026-02-10',
  endDate: '2026-02-14',
  yearIndependent: true, // Runs every year!
  backgroundImage: valentineImg, // You need to import this
  playlistName: 'Valentine',
  themeIndex: 11, // Valentine's theme
  title: 'Celebrate Love! ❤️',
  buttonText: '💕 Explore Valentine Playlist',
  autoCloseDuration: 10000,
}
```
**Note**: With `yearIndependent: true`, this campaign will run every year from February 10-14, regardless of the year.

### Example 3: Holi Festival Campaign (Year-Independent)
```javascript
{
  id: 'holi-festival',
  startDate: '2026-03-10',
  endDate: '2026-03-18',
  yearIndependent: true, // Runs every year!
  backgroundImage: holiImg, // You need to import this
  playlistName: 'Holi',
  themeIndex: 12, // Holi Festival theme (Rainbow colors)
  title: 'Festival of Colors! 🌈',
  buttonText: '🎨 Celebrate Holi with Music',
  autoCloseDuration: 10000,
}
```
**Note**: With `yearIndependent: true`, this campaign will run every year from March 10-18, with the vibrant Holi rainbow theme!

## Available Themes
The `themeIndex` corresponds to themes in the `THEMES` array:
- 0: Black Theme
- 1: Pink-Red
- 2: Green-Cyan
- 3: Red-Maroon
- 4: Cyan-Purple
- 5: Mint-Pink
- 6: Coral-Pink
- 7: Peach
- 8: Red-Blue
- 9: Lavender-Blue
- 10: Indian Flag (Saffron-White-Green)
- 11: Valentine's Day Theme (Pink with Hearts)
- 12: Holi Festival Theme (Rainbow of Colors)

## Campaign Behavior

### Automatic Display
- The modal automatically displays on page load if current date falls within campaign range
- Users can close the modal manually using the X button
- Modal auto-closes after `autoCloseDuration` milliseconds
- Progress bar shows countdown at the bottom of modal

### Campaign Priority
- Campaigns are checked in array order
- First matching campaign (by date) is displayed
- Only one campaign can be active at a time

### Theme Application
- When user clicks the button, the app automatically switches to the specified theme
- Theme setting is saved to localStorage
- Playlist view is automatically opened with the specified playlist

### Year-Independent Campaigns
- Set `yearIndependent: true` to make a campaign run every year
- The system will ignore the year and only check month and day
- Perfect for recurring events like Valentine's Day, Christmas, etc.
- Example: A campaign set for Feb 10-14 will run every year during those dates

**Year-Specific vs Year-Independent:**
```javascript
// Year-Specific (only runs in 2026)
{
  startDate: '2026-01-01',
  endDate: '2026-01-26',
  // yearIndependent not set (defaults to false)
}

// Year-Independent (runs every year)
{
  startDate: '2026-02-10',
  endDate: '2026-02-14',
  yearIndependent: true, // Runs every year!
}
```

## Tips and Best Practices

1. **Non-Overlapping Dates**: Avoid overlapping campaign dates to prevent conflicts
2. **Test Dates**: Test your campaigns by temporarily adjusting the date range
3. **Image Optimization**: Use optimized images (WebP format recommended) for faster loading
4. **Playlist Existence**: Ensure the playlist exists in the `playlistTracks` object
5. **Clear Messaging**: Keep title and button text concise and engaging
6. **Duration**: Set appropriate auto-close duration (8-12 seconds recommended)

## Testing Your Campaign

To test a campaign without waiting for its date:
1. Temporarily change `startDate` to today's date
2. Set `endDate` to a future date
3. Reload the app
4. Verify modal appears with correct styling
5. Test button click redirects to correct playlist
6. Verify theme changes correctly
7. Restore original dates after testing

## Troubleshooting

**Modal doesn't appear:**
- Check if current date is within startDate and endDate range
- Verify date format is 'YYYY-MM-DD'
- Check browser console for errors

**Background image not showing:**
- Ensure image is imported correctly at top of file
- Verify image path is correct
- Check image file exists in the specified location

**Wrong playlist opens:**
- Verify playlistName exactly matches existing playlist name
- Check spelling and capitalization

**Theme doesn't change:**
- Verify themeIndex is within valid range (0-11)
- Check if theme is being overridden elsewhere

## Future Enhancements

Consider adding these features:
- Multiple campaigns at once (carousel)
- User preference to disable promotional modals
- Analytics tracking for campaign engagement
- A/B testing for different campaign variations
- Admin panel to manage campaigns without code changes
