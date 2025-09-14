# Twitch Command System

This folder contains JSON command definitions for the Twitch chat overlay system. Commands can be defined as simple JSON files for basic functionality, or reference JavaScript modules for complex behaviors.

**IMPORTANT**: After adding or modifying JSON files in this folder, run `node ../generate-config.js` from the command_handler directory to update the main configuration file.

## Command File Structure

Each command is defined in a separate JSON file named after the command (e.g., `lurk.json` for the `!lurk` command).

### Required Fields

- **command_name** (string): The name of the command (usually matches the filename)

### Optional Fields

#### Media Assets
- **image** (string): Image filename in the `../assets/` folder (supports PNG, JPG, GIF)
- **video** (string): Video filename in the `../assets/` folder (supports MP4, WebM)
- **sound** (string): Audio filename in the `../assets/` folder (supports MP3, WAV, OGG)
- **text** (string): Text to display on screen

#### Timing & Animation
- **timeout** (string): How long to display the command output
  - Format: `"3s"` (seconds) or `"2000ms"` (milliseconds)
  - Default: `"3s"`
- **transition_in** (string): CSS class for entrance animation
- **transition_out** (string): CSS class for exit animation

#### Advanced
- **module** (string): JavaScript module name for complex behavior (alternative to JSON-only commands)

### Predefined Transitions

The following transition classes are available:

#### Entrance Animations (transition_in)
- `fade-in` - Fade in from transparent
- `slide-right-in` - Slide in from the right
- `slide-left-in` - Slide in from the left
- `scale-in` - Scale up from 0
- `bounce-in` - Bounce in with elastic effect

#### Exit Animations (transition_out)
- `fade-out` - Fade out to transparent
- `slide-right-out` - Slide out to the left
- `slide-left-out` - Slide out to the right
- `scale-out` - Scale down to 0
- `bounce-out` - Scale down quickly

### Custom CSS Transitions

You can also define custom CSS classes in the main `../index.html` file and reference them in your commands.

## Example JSON Commands

### Simple Image + Sound Command
```json
{
  "command_name": "lurk",
  "image": "lurk.png",
  "sound": "lurk.mp3",
  "transition_in": "fade-in",
  "transition_out": "fade-out",
  "timeout": "3s"
}
```

### Text-Only Command
```json
{
  "command_name": "hello",
  "text": "Hello there!",
  "transition_in": "scale-in",
  "transition_out": "scale-out",
  "timeout": "2s"
}
```

### Video Command
```json
{
  "command_name": "hype",
  "video": "hype.mp4",
  "sound": "hype-sound.mp3",
  "transition_in": "bounce-in",
  "transition_out": "bounce-out",
  "timeout": "5s"
}
```

### Combined Media Command
```json
{
  "command_name": "thanks",
  "image": "thanks.gif",
  "text": "Thank you!",
  "sound": "thanks.wav",
  "transition_in": "slide-right-in",
  "transition_out": "slide-right-out",
  "timeout": "4s"
}
```

### Module-Based Command
```json
{
  "command_name": "complex",
  "module": "complex-animation"
}
```

## JavaScript Modules

For complex commands that require custom logic, reference a JavaScript module in the `../modules/` folder. The module should export a default object with an `execute` function:

```javascript
// ../modules/complex-animation.js
export default {
    async execute(args, userTags, container) {
        // Custom command logic here
        // args: command arguments
        // userTags: Twitch user information
        // container: DOM element to add content to
    }
};
```

## Adding New Commands

1. Create a new JSON file in this folder (e.g., `newcommand.json`)
2. Define your command using the format below
3. Run `node ../generate-config.js` to update the configuration
4. Your command will now work in the overlay

## File Naming

- Command files: `[command-name].json` (e.g., `lurk.json` for `!lurk`)
- Asset files: Any valid filename in the `../assets/` folder
- Module files: `[module-name].js` in the `../modules/` folder

## Tips

- Keep image/video files reasonably sized for better performance
- Test timeout values to ensure commands don't overlap
- Use GIFs for animated images that should loop
- Sounds will be muted if the browser requires user interaction first
- Commands are case-insensitive (`!LURK` and `!lurk` both work)
