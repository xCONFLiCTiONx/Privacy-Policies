// gemini.js

if (typeof window.GeminiAnalyzer === 'undefined') {
  window.GeminiAnalyzer = class GeminiAnalyzer {
    static get modelId() {
      return 'gemini-3.5-flash-lite';
    }

    static get modelName() {
      return 'Gemini 3.5 Flash Lite';
    }

    static get endpoint() {
      return `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;
    }

    static async analyze(aggregatedData) {
      const textToAnalyze = aggregatedData.rawEmail || aggregatedData.fullPageText || "";
      console.log("[GeminiAnalyzer] Preparing text analysis (length: " + textToAnalyze.length + ")");
      
      const apiKey = await new Promise((resolve) => {
        chrome.storage.sync.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (syncResult) => {
          let key = syncResult?.gemini_api_key || syncResult?.geminiApiKey || syncResult?.apiKey;
          
          if (key) {
            resolve(key);
            return;
          }

          chrome.storage.local.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (localResult) => {
            key = localResult?.gemini_api_key || localResult?.geminiApiKey || localResult?.apiKey;
            resolve(key || '');
          });
        });
      });

      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please enter your API key in the popup.");
      }

      const promptText = `Analyze the following content for details, context, key insights, or security threats if applicable:\n\n${textToAnalyze}`;

      try {
        const response = await fetch(`${this.endpoint}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
          throw new Error(`Gemini API Error: ${message}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
          throw new Error("Gemini returned an empty response or was blocked by safety filters.");
        }

        return candidate.content.parts[0].text;
      } catch (err) {
        console.warn("[GeminiAnalyzer] Handled error:", err.message);
        throw new Error(err.message || "An unexpected error occurred while communicating with Gemini.");
      }
    }
  };
}