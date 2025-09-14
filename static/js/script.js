document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    const messageBox = document.getElementById('message-box');

    // Function to show a message
    function showMessage(message, type = 'success') {
        messageBox.textContent = message;
        messageBox.className = 'alert-box show'; // Reset and add show class
        if (type === 'error') {
            messageBox.classList.add('error');
        } else {
            messageBox.classList.remove('error');
        }

        setTimeout(() => {
            messageBox.classList.remove('show');
            messageBox.classList.remove('error'); // Clean up error class as well
        }, 3000); // Hide after 3 seconds
    }

    // Function to set theme
    function setTheme(theme) {
        body.className = theme; // Update body class
        if (theme === 'dark') {
            themeIcon.setAttribute('href', 'https://cdn.jsdelivr.net/npm/lucide-static@latest/sprite.svg#sun');
        } else {
            themeIcon.setAttribute('href', 'https://cdn.jsdelivr.net/npm/lucide-static@latest/sprite.svg#moon');
        }
    }

    // Initial theme setup (Flask passes it, but JS can also read from cookie/localStorage if needed)
    // The theme is initially set by Flask in the <body> tag.
    // Let's ensure the icon matches.
    if (body.classList.contains('dark')) {
        themeIcon.setAttribute('href', 'https://cdn.jsdelivr.net/npm/lucide-static@latest/sprite.svg#sun');
    } else {
        themeIcon.setAttribute('href', 'https://cdn.jsdelivr.net/npm/lucide-static@latest/sprite.svg#moon');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', async () => {
        const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        try {
            const response = await fetch('/toggle-theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme: newTheme })
            });
            const result = await response.json();
            if (result.status === 'success') {
                setTheme(newTheme);
                showMessage(`Switched to ${newTheme} mode!`, 'success');
            } else {
                showMessage('Failed to toggle theme.', 'error');
            }
        } catch (error) {
            console.error('Error toggling theme:', error);
            showMessage('Network error while toggling theme.', 'error');
        }
    });

    // Global function to perform actions via Flask backend
    window.performAction = async function(actionName, userMessage) {
        showMessage(`Initiating: ${userMessage || actionName}...`, 'success'); // Show immediate feedback

        try {
            // Placeholder data for actions that might need it (e.g., logging)
            let requestBody = {};
            if (actionName === 'log_seed_transactions') {
                requestBody = { data: `Transaction ${Date.now()}` };
            } else if (actionName === 'log_network_identities') {
                requestBody = { data: `Identity ${Math.random().toString(36).substring(7)}` };
            }

            const response = await fetch(`/action/${actionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();
            if (result.status === 'success') {
                let finalMessage = result.message;
                // Append specific results if available
                if (result.result) finalMessage += ` ${result.result}`;
                if (result.download && result.upload) finalMessage += ` Download: ${result.download}, Upload: ${result.upload}`;
                if (result.data) finalMessage += ` In: ${result.data.in}, Out: ${result.data.out}`;
                showMessage(`Action "${actionName}" completed: ${finalMessage}`, 'success');
                console.log(`Action "${actionName}" result:`, result);
            } else {
                showMessage(`Action "${actionName}" failed: ${result.message}`, 'error');
                console.error(`Action "${actionName}" error:`, result.message);
            }
        } catch (error) {
            console.error(`Error performing action "${actionName}":`, error);
            showMessage(`Network error during action "${actionName}".`, 'error');
        }
    };
});
