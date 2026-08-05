if (typeof GeminiAnalyzer === 'undefined') {
  var GeminiAnalyzer = {
    async analyze(aggregatedData) {
      return new Promise((resolve) => {
        chrome.storage.local.get(['geminiApiKey'], async (result) => {
          const apiKey = result.geminiApiKey;
          if (!apiKey) {
            resolve("Error: Gemini API Key is missing. Please click the Options button in the extension popup to set it.");
            return;
          }

          try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Analyze this email for security threats, phishing, and spoofing. Look directly at the raw email headers and payload retrieved from the Gmail API provided below to verify authentication (SPF, DKIM, DMARC) yourself rather than relying solely on pre-calculated scores:\n\n${JSON.stringify(aggregatedData, null, 2)}`
                  }]
                }]
              })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
              resolve(data.candidates[0].content.parts[0].text);
            } else if (data.error) {
              resolve("Error from Gemini API: " + data.error.message);
            } else {
              resolve("Error: Received unexpected response structure from Gemini API: " + JSON.stringify(data));
            }
          } catch (err) {
            resolve("Error connecting to Gemini API: " + err.message);
          }
        });
      });
    }
  };
}

if (typeof window !== "undefined") {
  window.GeminiAnalyzer = GeminiAnalyzer;
}