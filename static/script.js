document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    let conversationHistory = [];

    /**
     * Appends a message to the chat box UI using the required nested structure.
     * @param {string} sender - The sender of the message ('user' or 'bot').
     * @param {string} text - The message content.
     * @returns {HTMLElement} The created message *content* element (the inner bubble).
     */
    const appendMessage = (sender, text) => {
        // Create the main wrapper for alignment (e.g., <div class="message user-message">)
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message', `${sender}-message`);

        // Create the inner div for the visual bubble and text (e.g., <div class="message-content">...</div>)
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;

        // Put the content bubble inside the alignment wrapper
        messageWrapper.appendChild(messageContent);
        // Add the whole thing to the chat box
        chatBox.appendChild(messageWrapper);
        
        // Scroll to the bottom
        chatBox.scrollTop = chatBox.scrollHeight;
        
        // We return the inner bubble so we can update its text for the "Thinking..." message
        return messageContent;
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();

        if (!userMessage) {
            return;
        }

        appendMessage('user', userMessage);
        conversationHistory.push({ role: 'user', text: userMessage });
        userInput.value = '';

        // This variable now correctly holds the inner content div
        const thinkingMessageContent = appendMessage('bot', 'Thinking...');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversation: conversationHistory }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server.');
            }

            const result = await response.json();

            if (result.success && result.data) {
                // Update the textContent of the bubble element
                thinkingMessageContent.textContent = result.data;
                conversationHistory.push({ role: 'model', text: result.data });
            } else {
                thinkingMessageContent.textContent = result.message || 'Sorry, no response received.';
            }
        } catch (error) {
            console.error('Error:', error);
            thinkingMessageContent.textContent = 'Failed to get response from server.';
        }
    });
});

