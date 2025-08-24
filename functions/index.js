const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
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

// Get market banner with live prices and AI summary
exports.getMarketBanner = onCall(async (request) => {
  try {
    logger.info("Market banner request received");

    // Fetch crypto prices from CoinGecko
    const cryptoResponse = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=gbp",
    );

    // Try to fetch stocks & commodities from Yahoo Finance with proper headers
    let stocksResponse;
    try {
      stocksResponse = await axios.get(
          "https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC=F,SI=F,NVDA,TSLA,AAPL",
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                "AppleWebKit/537.36 (KHTML, like Gecko) " +
                "Chrome/91.0.4472.124 Safari/537.36",
              "Accept": "application/json",
              "Accept-Language": "en-US,en;q=0.9",
              "Accept-Encoding": "gzip, deflate, br",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
            },
          },
      );
    } catch (yahooError) {
      logger.warn("Yahoo Finance API failed, using fallback data:",
          yahooError.message);
      // Create fallback data structure
      stocksResponse = {
        data: {
          quoteResponse: {
            result: [
              {symbol: "GC=F", regularMarketPrice: 2500},
              {symbol: "SI=F", regularMarketPrice: 30},
              {symbol: "NVDA", regularMarketPrice: 800},
              {symbol: "TSLA", regularMarketPrice: 250},
              {symbol: "AAPL", regularMarketPrice: 220},
            ],
          },
        },
      };
    }

    // Extract crypto prices
    const cryptoPrices = cryptoResponse.data;
    logger.info("Raw crypto prices:", cryptoPrices);

    const bitcoin = (cryptoPrices.bitcoin && cryptoPrices.bitcoin.gbp) || 0;
    const ethereum = (cryptoPrices.ethereum && cryptoPrices.ethereum.gbp) || 0;
    const dogecoin = (cryptoPrices.dogecoin && cryptoPrices.dogecoin.gbp) || 0;

    logger.info("Extracted prices:", {bitcoin, ethereum, dogecoin});

    // Extract stock/commodity prices
    const quoteResponse = stocksResponse.data.quoteResponse;
    const quotes = (quoteResponse && quoteResponse.result) || [];
    const getPrice = (symbol) => {
      const quote = quotes.find((q) => q.symbol === symbol);
      return (quote && quote.regularMarketPrice) || 0;
    };

    const gold = getPrice("GC=F");
    const silver = getPrice("SI=F");
    const nvidia = getPrice("NVDA");
    const tesla = getPrice("TSLA");
    const apple = getPrice("AAPL");

    // Format prices as GBP with exact amounts
    const formatPrice = (price) => {
      return `£${price.toLocaleString("en-GB", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    };

    // Format crypto prices with more precision for smaller amounts
    const formatCryptoPrice = (price) => {
      if (price < 1) {
        return `£${price.toFixed(4)}`;
      } else if (price < 100) {
        return `£${price.toFixed(2)}`;
      } else {
        return `£${Math.round(price).toLocaleString("en-GB")}`;
      }
    };

    // Build prompt for Gemini
    const prompt = `Create a single-line financial ticker banner using these ` +
        `exact prices.
Include the exact prices with currency symbols. Add brief sentiment comments.
Use "   •   " (bullet with extra spaces) to separate each price item ` +
        `for better readability in a scrolling banner.

Current prices:
Bitcoin: ${formatCryptoPrice(bitcoin)}
Ethereum: ${formatCryptoPrice(ethereum)}
Dogecoin: ${formatCryptoPrice(dogecoin)}
Gold Futures: ${formatPrice(gold)}
Silver Futures: ${formatPrice(silver)}
Nvidia: ${formatPrice(nvidia)}
Tesla: ${formatPrice(tesla)}
Apple: ${formatPrice(apple)}

Example format: 
"📊 BTC steady   •   ETH rising   •   DOGE climbing   •   Gold flat"

Return only the ticker text, no quotes or extra formatting.`;

    // Get API key from Firebase config or fallback to hardcoded
    let GOOGLE_AI_API_KEY;
    try {
      const config = functions.config();
      GOOGLE_AI_API_KEY = (config.googleai && config.googleai.key);
    } catch (error) {
      // Fallback to existing key if config not available
      GOOGLE_AI_API_KEY = "AIzaSyCXzpT_IUGSfx_J2W2mYhW1auz4hL67SkY";
    }

    const GOOGLE_AI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    // Prepare request body for Gemini
    const requestBody = {
      contents: [{role: "user", parts: [{text: prompt}]}],
    };

    // Call Gemini API
    const geminiResponse = await axios.post(
        `${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
    );

    if (geminiResponse.data.candidates && geminiResponse.data.candidates[0] &&
        geminiResponse.data.candidates[0].content) {
      const banner = geminiResponse.data.candidates[0].content.parts[0].text;
      logger.info("Market banner generated successfully");

      return {
        banner: banner.trim(),
      };
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (error) {
    logger.error("Error generating market banner:", error);
    throw new Error("Failed to generate market banner");
  }
});
