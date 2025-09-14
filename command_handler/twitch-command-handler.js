// Twitch Command Handler
// This file defines the TwitchCommandHandler class as a global variable

var TwitchCommandHandler = class {
    constructor() {
        this.commands = {};
        this.modules = {};
        this.container = document.getElementById('overlay-container');
        this.accessToken = null;
        this.clientId = null;
        this.userId = null;
        this.init();
    }

    async init() {
        // Get access token and client ID from URL params for chat posting
        const urlParams = new URLSearchParams(window.location.search);
        this.accessToken = urlParams.get('twitch-token');
        this.clientId = urlParams.get('twitch-client-id');
        
        await this.loadCommands();
        console.log('TwitchCommandHandler: Initialized and ready to process commands');
    }

    async loadCommands() {
        try {
            // Use the imported COMMANDS from commands.js
            this.commands = COMMANDS;
            console.log('TwitchCommandHandler: Commands loaded:', Object.keys(this.commands));
        } catch (error) {
            console.error('TwitchCommandHandler: Failed to load commands:', error);
        }
    }

    // Main method to process chat messages and execute commands
    processChatMessage(messageText, userInfo) {
        console.log('TwitchCommandHandler: Processing message:', messageText);
        
        if (messageText.startsWith('!')) {
            const commandText = messageText.substring(1);
            const commandName = commandText.split(' ')[0].toLowerCase();
            const args = commandText.split(' ').slice(1);
            
            console.log('=== COMMAND DETECTED ===');
            console.log('Command text:', commandText);
            console.log('Command name:', commandName);
            console.log('Arguments:', args);
            console.log('User info:', userInfo);
            console.log('========================');
            
            this.executeCommand(commandName, args, userInfo);
        }
    }

    async executeCommand(commandName, args, userInfo) {
        console.log('=== EXECUTE COMMAND ===');
        console.log('Looking for command:', commandName);
        console.log('Available commands:', Object.keys(this.commands));
        console.log('Command found:', !!this.commands[commandName]);
        console.log('======================');
        
        if (this.commands[commandName]) {
            console.log('Executing JSON command:', this.commands[commandName]);
            await this.executeJSONCommand(this.commands[commandName], args, userInfo);
        } else if (await this.loadModule(commandName)) {
            console.log('Executing module command:', commandName);
            await this.executeModuleCommand(commandName, args, userInfo);
        } else {
            console.log(`Unknown command: ${commandName}`);
        }
    }

    async executeJSONCommand(commandData, args, userInfo) {
        const outputElement = document.createElement('div');
        outputElement.className = 'command-output';

        // Username for template replacement
        const username = userInfo && userInfo.display_name ? userInfo.display_name : (userInfo && userInfo.username ? userInfo.username : '');

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
        if (commandData.reply && this.accessToken && this.clientId && this.userId) {
            const replyMsg = commandData.reply.replace(/\{\{\s*username\s*\}\}/gi, username);
            await this.postChatMessage(replyMsg);
        }

        // Remove after timeout
        const timeout = this.parseTimeout(commandData.timeout || '3s');
        setTimeout(() => {
            this.removeElement(outputElement, commandData.transition_out);
        }, timeout);
    }

    async postChatMessage(message) {
        try {
            // Note: This posts as the authenticated user (token owner)
            // To post as a bot, use a bot account's token and make the bot a moderator
            const response = await fetch('https://api.twitch.tv/helix/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Client-Id': this.clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id: this.userId,
                    sender_id: this.userId, // This is the authenticated user (token owner)
                    message: message
                })
            });

            if (response.ok) {
                console.log('TwitchCommandHandler: Chat message sent:', message);
            } else {
                const error = await response.json();
                console.error('TwitchCommandHandler: Failed to send chat message:', error);
                
                // Common error: bot not moderator
                if (error.message && error.message.includes('moderator')) {
                    console.error('TwitchCommandHandler: Bot account needs to be a moderator to post messages');
                }
            }
        } catch (error) {
            console.error('TwitchCommandHandler: Error sending chat message:', error);
        }
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

    async executeModuleCommand(moduleName, args, userInfo) {
        const module = this.modules[moduleName];
        if (module && module.default && typeof module.default.execute === 'function') {
            await module.default.execute(args, userInfo, this.container);
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
