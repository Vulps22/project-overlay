// Commands Configuration
// This file defines all command data as a global variable
// To add a new command, add it to the COMMANDS object below

var COMMANDS = {
    "lurk": {
        "command_name": "lurk",
        "image": "lurk.png",
        "sound": "lurk.mp3",
        "text": "{{username}}",
        "reply": "Thank you for lurking, {{username}}!",
        "transition_in": "fade-in",
        "transition_out": "fade-out",
        "timeout": "6s"
    },
    "discord": {
        "command_name": "discord",
        "reply": "\nJoin our Discord: https://discord.vulps.co.uk",
    }
};

// Helper functions (optional)
function getCommandNames() {
    return Object.keys(COMMANDS);
}

function getCommand(name) {
    return COMMANDS[name.toLowerCase()];
}
