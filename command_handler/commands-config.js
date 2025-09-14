// Commands Configuration
// This file exports all command definitions to avoid CORS issues with local files
// To add a new command, add it to the COMMANDS object below

export const COMMANDS = {
    "lurk": {
        "command_name": "lurk",
        "image": "lurk.png",
        "sound": "lurk.mp3",
        "transition_in": "slide-right-in",
        "transition_out": "slide-right-out",
        "timeout": "3s"
    },
    "hype": {
        "command_name": "hype",
        "video": "hype.mp4",
        "sound": "hype-sound.mp3",
        "transition_in": "bounce-in",
        "transition_out": "bounce-out",
        "timeout": "5s"
    },
    "hello": {
        "command_name": "hello",
        "text": "Hello there!",
        "transition_in": "scale-in",
        "transition_out": "scale-out",
        "timeout": "2s"
    },
    "thanks": {
        "command_name": "thanks",
        "image": "thanks.gif",
        "text": "Thank you!",
        "sound": "thanks.wav",
        "transition_in": "fade-in",
        "transition_out": "fade-out",
        "timeout": "4s"
    },
    "complex": {
        "command_name": "complex",
        "module": "complex-animation"
    }
};

// Helper function to get all command names
export function getCommandNames() {
    return Object.keys(COMMANDS);
}

// Helper function to get a specific command
export function getCommand(name) {
    return COMMANDS[name.toLowerCase()];
}
