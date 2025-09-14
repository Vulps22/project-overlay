#!/usr/bin/env node

/**
 * Command Configuration Generator
 * 
 * This script reads all JSON files from the commands/ folder and generates
 * a commands-config.js file that can be imported without CORS issues.
 * 
 * Usage: node generate-config.js
 */

const fs = require('fs');
const path = require('path');

const COMMANDS_DIR = './commands';
const OUTPUT_FILE = './commands.js';

function generateConfig() {
    try {
        // Read all JSON files from commands directory
        const files = fs.readdirSync(COMMANDS_DIR)
            .filter(file => file.endsWith('.json'));
        
        const commands = {};
        
        // Load each command file
        for (const file of files) {
            const filePath = path.join(COMMANDS_DIR, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const commandData = JSON.parse(content);
            
            // Use command_name or filename as key
            const commandName = commandData.command_name || file.replace('.json', '');
            commands[commandName] = commandData;
            
            console.log(`Loaded: ${commandName}`);
        }
        
        // Generate the JavaScript file content
        const configContent = `// Commands Configuration
// This file defines all command data as a global variable
// To add a new command, add a JSON file to the commands/ folder and run: node generate-config.js

var COMMANDS = ${JSON.stringify(commands, null, 4)};

// Helper functions (optional)
function getCommandNames() {
    return Object.keys(COMMANDS);
}

function getCommand(name) {
    return COMMANDS[name.toLowerCase()];
}`;
        
        // Write the configuration file
        fs.writeFileSync(OUTPUT_FILE, configContent);
        
        console.log(`\n✅ Generated ${OUTPUT_FILE} with ${Object.keys(commands).length} commands:`);
        console.log(Object.keys(commands).map(cmd => `  - ${cmd}`).join('\n'));
        
    } catch (error) {
        console.error('❌ Error generating config:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateConfig();
}

module.exports = { generateConfig };
