# Smart Adaptive Dark Mode

An intelligent engine that automatically detects light-themed websites and converts them to a high-quality dark theme.

## 🚀 Overview

Experience the web in a whole new light—or rather, a whole new dark. **Smart Adaptive Dark Mode** uses an advanced injection engine to analyze page colors in real-time and apply an intelligent dark theme that preserves readability and protects your eyes.

## ✨ Key Features

- **Intelligent Detection**: Automatically identifies the current page brightness and only applies dark mode when necessary.
- **Dynamic Inversion**: Smartly converts backgrounds, text, links, and borders without breaking the site layout.
- **Mutation Observer**: Monitors dynamic pages and Single Page Apps (SPAs) to apply themes to new content instantly.
- **Shadow DOM Support**: Recursively scans and themes elements inside Shadow Roots.
- **CSS Variable Overrides**: Injects global `:root` variables to force dark surfaces across modern web frameworks.
- **Media Protection**: Ensures images, videos, and canvases are not inverted or filtered, preserving original colors.
- **Site Whitelisting**: Save specific sites where you prefer the original theme.

## 🛠️ Installation

1. Download the extension folder.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the folder.

## 📖 How it Works

1. **Analysis**: The extension calculates the brightness of the document body.
2. **Injection**: If the site is light, it injects a comprehensive base style and overrides CSS variables.
3. **Refinement**: A mutation observer handles late-loading content, while periodic scans handle iframes and Shadow DOM elements.
4. **Consistency**: Re-applies protection every few seconds to prevent sites from overwriting the dark theme.

---
*A smarter way to browse in the dark.*
