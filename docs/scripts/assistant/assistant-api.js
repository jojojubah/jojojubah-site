// scripts/assistant/assistant-api.js
// Handles Google AI Studio API calls with proper error handling

export class AssistantAPI {
  constructor(firebaseService = null) {
    this.firebase = firebaseService;
    this.endpoint = "https://chat-dorm4odd6a-nw.a.run.app";
    this.maxRetries = 2;
    this.timeout = 30000; // 30 seconds
  }

  async askClippy(message, history = []) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message is required and must be a string');
    }

    let lastError = null;

    // Try with auth first, then fallback to no auth
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(message, history, attempt === 0);
        
        // Log successful interaction to Firebase (optional)
        if (this.firebase?.isReady()) {
          this.firebase.logChat(message, response.text).catch(console.warn);
        }

        return response;

      } catch (error) {
        lastError = error;
        console.warn(`API attempt ${attempt + 1} failed:`, error.message);
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }
      }
    }

    // All attempts failed
    throw this.createUserFriendlyError(lastError);
  }

  async makeRequest(message, history, useAuth = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Prepare headers
      const headers = {
        "Content-Type": "application/json",
      };

      // Add Firebase auth headers if available and requested
      if (useAuth && this.firebase?.isReady()) {
        try {
          const authHeaders = await this.firebase.getAuthHeaders();
          Object.assign(headers, authHeaders);
        } catch (error) {
          console.warn('Failed to get auth headers, proceeding without auth:', error);
        }
      }

      // Make the request
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, history }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
      }

      // Parse successful response
      const data = await response.json();
      
      if (!data || typeof data.text !== 'string') {
        throw new Error('Invalid response format from server');
      }

      return {
        text: data.text,
        usage: data.usage || null,
        model: data.model || 'unknown'
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  async parseErrorResponse(response) {
    try {
      const data = await response.json();
      return {
        message: data.error || data.message || 'Unknown server error',
        code: data.code || response.status
      };
    } catch {
      return {
        message: `Server returned ${response.status} ${response.statusText}`,
        code: response.status
      };
    }
  }

  isNonRetryableError(error) {
    const message = error.message.toLowerCase();
    
    // Don't retry on these errors
    const nonRetryablePatterns = [
      'invalid api key',
      'unauthorized',
      'forbidden',
      'not found',
      'invalid request',
      'bad request',
      'content policy violation'
    ];

    return nonRetryablePatterns.some(pattern => message.includes(pattern));
  }

  createUserFriendlyError(error) {
    if (!error) {
      return new Error('Unknown error occurred');
    }

    const message = error.message.toLowerCase();

    // Map technical errors to user-friendly messages
    if (message.includes('network') || message.includes('fetch')) {
      return new Error('Network connection problem. Please check your internet and try again.');
    }

    if (message.includes('timeout') || message.includes('aborted')) {
      return new Error('Request timed out. The server might be busy, please try again.');
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return new Error('Authentication failed. Please refresh the page and try again.');
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return new Error('Too many requests. Please wait a moment and try again.');
    }

    if (message.includes('server error') || message.includes('500')) {
      return new Error('Server is experiencing issues. Please try again in a few minutes.');
    }

    // Return original error if no specific mapping found
    return error;
  }

  // Test the API connection
  async testConnection() {
    try {
      const response = await this.askClippy("Hello", []);
      return {
        success: true,
        response: response.text
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get API status
  getStatus() {
    return {
      endpoint: this.endpoint,
      hasFirebase: this.firebase?.isReady() || false,
      firebaseStatus: this.firebase?.getStatus() || null
    };
  }
}
