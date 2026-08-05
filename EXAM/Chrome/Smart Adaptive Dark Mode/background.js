// =======================================
// Auto Dark Theme
// background.js
// =======================================

const DEFAULT_SETTINGS = {
    enabled: true,
    autoDetect: true,
    brightnessThreshold: 180,
    whitelist: []
};

// ---------------------------------------
// Initialize settings on install
// ---------------------------------------
chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.sync.get(null, (items) => {

        if (Object.keys(items).length === 0) {

            chrome.storage.sync.set(DEFAULT_SETTINGS);

            console.log("Auto Dark Theme initialized.");

        }

    });

});

// ---------------------------------------
// Message handler
// ---------------------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request.action) {

        case "getSettings":

            chrome.storage.sync.get(DEFAULT_SETTINGS, settings => {

                sendResponse(settings);

            });

            return true;

        case "saveSettings":

            chrome.storage.sync.set(request.settings, () => {

                sendResponse({
                    success: true
                });

            });

            return true;

        case "toggleSite":

            toggleCurrentSite(sender.tab.url, sendResponse);

            return true;

        default:

            sendResponse({
                success: false
            });

    }

});

// ---------------------------------------
// Toggle current site whitelist
// ---------------------------------------
function toggleCurrentSite(url, callback) {

    const hostname = new URL(url).hostname;

    chrome.storage.sync.get(DEFAULT_SETTINGS, settings => {

        let whitelist = settings.whitelist || [];

        const index = whitelist.indexOf(hostname);

        if (index >= 0) {

            whitelist.splice(index, 1);

        } else {

            whitelist.push(hostname);

        }

        settings.whitelist = whitelist;

        chrome.storage.sync.set(settings, () => {

            callback({
                success: true,
                whitelist
            });

        });

    });

}

// ---------------------------------------
// Toolbar click
// ---------------------------------------
chrome.action.onClicked.addListener((tab) => {

    chrome.tabs.sendMessage(tab.id, {

        action: "toggleDarkMode"

    });

});

// ---------------------------------------
// Storage change listener
// ---------------------------------------
chrome.storage.onChanged.addListener((changes, area) => {

    if (area !== "sync")
        return;

    chrome.tabs.query({}, tabs => {

        for (const tab of tabs) {

            chrome.tabs.sendMessage(tab.id, {

                action: "settingsChanged"

            }).catch(() => {});

        }

    });

});
