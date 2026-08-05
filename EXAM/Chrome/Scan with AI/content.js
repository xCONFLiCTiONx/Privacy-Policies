// content.js

(function () {
  if (document.getElementById('scan-with-ai-overlay')) return;

  let conversationHistory = [];

  // Custom Markdown Parser
  function parseMarkdown(text) {
    if (!text) return "";

    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^#### (.*$)/gim, '<h4 style="color: #8ab4f8; margin-top: 14px; margin-bottom: 6px; font-size: 15px; font-weight: 600;">$1</h4>')
      .replace(/^### (.*$)/gim, '<h3 style="color: #8ab4f8; margin-top: 16px; margin-bottom: 8px; font-size: 16px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color: #8ab4f8; margin-top: 20px; margin-bottom: 10px; font-size: 18px;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color: #ffffff; margin-top: 22px; margin-bottom: 12px; font-size: 20px;">$1</h1>')
      .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid #333333; margin: 16px 0;">')
      .replace(/^\*\*\*$/gim, '<hr style="border: none; border-top: 1px solid #333333; margin: 16px 0;">')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff;">$1</strong>')
      .replace(/__(.*?)__/g, '<strong style="color: #ffffff;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: #2d2d2d; padding: 2px 5px; border-radius: 4px; font-family: monospace; color: #f28b82;">$1</code>')
      .replace(/^\s*[\*\-]\s+(.*$)/gim, '<li style="margin-bottom: 6px; margin-left: 18px;">$1</li>');

    html = html.replace(/(<li style="margin-bottom: 6px; margin-left: 18px;">.*<\/li>\s*)+/g, '<ul style="padding-left: 0; margin: 8px 0;">$&</ul>');

    html = html.split(/\n\n+/).map(p => {
      if (p.startsWith('<h') || p.startsWith('<hr') || p.startsWith('<ul')) {
        return p;
      }
      return `<p style="margin: 8px 0; line-height: 1.6;">${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return html;
  }

  // Inject hidden scrollbar style for content and input box
  if (!document.getElementById('scan-ai-modal-scrollbar-style')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'scan-ai-modal-scrollbar-style';
    styleEl.textContent = `
      #modal-body-content::-webkit-scrollbar,
      #modal-reply-input::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 1. Create dark overlay background
  const overlay = document.createElement('div');
  overlay.id = 'scan-with-ai-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(12, 12, 12, 0.85); z-index: 999998;
    display: flex; justify-content: center; align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  // 2. Centered Modal Card
  const modal = document.createElement('div');
  modal.id = 'scan-with-ai-modal';
  modal.style.cssText = `
    width: 650px; max-width: 90vw; height: 550px; max-height: 85vh;
    background: #1e1e1e; color: #e0e0e0; border: 1px solid #333333;
    box-shadow: 0 16px 48px rgba(0,0,0,0.8); border-radius: 12px;
    z-index: 999999; display: flex; flex-direction: column; overflow: hidden;
  `;

  modal.innerHTML = `
    <div style="padding: 16px 20px; background: #252526; border-bottom: 1px solid #333333; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-weight: 600; font-size: 15px; color: #ffffff; letter-spacing: 0.3px;">Scan with AI</span>
      <button id="close-modal-btn" title="Close" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9aa0a6; padding: 0; line-height: 1;">&times;</button>
    </div>
    
    <!-- Main Content View -->
    <div id="modal-main-view" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
      <div id="modal-body-content" style="padding: 24px; flex: 1; overflow-y: auto; font-size: 14px; line-height: 1.6; background: #1e1e1e; scrollbar-width: none; -ms-overflow-style: none;">
        <p style="font-size: 13px; color: #9aa0a6; margin: 0 0 16px 0;">Scan page content and analyze details using Gemini.</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="modal-scan-btn" style="width: 100%; padding: 12px; border: none; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; background-color: #8ab4f8; color: #202124;">Scan Page</button>
          <button id="modal-options-btn" style="width: 100%; padding: 12px; border: 1px solid #8ab4f8; border-radius: 6px; font-weight: 600; font-size: 14px; cursor: pointer; background-color: transparent; color: #8ab4f8;">Extension Options</button>
        </div>
      </div>

      <!-- Pinned reply area -->
      <div id="modal-reply-container" style="display: none; padding: 12px 20px; background: #252526; border-top: 1px solid #333333; gap: 10px; align-items: flex-end;">
        <textarea id="modal-reply-input" rows="1" placeholder="Ask Gemini a follow-up question..." style="flex: 1; padding: 10px 14px; background: #1e1e1e; border: 1px solid #333333; border-radius: 6px; color: #ffffff; font-size: 13px; outline: none; resize: none; overflow-y: auto; line-height: 1.4; max-height: calc(1.4em * 3 + 20px); box-sizing: border-box; scrollbar-width: none; -ms-overflow-style: none;"></textarea>
        <button id="modal-reply-btn" style="padding: 10px 18px; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; background-color: #8ab4f8; color: #202124; white-space: nowrap; height: 38px;">Send</button>
      </div>
    </div>

    <!-- Settings View (Hidden by default) -->
    <div id="modal-settings-view" style="display: none; flex-direction: column; flex: 1; padding: 24px; background: #1e1e1e; overflow-y: auto;">
      <h3 style="margin-top: 0; color: #ffffff; font-size: 16px; font-weight: 600;">Extension Settings</h3>
      <p style="font-size: 13px; color: #9aa0a6; margin-bottom: 20px;">Enter your Gemini API key below. Changes are saved automatically across your browser sync.</p>
      
      <label style="display: block; font-size: 12px; font-weight: 600; color: #8ab4f8; text-transform: uppercase; margin-bottom: 8px;">Gemini API Key</label>
      <input id="api-key-input" type="password" placeholder="Paste your API key here..." style="width: 100%; padding: 10px 14px; background: #252526; border: 1px solid #333333; border-radius: 6px; color: #ffffff; font-size: 13px; outline: none; margin-bottom: 16px; box-sizing: border-box;" />
      
      <div style="display: flex; gap: 10px;">
        <button id="save-settings-btn" style="padding: 10px 20px; border: none; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; background-color: #8ab4f8; color: #202124;">Save API Key</button>
        <button id="back-to-main-btn" style="padding: 10px 20px; border: 1px solid #333333; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; background-color: transparent; color: #e0e0e0;">Back to Home</button>
      </div>
      
      <div id="settings-status-msg" style="margin-top: 14px; font-size: 13px;"></div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();
  document.getElementById('close-modal-btn').onclick = closeModal;
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  // View Navigation
  const mainView = document.getElementById('modal-main-view');
  const settingsView = document.getElementById('modal-settings-view');
  const apiKeyInput = document.getElementById('api-key-input');
  const settingsStatusMsg = document.getElementById('settings-status-msg');

  const showSettings = () => {
    mainView.style.display = "none";
    settingsView.style.display = "flex";
    settingsStatusMsg.textContent = "";

    // Load existing key safely with fallback checks if chrome.storage is missing context
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (res) => {
        const existingKey = res?.gemini_api_key || res?.geminiApiKey || res?.apiKey || "";
        if (existingKey) {
          apiKeyInput.value = existingKey;
        } else {
          chrome.storage.local.get(['gemini_api_key', 'geminiApiKey', 'apiKey'], (localRes) => {
            apiKeyInput.value = localRes?.gemini_api_key || localRes?.geminiApiKey || localRes?.apiKey || "";
          });
        }
      });
    }
  };

  const showMain = () => {
    settingsView.style.display = "none";
    mainView.style.display = "flex";
  };

  document.getElementById('modal-options-btn').onclick = showSettings;
  document.getElementById('back-to-main-btn').onclick = showMain;

  // Save Settings Logic
  document.getElementById('save-settings-btn').onclick = () => {
    const keyVal = apiKeyInput.value.trim();
    if (!keyVal) {
      settingsStatusMsg.style.color = "#f28b82";
      settingsStatusMsg.textContent = "Please enter a valid API key.";
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ gemini_api_key: keyVal, geminiApiKey: keyVal }, () => {
        chrome.storage.local.set({ gemini_api_key: keyVal, geminiApiKey: keyVal }, () => {
          settingsStatusMsg.style.color = "#81c995";
          settingsStatusMsg.textContent = "API key saved successfully!";
          setTimeout(() => { showMain(); }, 800);
        });
      });
    }
  };

  const bodyContent = document.getElementById('modal-body-content');
  const replyContainer = document.getElementById('modal-reply-container');
  const replyInput = document.getElementById('modal-reply-input');
  const replyBtn = document.getElementById('modal-reply-btn');

  // Auto-expand textarea up to 3 lines and keep cursor scrolled into view
  replyInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    this.scrollTop = this.scrollHeight;
  });

  function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.style.marginBottom = "16px";

    if (role === 'user') {
      msgDiv.innerHTML = `
        <div style="font-weight: 600; color: #8ab4f8; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">You</div>
        <div style="background: #2a2d32; padding: 10px 14px; border-radius: 8px; border-left: 3px solid #8ab4f8; color: #ffffff;">${text}</div>
      `;
    } else if (role === 'assistant') {
      msgDiv.innerHTML = `
        <div style="font-weight: 600; color: #e0e0e0; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Gemini</div>
        <div>${parseMarkdown(text)}</div>
      `;
    } else if (role === 'system-status') {
      msgDiv.id = "status-indicator";
      msgDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; color: #8ab4f8; font-size: 13px; font-weight: 500;">
          <span>${text}</span>
        </div>
      `;
    }

    bodyContent.appendChild(msgDiv);

    // Scroll directly to the top of Gemini's response when it finishes generating
    if (role === 'assistant') {
      msgDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return msgDiv;
  }

  // Handle Initial Scan
  document.getElementById('modal-scan-btn').onclick = async () => {
    bodyContent.innerHTML = "";
    replyContainer.style.display = "flex";
    appendMessage('system-status', 'Fetching page data and analyzing...');

    try {
      const mainContainer = document.querySelector('div[role="main"]') || document.body;
      const pageText = mainContainer ? mainContainer.innerText : "";

      let analysisResult = await GeminiAnalyzer.analyze({ rawEmail: pageText, fullPageText: pageText });
      
      analysisResult = analysisResult.replace(/^Based on a thorough (review|analysis) of the raw email headers, payload, and authentication mechanisms[^.\n]*\.?\s*/i, "").trim();

      const statusEl = document.getElementById('status-indicator');
      if (statusEl) statusEl.remove();

      conversationHistory = [
        { role: 'User', text: `Here is the page text for analysis:\n\n${pageText}` },
        { role: 'Gemini', text: analysisResult }
      ];

      appendMessage('assistant', analysisResult);
    } catch (err) {
      console.error("[Modal Error]:", err);
      const statusEl = document.getElementById('status-indicator');
      if (statusEl) statusEl.remove();

      bodyContent.innerHTML = `
        <div style="color: #f28b82; font-weight: bold;">Error executing analysis:</div>
        <pre style="color: #f28b82; white-space: pre-wrap; margin-top: 8px; font-size: 13px;">${err.stack || err.message || err}</pre>
      `;
    }
  };

  // Handle User Follow-Up Reply
  const handleUserReply = async () => {
    const userQuery = replyInput.value.trim();
    if (!userQuery) return;

    replyInput.value = "";
    replyInput.style.height = 'auto'; // Reset height back to 1 line after sending

    const userMsgEl = appendMessage('user', userQuery);
    
    // Immediately scroll the user's new reply to the top of the container
    userMsgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    appendMessage('system-status', 'Gemini is thinking...');

    conversationHistory.push({ role: 'User', text: userQuery });
    const fullContextPrompt = conversationHistory.map(m => `${m.role}: ${m.text}`).join('\n\n');

    try {
      let replyResult = await GeminiAnalyzer.analyze({ rawEmail: fullContextPrompt, fullPageText: fullContextPrompt });

      replyResult = replyResult.replace(/^Based on a thorough (review|analysis) of the raw email headers, payload, and authentication mechanisms[^.\n]*\.?\s*/i, "").trim();

      const statusEl = document.getElementById('status-indicator');
      if (statusEl) statusEl.remove();

      conversationHistory.push({ role: 'Gemini', text: replyResult });
      appendMessage('assistant', replyResult);
    } catch (err) {
      console.error("[Reply Error]:", err);
      const statusEl = document.getElementById('status-indicator');
      if (statusEl) statusEl.remove();

      appendMessage('assistant', `**Error sending message:** ${err.message || err}`);
    }
  };

  replyBtn.onclick = handleUserReply;
  replyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserReply();
    }
  });
})();