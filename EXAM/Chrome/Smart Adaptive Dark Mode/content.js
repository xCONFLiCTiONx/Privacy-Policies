// ============================================
// Auto Dark Theme
// content.js
// Part 1 - Core Setup + Settings + Detection
// ============================================

(() => {

"use strict";

console.log("Auto Dark Theme loaded");


// ============================================
// State
// ============================================

let enabled = true;
let autoDetect = true;
let brightnessThreshold = 180;

let darkModeApplied = false;

let processedElements = new WeakSet();

let observer = null;


// ============================================
// Configuration
// ============================================

const EXCLUDED_TAGS = new Set([
    "IMG",
    "VIDEO",
    "CANVAS",
    "SVG",
    "PICTURE",
    "IFRAME"
]);


const DARK_COLORS = {

    background: "#121212",

    surface: "#1e1e1e",

    surface2: "#252525",

    text: "#e8e8e8",

    secondaryText: "#bdbdbd",

    border: "#444444",

    link: "#8ab4f8"

};


// ============================================
// Load Settings
// ============================================

chrome.storage.sync.get(
    {
        enabled: true,
        autoDetect: true,
        brightnessThreshold: 180,
        whitelist: []
    },

    settings => {

        enabled = settings.enabled;

        autoDetect = settings.autoDetect;

        brightnessThreshold =
            settings.brightnessThreshold;


        const hostname =
            window.location.hostname;


        if (settings.whitelist.includes(hostname)) {

            enabled = false;

        }


        if (enabled) {

            initializeDarkMode();

        }

    }
);


// ============================================
// Message Listener
// ============================================

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {


        if (request.action === "toggleDarkMode") {

            toggleDarkMode();

        }


        if (request.action === "forceRefresh") {

            removeDarkMode();

            initializeDarkMode();

        }


        if (request.action === "settingsChanged") {

            chrome.storage.sync.get(
                null,
                settings => {

                    enabled =
                        settings.enabled;

                    autoDetect =
                        settings.autoDetect;

                    brightnessThreshold =
                        settings.brightnessThreshold;


                    initializeDarkMode();

                });

        }


        if (request.action === "toggleSite") {

            const host =
                window.location.hostname;


            chrome.runtime.sendMessage({

                action:"toggleSite"

            });


        }


    }
);


// ============================================
// Initialize
// ============================================

function initializeDarkMode() {


    if (!enabled)
        return;


    if (autoDetect) {


        if (isAlreadyDark()) {

            console.log(
                "Dark theme detected. Skipping."
            );

            return;

        }

    }


    applyDarkMode();


}


// ============================================
// Detect Existing Dark Theme
// ============================================

function isAlreadyDark() {


    const samples = [];


    const elements = [

        document.documentElement,

        document.body

    ];


    elements.forEach(el => {


        if (!el)
            return;


        const style =
            getComputedStyle(el);


        samples.push(

            getBrightness(
                style.backgroundColor
            )

        );


    });


    const valid =
        samples.filter(
            x => x !== null
        );


    if (!valid.length)
        return false;


    const average =
        valid.reduce(
            (a,b)=>a+b,
            0
        ) / valid.length;


    console.log(
        "Detected brightness:",
        average
    );


    return average < brightnessThreshold;

}


// ============================================
// Color Brightness Calculator
// ============================================

function getBrightness(color) {


    if (!color)
        return null;


    const rgb =
        color.match(/\d+/g);


    if (!rgb || rgb.length < 3)
        return null;


    const r =
        Number(rgb[0]);

    const g =
        Number(rgb[1]);

    const b =
        Number(rgb[2]);


    return (
        (r * 299) +
        (g * 587) +
        (b * 114)
    ) / 1000;


}

// ============================================
// Part 2 - CSS Injection Engine
// ============================================


// ============================================
// Apply Dark Mode
// ============================================

function applyDarkMode() {


    if (darkModeApplied)
        return;


    darkModeApplied = true;


    injectBaseStyles();


    processExistingElements();


    startObserver();


    console.log(
        "Auto Dark Theme applied"
    );

}



// ============================================
// Inject Global Dark CSS
// ============================================

function injectBaseStyles() {


    if (document.getElementById(
        "auto-dark-theme-style"
    ))
        return;


    const style =
        document.createElement("style");


    style.id =
        "auto-dark-theme-style";


    style.textContent = `

/* ===================================
   Auto Dark Theme Overrides
=================================== */


html,
body {

    background:
        #121212 !important;

    color:
        #e8e8e8 !important;

}


/* Main containers */

div,
section,
main,
article,
aside,
header,
footer,
nav {

    background-color:
        transparent;

}


/* Text */

p,
span,
label,
li,
td,
th,
h1,
h2,
h3,
h4,
h5,
h6 {

    color:
        #e8e8e8;

}


/* Links */

a {

    color:
        #8ab4f8 !important;

}


/* Inputs */

input,
textarea,
select,
button {

    background-color:
        #252525 !important;

    color:
        #e8e8e8 !important;

    border-color:
        #444 !important;

}


/* Cards / surfaces */

[role="dialog"],
[role="menu"],
[role="listbox"],
[role="tooltip"] {

    background:
        #1e1e1e !important;

    color:
        #e8e8e8 !important;

    border-color:
        #444 !important;

}


/* Scrollbars */

::-webkit-scrollbar {

    width:
        12px;

    height:
        12px;

}


::-webkit-scrollbar-track {

    background:
        #121212;

}


::-webkit-scrollbar-thumb {

    background:
        #444;

    border-radius:
        8px;

}


`;

    document.documentElement
        .appendChild(style);


}



// ============================================
// Remove Dark Mode
// ============================================

function removeDarkMode() {


    darkModeApplied = false;


    const style =
        document.getElementById(
            "auto-dark-theme-style"
        );


    if (style) {

        style.remove();

    }


    processedElements =
        new WeakSet();


    if (observer) {

        observer.disconnect();

        observer = null;

    }


    console.log(
        "Auto Dark Theme removed"
    );

}



// ============================================
// Toggle
// ============================================

function toggleDarkMode() {


    if (darkModeApplied) {


        removeDarkMode();


    } else {


        applyDarkMode();


    }

}



// ============================================
// Process Current Page
// ============================================

function processExistingElements() {


    const elements =
        document.querySelectorAll(
            "*"
        );


    elements.forEach(
        processElement
    );


}



// ============================================
// Element Processor
// ============================================

function processElement(element) {


    if (!element)
        return;


    if (processedElements.has(element))
        return;


    processedElements.add(element);


    const tag =
        element.tagName;


    if (EXCLUDED_TAGS.has(tag))
        return;


    convertElementColors(
        element
    );


}



// ============================================
// Convert Individual Elements
// ============================================

function convertElementColors(element) {


    const style =
        getComputedStyle(element);


    const background =
        style.backgroundColor;


    const color =
        style.color;


    const border =
        style.borderColor;



    if (isLightColor(background)) {


        element.style
            .setProperty(
                "background-color",
                DARK_COLORS.surface,
                "important"
            );

    }



    if (isDarkText(color)) {


        element.style
            .setProperty(
                "color",
                DARK_COLORS.text,
                "important"
            );

    }



    if (isLightColor(border)) {


        element.style
            .setProperty(
                "border-color",
                DARK_COLORS.border,
                "important"
            );

    }


}



// ============================================
// Color Tests
// ============================================

function isLightColor(color) {


    const brightness =
        getBrightness(color);


    if (brightness === null)
        return false;


    return brightness > 180;


}



function isDarkText(color) {


    const brightness =
        getBrightness(color);


    if (brightness === null)
        return false;


    return brightness < 80;


}
// ============================================
// Part 3 - Dynamic Pages + Mutation Observer
// ============================================


// ============================================
// Start DOM Observer
// ============================================

function startObserver() {


    if (observer)
        return;


    observer =
        new MutationObserver(
            mutations => {


                for (const mutation of mutations) {


                    // New elements added
                    if (mutation.addedNodes.length) {


                        mutation.addedNodes.forEach(
                            node => {


                                if (
                                    node.nodeType === Node.ELEMENT_NODE
                                ) {


                                    processElement(node);


                                    // Process children
                                    const children =
                                        node.querySelectorAll
                                            ? node.querySelectorAll("*")
                                            : [];


                                    children.forEach(
                                        processElement
                                    );


                                }


                            }
                        );


                    }


                    // Attribute changes
                    if (
                        mutation.type === "attributes"
                    ) {


                        processElement(
                            mutation.target
                        );


                    }


                }


            }
        );



    observer.observe(
        document.documentElement,
        {

            childList: true,

            subtree: true,

            attributes: true,

            attributeFilter: [
                "style",
                "class"
            ]

        }
    );


    console.log(
        "Auto Dark observer running"
    );


}



// ============================================
// Handle Single Page Apps
// ============================================

let lastURL =
    location.href;



setInterval(() => {


    if (location.href !== lastURL) {


        lastURL =
            location.href;


        console.log(
            "Page changed:",
            location.href
        );


        setTimeout(() => {


            processExistingElements();


        }, 500);


    }


}, 1000);



// ============================================
// Shadow DOM Support
// ============================================

function scanShadowRoots(root=document) {


    const elements =
        root.querySelectorAll("*");


    elements.forEach(el => {


        if (el.shadowRoot) {


            processExistingElementsInRoot(
                el.shadowRoot
            );


            scanShadowRoots(
                el.shadowRoot
            );


        }


    });


}



function processExistingElementsInRoot(root) {


    const elements =
        root.querySelectorAll("*");


    elements.forEach(
        processElement
    );


}



// ============================================
// Periodic Shadow DOM Scan
// ============================================

setInterval(() => {


    if (darkModeApplied) {


        scanShadowRoots();


    }


}, 3000);



// ============================================
// Iframe Support
// ============================================

function processFrames() {


    const frames =
        document.querySelectorAll(
            "iframe"
        );


    frames.forEach(frame => {


        try {


            if (
                frame.contentDocument
            ) {


                processExistingElementsInRoot(
                    frame.contentDocument
                );


            }


        }
        catch(e) {


            // Cross-origin iframe
            // cannot be accessed

        }


    });


}



setInterval(() => {


    if (darkModeApplied) {


        processFrames();


    }


}, 3000);



// ============================================
// Re-apply Protection
// Some sites overwrite styles
// ============================================

setInterval(() => {


    if (!darkModeApplied)
        return;



    const importantElements =
        document.querySelectorAll(
            "body, main, [role='main'], [role='dialog']"
        );



    importantElements.forEach(el => {


        if (
            isLightColor(
                getComputedStyle(el)
                    .backgroundColor
            )
        ) {


            el.style.setProperty(
                "background-color",
                DARK_COLORS.surface,
                "important"
            );


        }


    });



}, 5000);



// ============================================
// Initial delayed passes
// ============================================

setTimeout(() => {


    if (darkModeApplied) {


        processExistingElements();

        scanShadowRoots();

        processFrames();


    }


}, 1500);



setTimeout(() => {


    if (darkModeApplied) {


        processExistingElements();

        scanShadowRoots();

        processFrames();


    }


}, 5000);// ============================================
// Part 4 - Smart Color Engine
// ============================================


// ============================================
// CSS Variable Override
// ============================================

function overrideCSSVariables() {


    const style =
        document.createElement("style");


    style.id =
        "auto-dark-variable-style";


    style.textContent = `

:root {

    --background:
        #121212 !important;

    --background-color:
        #121212 !important;

    --surface:
        #1e1e1e !important;

    --surface-color:
        #1e1e1e !important;

    --card:
        #1e1e1e !important;

    --foreground:
        #e8e8e8 !important;

    --text:
        #e8e8e8 !important;

    --text-primary:
        #e8e8e8 !important;

    --text-secondary:
        #bdbdbd !important;

    --border:
        #444444 !important;

    --divider:
        #444444 !important;

}


`;


    document.documentElement
        .appendChild(style);


}



// ============================================
// Better Color Conversion
// ============================================

function convertColor(color) {


    if (!color)
        return color;


    const rgb =
        color.match(/\d+/g);



    if (!rgb || rgb.length < 3)
        return color;



    let r =
        Number(rgb[0]);

    let g =
        Number(rgb[1]);

    let b =
        Number(rgb[2]);



    const brightness =
        (
            (r * 299) +
            (g * 587) +
            (b * 114)
        ) / 1000;



    // Very bright backgrounds
    if (brightness > 240) {


        return DARK_COLORS.background;


    }



    // Medium backgrounds
    if (brightness > 200) {


        return DARK_COLORS.surface;


    }



    // Light borders
    if (
        brightness > 150 &&
        Math.abs(r-g) < 15 &&
        Math.abs(g-b) < 15
    ) {


        return DARK_COLORS.border;


    }



    // Pure black text
    if (
        brightness < 60
    ) {


        return DARK_COLORS.text;


    }



    return color;


}



// ============================================
// Apply Smart Colors
// ============================================

function smartConvertElement(element) {


    if (!element)
        return;


    if (
        EXCLUDED_TAGS.has(
            element.tagName
        )
    )
        return;



    const computed =
        getComputedStyle(element);



    const bg =
        computed.backgroundColor;


    const fg =
        computed.color;


    const border =
        computed.borderColor;



    const newBG =
        convertColor(bg);


    const newFG =
        convertColor(fg);


    const newBorder =
        convertColor(border);



    if (
        newBG !== bg
    ) {


        element.style.setProperty(
            "background-color",
            newBG,
            "important"
        );


    }



    if (
        newFG !== fg
    ) {


        element.style.setProperty(
            "color",
            newFG,
            "important"
        );


    }



    if (
        newBorder !== border
    ) {


        element.style.setProperty(
            "border-color",
            newBorder,
            "important"
        );


    }


}



// ============================================
// Replace Element Processor
// ============================================

const originalProcessElement =
    processElement;



processElement =
function(element) {


    originalProcessElement(element);


    smartConvertElement(element);


};



// ============================================
// Apply Variables When Enabled
// ============================================

const originalApplyDarkMode =
    applyDarkMode;



applyDarkMode =
function() {


    originalApplyDarkMode();


    overrideCSSVariables();


};



// ============================================
// Protect Media
// ============================================

function protectMedia() {


    const media =
        document.querySelectorAll(
            "img, video, canvas, svg"
        );


    media.forEach(el => {


        el.style.setProperty(
            "filter",
            "none",
            "important"
        );


        el.style.setProperty(
            "opacity",
            "1",
            "important"
        );


    });


}



setInterval(() => {


    if (darkModeApplied) {


        protectMedia();


    }


}, 3000);
// ============================================
// Part 5 - Final Fixes + Startup Cleanup
// ============================================


// ============================================
// Google / Material Design Fixes
// ============================================

function applyMaterialFixes() {


    const selectors = [

        // Google Material surfaces
        ".mdc-dialog",
        ".mdc-menu",
        ".mdc-list",
        ".mdc-card",

        // Angular Material
        ".mat-menu-panel",
        ".mat-dialog-container",
        ".mat-mdc-dialog-container",
        ".mat-mdc-menu-panel",

        // Google Voice / Google apps
        "[role='dialog']",
        "[role='menu']",
        "[role='listbox']",
        "[role='presentation']",

        // Common white containers
        ".surface",
        ".card",
        ".panel",
        ".popup"

    ];



    selectors.forEach(selector => {


        document
            .querySelectorAll(selector)
            .forEach(el => {


                el.style.setProperty(
                    "background-color",
                    DARK_COLORS.surface,
                    "important"
                );


                el.style.setProperty(
                    "color",
                    DARK_COLORS.text,
                    "important"
                );


                el.style.setProperty(
                    "border-color",
                    DARK_COLORS.border,
                    "important"
                );


            });


    });


}



// ============================================
// Remove Bright Inline Styles
// ============================================

function fixInlineStyles() {


    const elements =
        document.querySelectorAll(
            "[style]"
        );



    elements.forEach(el => {


        const style =
            el.getAttribute(
                "style"
            );


        if (!style)
            return;



        if (
            style.includes(
                "background"
            )
        ) {


            const bg =
                getComputedStyle(el)
                    .backgroundColor;



            if (
                isLightColor(bg)
            ) {


                el.style.setProperty(
                    "background-color",
                    DARK_COLORS.surface,
                    "important"
                );


            }


        }


    });


}



// ============================================
// Final Repair Loop
// ============================================

setInterval(() => {


    if (!darkModeApplied)
        return;



    applyMaterialFixes();


    fixInlineStyles();



}, 4000);



// ============================================
// Handle Page Loaded Late Content
// ============================================

window.addEventListener(
    "load",
    () => {


        if (!darkModeApplied)
            return;



        setTimeout(() => {


            processExistingElements();


            applyMaterialFixes();


            fixInlineStyles();


        }, 1000);


    }
);



// ============================================
// Visibility Change Recovery
// Some apps rebuild when hidden
// ============================================

document.addEventListener(
    "visibilitychange",
    () => {


        if (
            document.visibilityState ===
            "visible"
        ) {


            if (darkModeApplied) {


                setTimeout(() => {


                    processExistingElements();


                    applyMaterialFixes();


                }, 500);


            }


        }


    }
);



// ============================================
// Emergency CSS Reinstall
// ============================================

setInterval(() => {


    if (
        darkModeApplied &&
        !document.getElementById(
            "auto-dark-theme-style"
        )
    ) {


        injectBaseStyles();


    }


}, 5000);



// ============================================
// Finished
// ============================================

console.log(
    "Auto Dark Theme engine ready"
);

// ============================================
// Google Voice Specific Dark Mode
// ============================================

function applyGoogleVoiceFixes() {

    if (!location.hostname.includes("voice.google.com"))
        return;


    if (document.getElementById("google-voice-dark-fix"))
        return;


    const style = document.createElement("style");

    style.id = "google-voice-dark-fix";


    style.textContent = `

/* Main Google Voice surfaces */

body,
html,
body.voice,
gv-app,
gv-main,
.gv-app {

    background:#121212 !important;
    color:#e8e8e8 !important;

}


/* Left navigation */

nav,
[role="navigation"],
.gv-sidebar,
.gv-nav {

    background:#171717 !important;
    color:#eee !important;

}


/* Conversation list */

[role="main"],
.gv-content,
.gv-conversation-list,
.gv-thread-list {

    background:#121212 !important;

}



/* Message area */

.gv-thread,
.gv-message,
.gv-conversation {

    background:#121212 !important;
    color:#eee !important;

}


/* Cards / dialogs */

[role="dialog"],
[role="menu"],
[role="listbox"],
[role="presentation"] {

    background:#1e1e1e !important;
    color:#eee !important;

}



/* Inputs */

input,
textarea {

    background:#252525 !important;
    color:#eee !important;
    border-color:#555 !important;

}


/* Buttons */

button {

    color:#eee !important;

}


/* Remove white surfaces */

* {

    scrollbar-color:#555 #121212;

}


`;

    document.documentElement.appendChild(style);

}



// run it
applyGoogleVoiceFixes();

setInterval(() => {

    applyGoogleVoiceFixes();

}, 2000);

})();