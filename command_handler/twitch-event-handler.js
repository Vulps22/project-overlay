// Twitch Event Handler
// This file defines the TwitchEventHandler class as a global variable

var TwitchEventHandler = class {
    constructor() {
        this.events = {};
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
        
        await this.loadEvents();
        console.log('TwitchEventHandler: Initialized and ready to process events');
    }

    async loadEvents() {
        try {
            // Use the imported EVENTS from events.js
            this.events = EVENTS;
            console.log('TwitchEventHandler: Events loaded:', Object.keys(this.events));
        } catch (error) {
            console.error('TwitchEventHandler: Failed to load events:', error);
        }
    }

    // Main method to process Twitch events
    processEvent(eventType, eventData) {
        console.log('TwitchEventHandler: Processing event:', eventType);
        
        if (this.events[eventType]) {
            console.log('=== EVENT TRIGGERED ===');
            console.log('Event type:', eventType);
            console.log('Event data:', eventData);
            console.log('Event config:', this.events[eventType]);
            console.log('=======================');
            
            this.executeEvent(eventType, eventData);
        } else {
            console.log('TwitchEventHandler: No configuration found for event:', eventType);
        }
    }

    async executeEvent(eventType, eventData) {
        const eventConfig = this.events[eventType];
        const outputElement = document.createElement('div');
        outputElement.className = 'command-output';

        // Username and other data for template replacement
        const username = eventData.username || eventData.display_name || '';
        const count = eventData.count || eventData.viewer_count || '';

        // Apply transition in class
        if (eventConfig.transition_in) {
            outputElement.classList.add(eventConfig.transition_in);
        }

        // Add image
        if (eventConfig.image) {
            const img = document.createElement('img');
            img.src = `./assets/${eventConfig.image}`;
            img.className = 'command-image';
            outputElement.appendChild(img);
        }

        // Add video
        if (eventConfig.video) {
            const video = document.createElement('video');
            video.src = `./assets/${eventConfig.video}`;
            video.className = 'command-video';
            video.autoplay = true;
            video.muted = true;
            outputElement.appendChild(video);
        }

        // Add text (with template replacement)
        if (eventConfig.text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'command-text';
            let text = eventConfig.text
                .replace(/\{\{\s*username\s*\}\}/gi, username)
                .replace(/\{\{\s*count\s*\}\}/gi, count);
            textDiv.textContent = text;
            outputElement.appendChild(textDiv);
        }

        // Play sound
        if (eventConfig.sound) {
            const audio = new Audio(`./assets/${eventConfig.sound}`);
            audio.play().catch(error => {
                console.warn('Could not play sound:', error);
            });
        }

        // Add to container
        this.container.appendChild(outputElement);

        // Post reply to chat if defined
        if (eventConfig.reply && this.accessToken && this.clientId && this.userId) {
            let replyMsg = eventConfig.reply
                .replace(/\{\{\s*username\s*\}\}/gi, username)
                .replace(/\{\{\s*count\s*\}\}/gi, count);
            await this.postChatMessage(replyMsg);
        }

        // Remove after timeout
        const timeout = this.parseTimeout(eventConfig.timeout || '5s');
        setTimeout(() => {
            this.removeElement(outputElement, eventConfig.transition_out);
        }, timeout);
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
                console.log('TwitchEventHandler: Chat message sent:', message);
            } else {
                const error = await response.json();
                console.error('TwitchEventHandler: Failed to send chat message:', error);
            }
        } catch (error) {
            console.error('TwitchEventHandler: Error sending chat message:', error);
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
        if (!match) return 5000; // Default 5 seconds
        
        const value = parseFloat(match[1]);
        const unit = match[2];
        
        return unit === 's' ? value * 1000 : value;
    }
};
