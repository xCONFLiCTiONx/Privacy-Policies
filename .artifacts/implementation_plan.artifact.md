# Implementation Plan - Additional Privacy Policy Updates

After a second thorough pass of the `EXAM` directory, I've identified one missing policy and two existing ones that need refinements to accurately reflect current functionality.

## Proposed Changes

### [New Privacy Policy]

#### [NEW] [weather-watcher.md](file:///F:/Repositories/Privacy-Policies/weather-watcher.md)
*   **Purpose:** Covers the "Weather Watcher" Android app.
*   **Key points:**
    *   **Location Data:** Explicitly mentions the use of `ACCESS_FINE_LOCATION` and `ACCESS_BACKGROUND_LOCATION` to provide weather for the user's current area.
    *   **Third-Party APIs:** Discloses that location coordinates are sent to external services (National Weather Service, ArcGIS, and Open-Meteo) to fetch meteorological data.
    *   **Notifications:** Mentions the use of background location for weather alerts.

---

### [Updated Privacy Policies]

#### [MODIFY] [bookmarks.md](file:///F:/Repositories/Privacy-Policies/bookmarks.md)
*   **Update:** Add a section on **Recently Viewed** items.
*   **Detail:** Mention that the extension accesses your browser history (`history` permission) to display recently visited sites locally.
*   **External Requests:** Disclose that website domains are sent to Google's Favicon service (`www.google.com/s2/favicons`) to display icons in the dashboard.

#### [MODIFY] [pip.md](file:///F:/Repositories/Privacy-Policies/pip.md)
*   **Update:** Rename/Refine to cover "Universal Auto PiP".
*   **Detail:** Clarify that the extension can automatically detect media elements to enable Picture-in-Picture mode.

---

### [Repository Overview]

#### [MODIFY] [README.md](file:///F:/Repositories/Privacy-Policies/README.md)
*   Add **Weather Watcher** to the list.

## Verification Plan

### Manual Verification
*   Verify that `weather-watcher.md` mentions the specific APIs found in the code (`Open-Meteo`, `NWS`).
*   Ensure the `bookmarks.md` update correctly identifies the favicon service usage.
