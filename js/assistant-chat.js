// AI Assistant Chat Functionality - Integrated with existing app.js

// Chat Rate Limiting Security
const chatRateLimit = {
  requests: [],
  maxRequests: 10,
  timeWindow: 60000, // 1 minute
  
  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    return this.requests.length < this.maxRequests;
  },
  
  addRequest() {
    this.requests.push(Date.now());
  }
};

class JojoAssistant {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.isInitialized = false;
        
        // DOM elements
        this.assistantAvatar = null;
        this.assistantChat = null;
        this.chatMessages = null;
        this.chatInput = null;
        this.chatSend = null;
        this.chatClose = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.waitForFirebase();
    }
    
    setupElements() {
        this.assistantAvatar = document.getElementById('assistantAvatar');
        this.assistantChat = document.getElementById('assistantChat');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.chatSend = document.getElementById('chatSend');
        this.chatClose = document.getElementById('chatClose');
    }
    
    setupEventListeners() {
        // Avatar click to toggle chat
        if (this.assistantAvatar) {
            this.assistantAvatar.addEventListener('click', () => {
                this.toggleChat();
                // Integrate with existing assistant tip system
                if (window.showTip) {
                    window.showTip('assistantChat');
                }
            });
        }
        
        // Close button
        if (this.chatClose) {
            this.chatClose.addEventListener('click', () => this.closeChat());
        }
        
        // Send message
        if (this.chatSend) {
            this.chatSend.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter key to send
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            // Don't close if clicking the assistant bubble or its close button
            const assistantBubble = document.getElementById('assistantBubble');
            const assistantClose = document.getElementById('assistantClose');
            
            if (this.isOpen && 
                this.assistantChat && 
                this.assistantAvatar &&
                !this.assistantChat.contains(e.target) && 
                !this.assistantAvatar.contains(e.target) &&
                !(assistantBubble && assistantBubble.contains(e.target)) &&
                e.target !== assistantClose) {
                this.closeChat();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }
    
    waitForFirebase() {
        // Wait for Firebase to be available
        const checkFirebase = () => {
            if (window.firebaseReady && window.getAIResponse && window.db) {
                this.isInitialized = true;
                console.log('Jojo Assistant initialized with Firebase');
            } else {
                console.log('Waiting for Firebase...', {
                    firebaseReady: !!window.firebaseReady,
                    getAIResponse: !!window.getAIResponse,
                    db: !!window.db
                });
                setTimeout(checkFirebase, 50);
            }
        };
        checkFirebase();
    }
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        if (!this.assistantChat) return;
        
        this.isOpen = true;
        this.assistantChat.classList.add('show');
        
        // Focus input
        setTimeout(() => {
            if (this.chatInput) {
                this.chatInput.focus();
            }
        }, 300);
        
        // Load chat history if we haven't already
        if (this.isInitialized && this.conversationHistory.length === 0) {
            this.loadChatHistory();
        }
    }
    
    closeChat() {
        if (!this.assistantChat) return;
        
        this.isOpen = false;
        this.assistantChat.classList.remove('show');
    }
    
    async loadChatHistory() {
        if (!window.db) return;
        
        try {
            const { collection, query, orderBy, limit, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const messagesRef = collection(window.db, 'chatMessages');
            const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
            
            onSnapshot(q, (snapshot) => {
                const messages = [];
                snapshot.forEach((doc) => {
                    messages.push(doc.data());
                });
                
                // Reverse to show oldest first
                messages.reverse();
                
                // Clear messages except welcome message
                const welcomeMessage = this.chatMessages.querySelector('.bot-message');
                this.chatMessages.innerHTML = '';
                if (welcomeMessage) {
                    this.chatMessages.appendChild(welcomeMessage);
                }
                
                // Display recent messages
                messages.forEach(messageData => {
                    this.displayMessage(messageData.text, messageData.isUser, false);
                });
                
                this.scrollToBottom();
            });
        } catch (error) {
            console.log('Chat history not available:', error);
        }
    }
    
    async sendMessage() {
        const message = this.chatInput?.value?.trim();
        if (!message || !this.isInitialized) return;
        
        // Rate limiting check
        if (!chatRateLimit.canMakeRequest()) {
            this.addMessage("⚠️ Too many requests. Please wait before sending another message.", 'bot');
            return;
        }
        
        // Disable input while processing
        this.setInputEnabled(false);
        
        // Add request to rate limiter
        chatRateLimit.addRequest();
        
        // Display user message
        this.displayMessage(message, true);
        await this.saveMessage(message, true);
        
        // Clear input
        this.chatInput.value = '';
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Display bot response
            this.displayMessage(response, false);
            await this.saveMessage(response, false);
            
            // Add bot response to conversation history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: response }]
            });
            
            // Limit conversation history to last 20 messages
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }
            
        } catch (error) {
            this.removeTypingIndicator();
            console.error('Error getting AI response:', error);
            this.displayMessage('Sorry, I encountered an error. Please try again in a moment.', false);
        }
        
        // Re-enable input
        this.setInputEnabled(true);
        this.chatInput?.focus();
    }
    
    async getAIResponse(userMessage) {
        if (!window.getAIResponse) {
            throw new Error('AI service not available');
        }
        
        try {
            const result = await window.getAIResponse({
                message: userMessage,
                conversationHistory: this.conversationHistory
            });
            
            if (result.data && result.data.success) {
                return result.data.response;
            } else {
                throw new Error('Invalid response from AI service');
            }
            
        } catch (error) {
            console.error('Error calling AI function:', error);
            throw error;
        }
    }
    
    displayMessage(text, isUser, shouldScroll = true) {
        if (!this.chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} new`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add some personality for the AI responses
        if (!isUser && this.conversationHistory.length === 0) {
            // First message - be welcoming
            contentDiv.innerHTML = text;
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        if (shouldScroll) {
            this.scrollToBottom();
        }
        
        // Remove animation class after animation completes
        setTimeout(() => {
            messageDiv.classList.remove('new');
        }, 300);
    }
    
    async saveMessage(text, isUser) {
        if (!window.db) return;
        
        try {
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await addDoc(collection(window.db, 'chatMessages'), {
                text: text,
                isUser: isUser,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.log('Message not saved:', error);
        }
    }
    
    showTypingIndicator() {
        if (!this.chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typingIndicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    scrollToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }
    
    setInputEnabled(enabled) {
        if (this.chatInput) {
            this.chatInput.disabled = !enabled;
        }
        if (this.chatSend) {
            this.chatSend.disabled = !enabled;
        }
    }
}

// Initialize the assistant
window.jojoAssistant = new JojoAssistant();
