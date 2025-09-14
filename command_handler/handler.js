// Base Handler Class
// This file defines the base Handler class that contains shared functionality

var Handler = class {
    constructor() {
        this.container = document.getElementById('overlay-container');
        this.accessToken = null;
        this.clientId = null;
        this.userId = null;
        this.initAuth();
    }

    initAuth() {
        // Get access token and client ID from URL params for chat posting
        const urlParams = new URLSearchParams(window.location.search);
        this.accessToken = urlParams.get('twitch-token');
        this.clientId = urlParams.get('twitch-client-id');
    }

    // Shared method to execute any config (command or event)
    async executeConfig(config, templateData = {}) {
        const outputElement = document.createElement('div');
        outputElement.className = 'command-output';

        // Apply transition in class
        if (config.transition_in) {
            outputElement.classList.add(config.transition_in);
        }

        // Add image
        if (config.image) {
            const img = document.createElement('img');
            img.src = `./assets/${config.image}`;
            img.className = 'command-image';
            outputElement.appendChild(img);
        }

        // Add video
        if (config.video) {
            const video = document.createElement('video');
            video.src = `./assets/${config.video}`;
            video.className = 'command-video';
            video.autoplay = true;
            video.muted = true;
            outputElement.appendChild(video);
        }

        // Add text (with template replacement)
        if (config.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'command-text';
            textDiv.textContent = this.replaceTemplates(config.text, templateData);
            outputElement.appendChild(textDiv);
        }

        // Play sound
        if (config.sound) {
            const audio = new Audio(`./assets/${config.sound}`);
            // Set volume if specified, otherwise use full volume (1.0)
            audio.volume = config.volume !== undefined ? config.volume / 100 : 1.0;
            audio.play().catch(error => {
                console.warn('Could not play sound:', error);
            });
        }

        // Add to container
        this.container.appendChild(outputElement);

        // Post reply to chat if defined
        if (config.reply && this.accessToken && this.clientId && this.userId) {
            const replyMsg = this.replaceTemplates(config.reply, templateData);
            await this.postChatMessage(replyMsg);
        }

        // Remove after timeout
        const timeout = this.parseTimeout(config.timeout || '3s');
        setTimeout(() => {
            this.removeElement(outputElement, config.transition_out);
        }, timeout);
    }

    // Template replacement for {{username}}, {{count}}, etc.
    replaceTemplates(text, templateData) {
        let result = text;
        
        // Replace {{username}}
        if (templateData.username) {
            result = result.replace(/\{\{\s*username\s*\}\}/gi, templateData.username);
        }
        
        // Replace {{count}}
        if (templateData.count) {
            result = result.replace(/\{\{\s*count\s*\}\}/gi, templateData.count);
        }
        
        return result;
    }

    async postChatMessage(message) {
        try {
            // Note: This posts as the authenticated user (token owner)
            const response = await fetch('https://api.twitch.tv/helix/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Client-Id': this.clientId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    broadcaster_id: this.userId,
                    sender_id: this.userId,
                    message: message
                })
            });

            if (response.ok) {
                console.log('Handler: Chat message sent:', message);
            } else {
                const error = await response.json();
                console.error('Handler: Failed to send chat message:', error);
                
                // Common error: bot not moderator
                if (error.message && error.message.includes('moderator')) {
                    console.error('Handler: Bot account needs to be a moderator to post messages');
                }
            }
        } catch (error) {
            console.error('Handler: Error sending chat message:', error);
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
