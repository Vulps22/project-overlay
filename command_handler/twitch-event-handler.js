// Twitch Event Handler
// This file defines the TwitchEventHandler class that extends Handler

var TwitchEventHandler = class extends Handler {
    constructor() {
        super();
        this.events = {};
        this.init();
    }

    async init() {
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
        
        // Prepare template data
        const templateData = {
            username: eventData.username || eventData.display_name || '',
            count: eventData.count || eventData.viewer_count || ''
        };
        
        // Use base class method
        await this.executeConfig(eventConfig, templateData);
    }
};
