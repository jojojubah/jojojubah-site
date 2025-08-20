// scripts/assistant/assistant-chat.js
// Handles chat interface - builds on top of basic assistant UI

export class AssistantChat {
  constructor(assistantUI, assistantAPI) {
    this.ui = assistantUI;
    this.api = assistantAPI;
    this.isEnabled = false;
    this.history = [];
    this.maxHistory = 16; // Keep conversation context manageable
    
    // DOM elements (created dynamically)
    this.form = null;
    this.input = null;
    this.sendBtn = null;
    this.log = null;
  }

  async enableChat() {
    if (this.isEnabled || !this.ui.isReady()) return false;

    try {
      // Test API connection first
      const connectionTest = await this.api.testConnection();
      if (!connectionTest.success) {
        throw new Error(`API connection failed: ${connectionTest.error}`);
      }

      // Inject chat UI into the assistant bubble
      this.injectChatUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isEnabled = true;
      console.log('Assistant chat enabled successfully');
      return true;

    } catch (error) {
      console.error('Failed to enable chat:', error);
      this.showError('Chat unavailable: ' + error.message);
      return false;
    }
  }

  injectChatUI() {
    const bubble = this.ui.bubble;
    if (!bubble) throw new Error('Assistant bubble not found');

    // Create chat UI HTML
    const chatHTML = `
      <form id="clippyForm" class="clippy-form" autocomplete="off" aria-label="Clippy chat">
        <input id="clippyInput" class="clippy-input" placeholder="Ask Clippy…" />
        <button id="clippySend" class="clippy-send" type="submit">Send</button>
      </form>
      <div id="clippyLog" class="clippy-log" aria-live="polite"></div>
    `;

    // Insert after the text element but before close button
    const textEl = this.ui.textEl;
    if (textEl) {
      textEl.insertAdjacentHTML('afterend', chatHTML);
    } else {
      bubble.insertAdjacentHTML('beforeend', chatHTML);
    }

    // Get references to new elements
    this.form = document.getElementById('clippyForm');
    this.input = document.getElementById('clippyInput');
    this.sendBtn = document.getElementById('clippySend');
    this.log = document.getElementById('clippyLog');

    // Add chat-enabled class for styling
    bubble.classList.add('assistant--chat-enabled');
  }

  setupEventListeners() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Optional: Handle Enter key for quick sending
    this.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.form.dispatchEvent(new Event('submit'));
      }
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const text = this.input?.value?.trim();
    if (!text) return;

    // Clear input and disable send button
    this.input.value = '';
    this.setSendingState(true);

    // Add user message to log
    this.addMessage('user', text);

    // Show thinking indicator
    const thinkingId = this.addMessage('assistant', 'thinking');
    this.startThinkingAnimation(thinkingId);

    try {
      // Call API
      const response = await this.api.askClippy(text, this.history);
      const reply = response.text || '(no response)';

      // Stop thinking animation and show response
      this.stopThinkingAnimation();
      this.replaceMessage(thinkingId, 'assistant', reply);

      // Update conversation history
      this.updateHistory(text, reply);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Show error in chat
      this.stopThinkingAnimation();
      this.replaceMessage(thinkingId, 'assistant', `⚠️ ${error.message}`);
      
      // Show toast notification
      this.showToast(error.message);

    } finally {
      this.setSendingState(false);
      this.input?.focus();
    }
  }

  addMessage(sender, content) {
    if (!this.log) return null;

    const id = crypto.randomUUID();
    const div = document.createElement('div');
    div.dataset.id = id;
    div.className = `line ${sender}`;
    div.textContent = content;
    
    this.log.appendChild(div);
    this.scrollToBottom();
    
    return id;
  }

  replaceMessage(id, sender, content) {
    if (!this.log) return;

    const element = this.log.querySelector(`[data-id="${id}"]`);
    if (element) {
      element.className = `line ${sender}`;
      element.textContent = content;
      this.scrollToBottom();
    } else {
      // Fallback: add new message
      this.addMessage(sender, content);
    }
  }

  startThinkingAnimation(messageId) {
    let dots = 0;
    this.thinkingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      const element = this.log?.querySelector(`[data-id="${messageId}"]`);
      if (element) {
        element.textContent = '…thinking' + '.'.repeat(dots);
      }
    }, 300);
  }

  stopThinkingAnimation() {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
  }

  updateHistory(userMessage, assistantReply) {
    this.history.push(
      { role: 'user', content: userMessage },
      { role: 'model', content: assistantReply }
    );

    // Keep history manageable
    if (this.history.length > this.maxHistory) {
      this.history.splice(0, this.history.length - this.maxHistory);
    }
  }

  setSendingState(sending) {
    if (this.sendBtn) {
      this.sendBtn.disabled = sending;
    }
    if (this.input) {
      this.input.disabled = sending;
    }
  }

  scrollToBottom() {
    if (this.log) {
      this.log.scrollTop = this.log.scrollHeight;
    }
  }

  showToast(message) {
    // Create simple toast notification
    let toast = document.getElementById('clippyToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clippyToast';
      toast.style.cssText = `
        position: fixed; right: 16px; bottom: 16px;
        background: #111; color: #fff; padding: 10px 14px;
        border-radius: 12px; box-shadow: 0 6px 24px rgba(0,0,0,.2);
        z-index: 99999; font-size: 14px; max-width: 80vw;
        opacity: 0; transform: translateY(10px);
        transition: all .25s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    
    // Show toast
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Hide after delay
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3500);
  }

  showError(message) {
    // Show error in the assistant bubble if chat isn't enabled yet
    if (this.ui && this.ui.textEl) {
      this.ui.textEl.textContent = `⚠️ ${message}`;
      this.ui.show();
    }
  }

  disableChat() {
    if (!this.isEnabled) return;

    // Remove chat UI
    this.form?.remove();
    this.log?.remove();

    // Remove chat-enabled class
    this.ui.bubble?.classList.remove('assistant--chat-enabled');

    // Clear references
    this.form = null;
    this.input = null;
    this.sendBtn = null;
    this.log = null;

    // Stop any ongoing animations
    this.stopThinkingAnimation();

    // Clear history
    this.history = [];

    this.isEnabled = false;
    console.log('Assistant chat disabled');
  }

  clearHistory() {
    this.history = [];
    if (this.log) {
      this.log.innerHTML = '';
    }
  }

  getState() {
    return {
      enabled: this.isEnabled,
      historyLength: this.history.length,
      apiStatus: this.api?.getStatus() || null
    };
  }
}
