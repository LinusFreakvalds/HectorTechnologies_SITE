let isSpamming = false;
let isDarkMode = false;
let selectedMessageId = null;  // Store the ID of the selected message
let botToken = '';  // Bot Token will be set dynamically

const messageList = document.getElementById('message-list');
const chatIdInput = document.getElementById('chat-id');
const customMessageInput = document.getElementById('custom-message');
const replyMessageInput = document.getElementById('reply-message');
const imageUploadInput = document.getElementById('image-upload');
const botTokenInput = document.getElementById('bot-token');
var senderId;
// Flag to prevent multiple alerts when setting the token
let tokenSet = false;
let chatIdSet = false;

// Function to set the bot token from input
function setBotToken() {
    botToken = botTokenInput.value.trim();
    if (!botToken) {
        alert('Please enter a valid bot token.');
        return;
    }

    // Check if token is already set, if not show alert only once
    if (!tokenSet) {
        alert('Bot token set successfully!');
        tokenSet = true;
    }

    botTokenInput.disabled = false;  // Disable the input after setting the token
}

function setChatId() {
    chatId = botTokenInput.value.trim();
    if (!chatId) {
        alert('Please enter a chat ID.');
        return;
    }

    // Check if id is already set, if not show alert only once
    if (!chatIdSet) {
        alert('Chat ID set successfully!');
        chatId = true;
    }

    chatIdInput.disabled = false;  // Disable the input after setting the token
}

// API URL based on the bot token
const apiUrl = () => `https://api.telegram.org/bot${botToken}/`;

// This will store the received messages
let receivedMessages = [];

// Function to fetch updates from Telegram
function fetchUpdates() {
    const url = `${apiUrl()}getUpdates?offset=-1`;  // Get the latest message

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok && data.result.length > 0) {
                const newMessages = data.result;
                newMessages.forEach(msg => {
                    const messageId = msg.message.message_id;

                    // Check if the message ID already exists in the receivedMessages array
                    const messageExists = receivedMessages.some(existingMsg => existingMsg.messageId === messageId);
                    if (!messageExists) {
                        const sender = msg.message.from.username || msg.message.from.first_name;
                        window.senderId = msg.message.from.id; // Extract sender ID
                        const text = msg.message.text || 'No text';
                        const type = msg.message.photo ? 'photo' : 'text';

                        // Add the new message to the list
                        receivedMessages.push({ sender, message: text, type, messageId });

                        // Update the message list
                        updateMessageList();
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching updates:', error));
}

// Display received messages
function updateMessageList() {
    messageList.innerHTML = '';  // Clear the existing list
    receivedMessages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = `${msg.sender}: ${msg.type === 'text' ? msg.message : 'Image'}`;
        li.onclick = () => selectMessage(msg.messageId);
        messageList.appendChild(li);
    });
}

// Display received messages
function updateMessageList() {
    messageList.innerHTML = '';
    receivedMessages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = `${msg.sender}: ${msg.type === 'text' ? msg.message : 'Image'}`;
        li.onclick = () => selectMessage(msg.messageId);
        messageList.appendChild(li);
    });
}

// Select a message to reply to
function selectMessage(messageId, senderId) {
    selectedMessageId = messageId;
    replyMessageInput.placeholder = `Replying to message ID ${messageId}`;

    // Populate the user ID input with the sender's ID
    document.getElementById('chat-id').value = senderId;
}

// Send a custom message to a specific chat
function sendCustomMessage() {
    if (!botToken) {
        alert('Please set the bot token first!');
        return;
    }

    const chatId = chatIdInput.value;
    const customMessage = customMessageInput.value;

    if (chatId && customMessage) {
        sendTelegramMessage(chatId, customMessage);
        chatIdInput.value = '';
        customMessageInput.value = '';
    } else {
        alert('Please enter both Chat ID and message.');
    }
}

// Send a reply to the selected message
function sendReplyMessage() {
    if (!botToken) {
        alert('Please set the bot token first!');
        return;
    }

    const chatId = chatIdInput.value;
    const replyMessage = replyMessageInput.value;

    if (selectedMessageId && replyMessage) {
        sendTelegramMessage(chatId, replyMessage, selectedMessageId);
        replyMessageInput.value = '';
    } else {
        alert('Please select a message to reply to and enter a reply.');
    }
}

// Function to send a message to Telegram using the Bot API
function sendTelegramMessage(chatId, message, replyToMessageId = null) {
    const url = `${apiUrl()}sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}${replyToMessageId ? `&reply_to_message_id=${replyToMessageId}` : ''}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Message sent successfully:', data);
            } else {
                console.error('Error sending message:', data);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Start spamming (toggle behavior)
function startSpamming() {
    if (!isSpamming) {
        console.log('Spamming started...');
        isSpamming = true;
        const chatId = chatIdInput.value;
        const customMessage = customMessageInput.value;
        const interval = setInterval(() => {
            if (isSpamming && chatId && customMessage) {
                sendTelegramMessage(chatId, customMessage);
            } else {
                clearInterval(interval);
            }
        }, 100);  // Send every second
    }
}

// Stop spamming
function stopSpamming() {
    if (isSpamming) {
        console.log('Spamming stopped.');
        isSpamming = false;
    }
}

// Send image to the bot
function sendImage() {
    if (!botToken) {
        alert('Please set the bot token first!');
        return;
    }

    const file = imageUploadInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('chat_id', chatIdInput.value);

        fetch(`${apiUrl()}sendPhoto`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Image sent successfully:', data);
            } else {
                console.error('Error sending image:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please select an image.');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
}





// Initialize the message list on page load
updateMessageList();

// Fetch updates every 3 seconds to check for new messages
setInterval(fetchUpdates, 100);
