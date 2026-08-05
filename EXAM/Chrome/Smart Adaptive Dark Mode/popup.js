// ======================================
// Auto Dark Theme
// popup.js
// ======================================

const enabled = document.getElementById("enabled");
const autoDetect = document.getElementById("autoDetect");
const threshold = document.getElementById("threshold");
const thresholdValue = document.getElementById("thresholdValue");
const toggleSite = document.getElementById("toggleSite");
const refresh = document.getElementById("refresh");
const status = document.getElementById("status");

// --------------------------------------
// Load settings
// --------------------------------------

function loadSettings() {

    chrome.runtime.sendMessage(
        {
            action: "getSettings"
        },
        settings => {

            enabled.checked = settings.enabled;
            autoDetect.checked = settings.autoDetect;

            threshold.value = settings.brightnessThreshold;
            thresholdValue.textContent =
                settings.brightnessThreshold;

            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                tabs => {

                    const host =
                        new URL(tabs[0].url).hostname;

                    const disabled =
                        settings.whitelist.includes(host);

                    toggleSite.textContent = disabled
                        ? "Enable on this Site"
                        : "Disable on this Site";

                });

        });

}

loadSettings();

// --------------------------------------
// Save Settings
// --------------------------------------

function saveSettings() {

    chrome.runtime.sendMessage({

        action: "saveSettings",

        settings: {

            enabled: enabled.checked,

            autoDetect: autoDetect.checked,

            brightnessThreshold:
                Number(threshold.value)

        }

    });

}

// --------------------------------------
// Toggle Handlers
// --------------------------------------

enabled.addEventListener("change", () => {

    saveSettings();

    status.textContent =
        enabled.checked
            ? "Extension Enabled"
            : "Extension Disabled";

});

autoDetect.addEventListener("change", () => {

    saveSettings();

    status.textContent =
        autoDetect.checked
            ? "Auto Detect Enabled"
            : "Auto Detect Disabled";

});

// --------------------------------------
// Slider
// --------------------------------------

threshold.addEventListener("input", () => {

    thresholdValue.textContent =
        threshold.value;

});

threshold.addEventListener("change", () => {

    saveSettings();

    status.textContent =
        "Brightness Threshold Saved";

});

// --------------------------------------
// Toggle Current Site
// --------------------------------------

toggleSite.addEventListener("click", () => {

    chrome.tabs.query(
        {
            active: true,
            currentWindow: true
        },
        tabs => {

            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "toggleSite"
                },
                () => {

                    loadSettings();

                    status.textContent =
                        "Site Updated";

                });

        });

});

// --------------------------------------
// Reapply Theme
// --------------------------------------

refresh.addEventListener("click", () => {

    chrome.tabs.query(
        {
            active: true,
            currentWindow: true
        },
        tabs => {

            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "forceRefresh"
                });

        });

    status.textContent =
        "Reapplying Theme...";

});
