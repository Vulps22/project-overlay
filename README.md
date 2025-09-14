# Twitch Command & Event Overlay System

A modular browser-based overlay system for Twitch streamers that handles chat commands and real-time events (follows, subscriptions, raids) using Twitch's EventSub WebSocket API.

## Features

- **Chat Commands**: Customizable commands with images, videos, sounds, and chat replies
- **Real-time Events**: Follow notifications, subscriptions, raids with overlay displays
- **EventSub WebSocket**: Native Twitch API integration (no third-party dependencies)
- **Modular Design**: Clean separation of commands, events, and handlers
- **Template System**: Dynamic text replacement with {{username}}, {{count}}, etc.
- **Media Support**: Images, auto-playing videos, sounds with volume control
- **Animations**: Built-in CSS transitions (fade, slide, bounce, scale)

## Quick Start

### 1. Set Up Twitch Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click "Register Your Application"
3. Fill out the form:
   - **Name**: Your overlay app name (e.g., "MyStreamOverlay")
   - **OAuth Redirect URLs**: `http://localhost`
   - **Category**: Chat Bot or Application Integration
4. Save and note your **Client ID**

### 2. Generate OAuth Token

Visit this URL (replace `YOUR_CLIENT_ID` with your actual Client ID):

```
https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=YOUR_CLIENT_ID&redirect_uri=https://localhost&scope=user:read:chat+user:bot+channel:bot+chat:read+chat:edit+channel:read:subscriptions+moderator:read:followers+user:write:chat&force_verify=true
```

After authorization, you'll be redirected to:
```
https://localhost#access_token=YOUR_TOKEN&scope=...&token_type=bearer
```

Copy the `access_token` value.

### 3. Set Up Overlay

1. Download/clone the overlay files
2. Add media files to the `assets/` folder
3. Configure commands in `commands.js`
4. Configure events in `events.js`

### 4. Use in OBS

Add a **Browser Source** with this URL:
```
file:///path/to/command_handler/index.html?twitch-token=YOUR_TOKEN&twitch-client-id=YOUR_CLIENT_ID&twitch-username=YOUR_USERNAME&twitch-channel=YOUR_CHANNEL
```

**Example:**
```
file:///C:/Users/user/Documents/overlay/command_handler/index.html?twitch-token=abc123def456&twitch-client-id=xyz789uvw012&twitch-username=streamer123&twitch-channel=streamer123
```

## Required OAuth Scopes

The overlay needs these scopes for full functionality:

- `user:read:chat` - Read chat messages via EventSub
- `user:write:chat` - Post chat replies
- `user:bot` + `channel:bot` - Bot functionality
- `chat:read` + `chat:edit` - Chat access
- `channel:read:subscriptions` - Subscription events
- `moderator:read:followers` - Follow events

## File Structure

```
command_handler/
├── index.html                    # Main overlay page
├── commands.js                   # Chat command definitions
├── events.js                     # Event definitions (follows, subs, etc.)
├── handler.js                    # Base handler class
├── twitch-command-handler.js     # Command processing logic
├── twitch-event-handler.js       # Event processing logic
├── twitch-eventsub.js           # EventSub WebSocket connection
├── assets/                      # Media files (images, videos, sounds)
│   ├── lurk.png
│   ├── follow-dance.mp4
│   └── notification.mp3
└── modules/                     # Custom command modules (optional)
```

## Configuration

### Commands (`commands.js`)

```javascript
var COMMANDS = {
    "lurk": {
        "command_name": "lurk",
        "image": "lurk.png",
        "sound": "lurk.mp3",
        "volume": 50,  // 50% volume
        "text": "{{username}} is lurking!",
        "reply": "Thanks for lurking, {{username}}!",
        "transition_in": "fade-in",
        "transition_out": "fade-out",
        "timeout": "5s"
    },
    "dance": {
        "command_name": "dance",
        "video": "dance.mp4",
        "text": "Dance time!",
        "transition_in": "bounce-in",
        "timeout": "8s"
    }
};
```

### Events (`events.js`)

```javascript
var EVENTS = {
    "follow": {
        "event_name": "follow",
        "video": "follow-dance.mp4",
        "text": "{{username}} is following!",
        "reply": "Welcome to the community, {{username}}!",
        "transition_in": "scale-in",
        "timeout": "6s"
    },
    "subscription": {
        "event_name": "subscription",
        "image": "sub-celebration.gif",
        "sound": "sub-sound.mp3",
        "volume": 70,
        "text": "{{username}} just subscribed!",
        "timeout": "8s"
    }
};
```

## Supported Media Types

### Images
- **Formats**: PNG, JPG, GIF, WebP
- **Auto-sizing**: Max 33% viewport width/height
- **Location**: `./assets/image-name.png`

### Videos
- **Formats**: MP4, WebM
- **Auto-play**: Yes (muted for browser compatibility)
- **Auto-sizing**: Max 400px × 400px
- **Location**: `./assets/video-name.mp4`

### Sounds
- **Formats**: MP3, WAV, OGG
- **Volume**: Configurable per command/event (1-100)
- **Default**: 100% if not specified
- **Location**: `./assets/sound-name.mp3`

## Template Variables

Use these in `text` and `reply` fields:

- `{{username}}` - User's display name
- `{{count}}` - Viewer count (for raids)

**Example:**
```javascript
"text": "{{username}} brought {{count}} viewers!"
```

## Available Transitions

**Transition In/Out:**
- `fade-in` / `fade-out`
- `slide-left-in` / `slide-left-out`
- `slide-right-in` / `slide-right-out`
- `scale-in` / `scale-out`
- `bounce-in` / `bounce-out`

## Troubleshooting

### Console Errors

1. **Open browser console** (F12) to see detailed logs
2. Look for EventSub connection status:
   ```
   EventSub: WebSocket connected
   EventSub: Successfully subscribed to chat messages
   EventSub: Successfully subscribed to follow events
   ```

### Common Issues

**"EventSub: Failed to subscribe"**
- Check that your OAuth token has all required scopes
- Verify Client ID is correct
- Ensure token hasn't expired

**"No audio/video plays"**
- Check file paths in `assets/` folder
- Verify file formats are supported
- Check browser autoplay policies

**"Commands not working"**
- Verify commands start with `!` in chat
- Check command names match `commands.js`
- Look for typos in configuration

### Token Refresh

OAuth tokens eventually expire. When they do:
1. Generate a new token using the OAuth URL
2. Update the overlay URL with the new token
3. Refresh the browser source in OBS

## Development

### Adding New Commands

1. Add entry to `commands.js`
2. Add media files to `assets/`
3. Test with chat messages starting with `!`

### Adding New Events

1. Add entry to `events.js`
2. Add EventSub subscription in `twitch-eventsub.js`
3. Handle the event in the notification handler

### Custom Modules

Create JavaScript modules in `modules/` folder for complex commands:

```javascript
// modules/custom-command.js
export default {
    execute: async (args, userInfo, container) => {
        // Custom command logic
    }
};
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited (some autoplay restrictions)

## Security Notes

- OAuth tokens are passed via URL parameters (not stored in files)
- Tokens should be kept secure and not shared
- Use bot accounts for production (separate from main account)

## Support

- Check browser console for detailed error messages
- Verify all file paths and OAuth scopes
- Test with minimal configurations first
