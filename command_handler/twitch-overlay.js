// Twitch Command Overlay Handler
// This file defines the TwitchCommandOverlay class as a global variable

var TwitchCommandOverlay = class {
    constructor() {
        this.commands = {};
        this.modules = {};
        this.container = document.getElementById('overlay-container');
        this.init();
    }

    async init() {
        await this.loadCommands();
        this.connectToTwitch();
    }

    async loadCommands() {
        try {
            // Use the imported COMMANDS from commands.js
            this.commands = COMMANDS;
            console.log('All commands loaded:', Object.keys(this.commands));
        } catch (error) {
            console.error('Failed to load commands:', error);
        }
    }

    connectToTwitch() {
        // Read token and username from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('twitch-token');
        const username = urlParams.get('twitch-username');
        const channel = urlParams.get('twitch-channel') || 'vulps22';

        let clientConfig = {
            channels: [channel]
        };
        if (token && username) {
            clientConfig.identity = {
                username: username,
                password: `oauth:${token}`
            };
            console.log('Twitch chat: Using authenticated mode for', username);
        } else {
            console.log('Twitch chat: Using anonymous mode (read-only)');
        }

        // Use tmi from window object
        const client = new tmi.Client(clientConfig);

        client.connect();

        client.on('message', (channel, tags, message, self) => {
            console.log('=== TWITCH MESSAGE RECEIVED ===');
            console.log('Channel:', channel);
            console.log('Message:', message);
            console.log('Self:', self);
            console.log('Tags:', tags);
            console.log('================================');
            
            if (self) return; // Ignore echoed messages

            if (message.startsWith('!')) {
                const commandText = message.substring(1);
                const commandName = commandText.split(' ')[0].toLowerCase();
                const args = commandText.split(' ').slice(1);
                
                console.log('=== COMMAND DETECTED ===');
                console.log('Command text:', commandText);
                console.log('Command name:', commandName);
                console.log('Arguments:', args);
                console.log('User tags:', tags);
                console.log('========================');
                
                this.executeCommand(commandName, args, tags, client);
            }
        });

        this.client = client; // Save for later use (e.g., posting)

        console.log(`Connected to Twitch channel: ${channel}`);
    }

    async executeCommand(commandName, args, userTags, client) {
        console.log('=== EXECUTE COMMAND ===');
        console.log('Looking for command:', commandName);
        console.log('Available commands:', Object.keys(this.commands));
        console.log('Command found:', !!this.commands[commandName]);
        console.log('======================');
        
        if (this.commands[commandName]) {
            console.log('Executing JSON command:', this.commands[commandName]);
            await this.executeJSONCommand(this.commands[commandName], args, userTags, client);
        } else if (await this.loadModule(commandName)) {
            console.log('Executing module command:', commandName);
            await this.executeModuleCommand(commandName, args, userTags, client);
        } else {
            console.log(`Unknown command: ${commandName}`);
        }
    }

    async executeJSONCommand(commandData, args, userTags, client) {
        const outputElement = document.createElement('div');
        outputElement.className = 'command-output';

        // Username for template replacement
        const username = userTags && userTags['display-name'] ? userTags['display-name'] : (userTags && userTags.username ? userTags.username : '');

        // Apply transition in class
        if (commandData.transition_in) {
            outputElement.classList.add(commandData.transition_in);
        }

        // Add image
        if (commandData.image) {
            const img = document.createElement('img');
            img.src = `./assets/${commandData.image}`;
            img.className = 'command-image';
            outputElement.appendChild(img);
        }

        // Add video
        if (commandData.video) {
            const video = document.createElement('video');
            video.src = `./assets/${commandData.video}`;
            video.className = 'command-video';
            video.autoplay = true;
            video.muted = true;
            outputElement.appendChild(video);
        }

        // Add text (with {{username}} replacement)
        if (commandData.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'command-text';
            textDiv.textContent = commandData.text.replace(/\{\{\s*username\s*\}\}/gi, username);
            outputElement.appendChild(textDiv);
        }

        // Play sound
        if (commandData.sound) {
            const audio = new Audio(`./assets/${commandData.sound}`);
            audio.play().catch(error => {
                console.warn('Could not play sound:', error);
            });
        }

        // Add to container
        this.container.appendChild(outputElement);

        // Post reply to chat if defined
        if (commandData.reply && client && typeof client.say === 'function') {
            const channel = client.getChannels ? client.getChannels()[0] : null;
            if (channel) {
                const replyMsg = commandData.reply.replace(/\{\{\s*username\s*\}\}/gi, username);
                client.say(channel, replyMsg);
            }
        }

        // Remove after timeout
        const timeout = this.parseTimeout(commandData.timeout || '3s');
        setTimeout(() => {
            this.removeElement(outputElement, commandData.transition_out);
        }, timeout);
    }

    async loadModule(moduleName) {
        if (this.modules[moduleName]) {
            return true;
        }

        try {
            const module = await import(`./modules/${moduleName}.js`);
            this.modules[moduleName] = module;
            return true;
        } catch (error) {
            console.log(`Module ${moduleName} not found`);
            return false;
        }
    }

    async executeModuleCommand(moduleName, args, userTags) {
        const module = this.modules[moduleName];
        if (module && module.default && typeof module.default.execute === 'function') {
            await module.default.execute(args, userTags, this.container);
        }
    }

    removeElement(element, transitionOut) {
        if (transitionOut) {
            element.className = 'command-output ' + transitionOut;
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 500); // Match animation duration
        } else {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }
    }

    parseTimeout(timeoutStr) {
        const match = timeoutStr.match(/^(\d+(?:\.\d+)?)(s|ms)$/);
        if (!match) return 3000; // Default 3 seconds
        
        const value = parseFloat(match[1]);
        const unit = match[2];
        
        return unit === 's' ? value * 1000 : value;
    }
};
