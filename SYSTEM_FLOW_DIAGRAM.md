# Promotional Campaigns System Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOADS APP                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              useEffect() runs on component mount                 │
│              Calls: getActiveCampaign()                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Loop through campaigns:     │
              │  PROMOTIONAL_CAMPAIGNS[]     │
              └──────────────┬───────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐    ┌───────────────────┐
    │ Check if today    │    │ Check if today    │
    │ >= startDate AND  │    │ >= startDate AND  │
    │ <= endDate        │    │ <= endDate        │
    └─────┬─────────────┘    └─────┬─────────────┘
          │                         │
    ┌─────▼─────┐           ┌───────▼───────┐
    │  Match?   │           │    Match?     │
    │   YES     │           │      NO       │
    └─────┬─────┘           └───────┬───────┘
          │                         │
          ▼                         ▼
┌──────────────────┐     ┌──────────────────────┐
│ Return campaign  │     │  Continue to next    │
│     object       │     │     campaign         │
└────────┬─────────┘     └──────────┬───────────┘
         │                          │
         │                          │
         │                ┌─────────▼──────────┐
         │                │  No match found?   │
         │                │  Return null       │
         │                └─────────┬──────────┘
         │                          │
         └─────────────┬────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Is campaign null?          │
        └────┬─────────────────────┬───┘
             │                     │
        NO   │                     │  YES
             ▼                     ▼
    ┌─────────────────┐   ┌──────────────────┐
    │ Show Welcome    │   │  Don't show      │
    │ Modal with:     │   │  anything        │
    │ - Background    │   │  User sees       │
    │ - Title         │   │  normal app      │
    │ - Button        │   └──────────────────┘
    │ - Progress bar  │
    └────────┬────────┘
             │
             │
    ┌────────▼─────────┐
    │  Auto-countdown  │
    │  Progress bar    │
    │  fills up        │
    └────────┬─────────┘
             │
    ┌────────▼─────────────────┐
    │  After N milliseconds    │
    │  (autoCloseDuration)     │
    └────────┬─────────────────┘
             │
             ▼
      ┌──────────────┐
      │ Modal closes │
      │ automatically│
      └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    USER CLICKS BUTTON                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│            handleGoToCampaignPlaylist() called                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Get active campaign         │
              │  getActiveCampaign()         │
              └──────────────┬───────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐    ┌───────────────────┐
    │ Campaign found?   │    │ No campaign?      │
    │      YES          │    │      Close modal  │
    └─────┬─────────────┘    └───────────────────┘
          │
          ▼
┌─────────────────────┐
│ 1. Close modal      │
│ 2. Show playlists   │
│ 3. Select playlist  │
│    (from config)    │
│ 4. Change theme     │
│    (from config)    │
│ 5. Save theme to    │
│    localStorage     │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│ User sees playlist  │
│ with new theme!     │
└─────────────────────┘
```

## Data Flow

```
PROMOTIONAL_CAMPAIGNS Array
│
├─ Campaign 1: Bharat (Jan 1-26)
│  ├─ id: 'bharat-republic-day'
│  ├─ startDate: '2026-01-01'
│  ├─ endDate: '2026-01-26'
│  ├─ backgroundImage: indianFlagImg
│  ├─ playlistName: 'Bharat'
│  ├─ themeIndex: 10
│  ├─ title: 'Feel the Spirit of Patriotism!'
│  ├─ buttonText: 'Explore the new "Bharat" Playlist'
│  └─ autoCloseDuration: 10000
│
├─ Campaign 2: [Future Campaign]
│  └─ ... (same structure)
│
└─ Campaign N: [Future Campaign]
   └─ ... (same structure)

        ↓

getActiveCampaign() Function
│
├─ Gets current date
├─ Loops through campaigns
├─ Compares dates
└─ Returns first match or null

        ↓

React State
│
├─ showWelcomeModal (true/false)
├─ welcomeModalProgress (0-100)
└─ activeCampaign (object or null)

        ↓

Modal Component (JSX)
│
├─ Conditionally renders if campaign exists
├─ Uses campaign.backgroundImage
├─ Displays campaign.title
├─ Shows campaign.buttonText
└─ Auto-closes after campaign.autoCloseDuration

        ↓

User Interaction
│
├─ Button Click → Navigate to playlist
├─ Theme changes automatically
└─ Modal closes
```

## Component Lifecycle

```
Mount (useEffect)
    │
    ├─ Fetch music from Firebase
    ├─ Load favorites from localStorage
    ├─ Load theme from localStorage
    └─ Check for active campaign
        │
        ├─ If campaign active → Show modal
        │   │
        │   └─ Start countdown timer
        │       │
        │       ├─ Update progress every 100ms
        │       └─ Close after duration
        │
        └─ If no campaign → Continue normally

Update (when showWelcomeModal changes)
    │
    └─ Re-run countdown effect
        │
        ├─ Get fresh campaign data
        ├─ Start new countdown
        └─ Update progress bar

User Action (button click)
    │
    └─ handleGoToCampaignPlaylist()
        │
        ├─ Get campaign data
        ├─ Close modal
        ├─ Navigate to playlist
        ├─ Apply theme
        └─ Save to localStorage
```

## Configuration to Display Flow

```
Step 1: Developer adds campaign
─────────────────────────────────
{
  id: 'valentines-day',
  startDate: '2026-02-10',
  endDate: '2026-02-14',
  ...
}


Step 2: User visits on Feb 12
─────────────────────────────────
Current Date: 2026-02-12
Campaign Start: 2026-02-10
Campaign End: 2026-02-14

Check: 2026-02-12 >= 2026-02-10? ✓ YES
Check: 2026-02-12 <= 2026-02-14? ✓ YES

→ Campaign is ACTIVE


Step 3: Modal appears
─────────────────────────────────
┌─────────────────────────────┐
│  [Valentine's Background]   │
│                             │
│  💕 Celebrate Love! 💕      │
│                             │
│  [Explore Romantic Hits]    │
│                             │
│  ▓▓▓▓▓▓░░░░░░░░ Progress    │
└─────────────────────────────┘


Step 4: User clicks button
─────────────────────────────────
Navigate to: "Romantic Hits"
Apply theme: 11 (Valentine's)
Save theme: localStorage
Close modal: true


Step 5: User sees result
─────────────────────────────────
┌─────────────────────────────┐
│  Beatify                    │
│  [Valentine Theme Active]   │
│                             │
│  Romantic Hits Playlist     │
│  ♫ Song 1                   │
│  ♫ Song 2                   │
│  ♫ Song 3                   │
└─────────────────────────────┘
```

## Date Comparison Logic

```javascript
Today:        2026-02-12 00:00:00
              ─────────┬─────────
                       │
         ┌─────────────┴─────────────┐
         │                           │
    Campaign A:              Campaign B:
    Start: 2026-01-01        Start: 2026-02-10
    End:   2026-01-26        End:   2026-02-14
         │                           │
         ▼                           ▼
    2026-02-12 < 2026-01-01? NO    2026-02-12 >= 2026-02-10? YES
    2026-02-12 > 2026-01-26? YES   2026-02-12 <= 2026-02-14? YES
         │                           │
         ▼                           ▼
    ✗ Not Active               ✓ ACTIVE!
    (outside range)            (within range)
```

## Error Handling Flow

```
getActiveCampaign()
    │
    ├─ No campaigns in array?
    │   └─ Return null → No modal shown
    │
    ├─ Invalid date format?
    │   └─ JavaScript Date handles it
    │       └─ Invalid Date → Comparison fails → Skip campaign
    │
    ├─ Missing fields?
    │   └─ Modal uses fallbacks or doesn't render
    │
    └─ No matching campaign?
        └─ Return null → No modal shown


handleGoToCampaignPlaylist()
    │
    ├─ No active campaign?
    │   └─ Close modal, do nothing
    │
    ├─ Playlist doesn't exist?
    │   └─ Sets selectedPlaylist anyway
    │       └─ PlaylistDetail handles empty playlists
    │
    └─ Invalid themeIndex?
        └─ Theme doesn't change (uses current theme)
```

## Timeline Example: Multiple Campaigns

```
Jan 2026  Feb 2026  Mar 2026  Apr 2026
│─────────│─────────│─────────│
│         │         │         │
├─────────┤         │         │  Campaign 1: Bharat
│ Jan 1-26│         │         │  (Republic Day)
│         │         │         │
│         ├────┤    │         │  Campaign 2: Valentine's
│         │Feb10-14 │         │  (Love celebration)
│         │         │         │
│         │         ├─────┤   │  Campaign 3: Holi
│         │         │Mar10-15 │  (Festival of colors)
│         │         │         │
│         │         │         ├──────┤  Campaign 4: IPL
│         │         │         │Apr1-May│ (Cricket season)

Each campaign is independent
Dates don't overlap
Automatic switching based on date
```

## Key Benefits Illustrated

```
BEFORE (Hardcoded)               AFTER (Configurable)
═══════════════════              ════════════════════

Single Campaign                  ∞ Campaigns
Fixed dates                      Flexible dates
Hardcoded in JSX                 Data-driven config
Difficult to modify              Easy to add/remove
One-time use                     Reusable system


Code Changes Required:           Code Changes Required:
─────────────────────            ─────────────────────
20+ lines in JSX                 Add 10-line object
Update logic                     to array
Test thoroughly                  Done!


Adding Valentine's:              Adding Valentine's:
─────────────────               ─────────────────
1. Find hardcoded dates         1. Add object to array
2. Add new if/else logic        2. Import image
3. Duplicate modal JSX          3. Done! ✓
4. Update handlers
5. Test all branches
6. Risk breaking existing code
```

This system transforms promotional campaigns from a one-time feature into a maintainable, scalable solution! 🎉
