# Quick Reference: Promotional Campaigns

## 🚀 Quick Start (30 seconds)

### Add a New Campaign in 3 Steps:

**Step 1:** Import your background image (top of `Play.jsx`)
```javascript
import myEventBg from '../Images/playlistbg/my-event.png';
```

**Step 2:** Add campaign object to `PROMOTIONAL_CAMPAIGNS` array
```javascript
{
  id: 'my-event-2026',
  startDate: '2026-MM-DD',
  endDate: '2026-MM-DD',
  backgroundImage: myEventBg,
  playlistName: 'My Playlist',
  themeIndex: 5,
  title: 'My Event Title!',
  buttonText: 'Explore Playlist',
  autoCloseDuration: 10000,
}
```

**Step 3:** Test and deploy! ✅

---

## 📋 Campaign Object Template

```javascript
{
  id: 'unique-campaign-id',           // Required: String
  startDate: 'YYYY-MM-DD',            // Required: ISO date
  endDate: 'YYYY-MM-DD',              // Required: ISO date
  yearIndependent: true,              // Optional: true = runs every year
  backgroundImage: importedImage,     // Required: Image import
  playlistName: 'Playlist Name',      // Required: String
  themeIndex: 0,                      // Optional: 0-12 (number)
  title: 'Campaign Title',            // Required: String
  buttonText: 'Button Text',          // Required: String
  autoCloseDuration: 10000,           // Optional: milliseconds
}
```

---

## 🎨 Available Themes

| Index | Theme Name | Colors |
|-------|-----------|--------|
| 0 | Black | Dark theme |
| 1 | Pink-Red | Vibrant pink gradient |
| 2 | Green-Cyan | Fresh and energetic |
| 3 | Red-Maroon | Bold and elegant |
| 4 | Cyan-Purple | Cool and modern |
| 5 | Mint-Pink | Soft and gentle |
| 6 | Coral-Pink | Warm and inviting |
| 7 | Peach | Soft and warm |
| 8 | Red-Blue | Contrasting |
| 9 | Lavender-Blue | Calm and serene |
| 10 | Indian Flag | Saffron-White-Green |
| 11 | Valentine's | Pink hearts |
| 12 | Holi Festival | Rainbow of colors |

---

## 📅 Campaign Ideas by Month

| Month | Event Ideas |
|-------|------------|
| Jan | New Year, Republic Day (India), Winter Sale |
| Feb | Valentine's Day, Carnival |
| Mar | Holi, Women's Day, Spring |
| Apr | IPL Season, Easter, Earth Day |
| May | Mother's Day, Summer Kick-off |
| Jun | Father's Day, Music Festivals |
| Jul | Independence Day (US), Monsoon |
| Aug | Independence Day (India), Friendship Day |
| Sep | Teacher's Day, Back to School |
| Oct | Diwali, Halloween, Dussehra |
| Nov | Thanksgiving, Black Friday |
| Dec | Christmas, New Year Eve, Winter |

---

## 🔍 Common Use Cases

### Festival Campaign
```javascript
{
  id: 'diwali-2026',
  startDate: '2026-10-20',
  endDate: '2026-11-05',
  backgroundImage: diwaliImg,
  playlistName: 'Festive Hits',
  themeIndex: 3,
  title: '✨ Celebrate Diwali! ✨',
  buttonText: '🪔 Festival Playlist',
  autoCloseDuration: 10000,
}
```

### Sports Season
```javascript
{
  id: 'ipl-2026',
  startDate: '2026-04-01',
  endDate: '2026-05-31',
  backgroundImage: cricketImg,
  playlistName: 'Workout Mix',
  themeIndex: 8,
  title: '🏏 IPL Season is Here!',
  buttonText: 'Energize Your Game',
  autoCloseDuration: 8000,
}
```

### Romantic Holiday (Year-Independent)
```javascript
{
  id: 'valentines',
  startDate: '2026-02-10',
  endDate: '2026-02-14',
  yearIndependent: true, // Runs every year!
  backgroundImage: valentineImg,
  playlistName: 'Valentine',
  themeIndex: 11,
  title: '❤️ Love is in the Air',
  buttonText: '💕 Romantic Songs',
  autoCloseDuration: 10000,
}
```

### Festival Campaign (Year-Independent)
```javascript
{
  id: 'holi-festival',
  startDate: '2026-03-10',
  endDate: '2026-03-18',
  yearIndependent: true, // Runs every year!
  backgroundImage: holiImg,
  playlistName: 'Holi',
  themeIndex: 12,
  title: '🌈 Festival of Colors!',
  buttonText: '🎨 Celebrate Holi',
  autoCloseDuration: 10000,
}
```

---

## ⚙️ File Locations

| What | Where |
|------|-------|
| Main config | `/src/Pages/Play.jsx` (line ~82) |
| Add images | `/src/Images/playlistbg/` |
| Import images | Top of `Play.jsx` (line ~28) |
| Playlist tracks | `Play.jsx` `playlistTracks` object (line ~52) |

---

## 🧪 Testing Checklist

- [ ] Image imported correctly
- [ ] Campaign added to array
- [ ] Playlist name matches existing playlist
- [ ] Date format is 'YYYY-MM-DD'
- [ ] Theme index is 0-11
- [ ] Modal appears on page load (during campaign dates)
- [ ] Background image displays
- [ ] Title and button text show correctly
- [ ] Button click navigates to playlist
- [ ] Theme changes automatically
- [ ] Auto-close works
- [ ] Progress bar animates
- [ ] Close button works
- [ ] Responsive on mobile

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Modal doesn't appear | Check if today's date is within campaign range |
| Background not showing | Verify image import path |
| Wrong playlist opens | Check playlist name spelling (case-sensitive) |
| Theme doesn't change | Verify themeIndex is 0-11 |
| Modal appears always | Check date format and endDate |

---

## 💡 Pro Tips

1. **Test with Today's Date**: Temporarily change startDate to today for testing
2. **Optimize Images**: Use WebP format, keep under 500KB
3. **Keep Text Short**: Mobile screens are small
4. **Non-Overlapping Dates**: First match wins
5. **Backup Theme**: Always set a themeIndex for consistency
6. **Auto-Close Duration**: 8-12 seconds is ideal
7. **Clear Cache**: Hard refresh (Cmd+Shift+R) to see changes

---

## 📚 Documentation Links

- **Complete Guide**: [PROMOTIONAL_CAMPAIGNS_GUIDE.md](./PROMOTIONAL_CAMPAIGNS_GUIDE.md)
- **Example**: [EXAMPLE_VALENTINES_CAMPAIGN.md](./EXAMPLE_VALENTINES_CAMPAIGN.md)
- **System Flow**: [SYSTEM_FLOW_DIAGRAM.md](./SYSTEM_FLOW_DIAGRAM.md)
- **Changes**: [CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)

---

## 🎯 One-Line Summary

**Add campaigns by adding an object to `PROMOTIONAL_CAMPAIGNS` array in `Play.jsx`** ✨

---

## 📞 Need Help?

1. Check the full guide: `PROMOTIONAL_CAMPAIGNS_GUIDE.md`
2. See example: `EXAMPLE_VALENTINES_CAMPAIGN.md`
3. Review flow diagram: `SYSTEM_FLOW_DIAGRAM.md`
4. Check browser console for errors

---

**Last Updated**: February 3, 2026
**Version**: 1.0.0
