const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions");
const logger = require("firebase-functions/logger");
const axios = require("axios");

setGlobalOptions({maxInstances: 10});

// Secure function to handle AI API calls
exports.getAIResponse = onCall(async (request) => {
  try {
    const {message, conversationHistory} = request.data;

    // Validate input
    if (!message) {
      throw new Error("Message is required");
    }

    logger.info("AI request received", {message: message.substring(0, 50)});

    // Your API key stored securely in environment
    const GOOGLE_AI_API_KEY = "AIzaSyCXzpT_IUGSfx_J2W2mYhW1auz4hL67SkY";
    const GOOGLE_AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    // Prepare request body
    const requestBody = {
      contents: conversationHistory && conversationHistory.length > 0 ?
        conversationHistory :
        [{role: "user", parts: [{text: message}]}],
    };

    // Call Google AI API
    const response = await axios.post(
        `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
    );

    if (response.data.candidates && response.data.candidates[0] &&
        response.data.candidates[0].content) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      logger.info("AI response generated successfully");

      return {
        success: true,
        response: aiResponse,
      };
    } else {
      throw new Error("Invalid response from AI API");
    }
  } catch (error) {
    logger.error("Error calling Google AI API:", error);
    throw new Error("Failed to get AI response");
  }
});
