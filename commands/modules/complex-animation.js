// Example complex command module
export default {
    async execute(args, userTags, container) {
        // Create a custom animated element
        const element = document.createElement('div');
        element.className = 'command-output';
        element.style.cssText = `
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 20px;
            border-radius: 10px;
            color: white;
            font-size: 24px;
            font-weight: bold;
            animation: complexAnimation 3s ease-in-out;
        `;
        
        // Add custom CSS animation
        if (!document.getElementById('complex-animation-style')) {
            const style = document.createElement('style');
            style.id = 'complex-animation-style';
            style.textContent = `
                @keyframes complexAnimation {
                    0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 0; }
                    25% { transform: translate(-50%, -50%) scale(1.2) rotate(90deg); opacity: 1; }
                    50% { transform: translate(-50%, -50%) scale(1) rotate(180deg); opacity: 1; }
                    75% { transform: translate(-50%, -50%) scale(1.1) rotate(270deg); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(0) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set content based on user who triggered command
        const username = userTags.username || 'Someone';
        element.textContent = `${username} used a complex command!`;
        
        // Add to container
        container.appendChild(element);
        
        // Remove after animation completes
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 3000);
    }
};
