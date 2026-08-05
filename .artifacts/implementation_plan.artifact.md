# Implementation Plan - Generate Privacy Policies for Remaining Projects

The goal is to create privacy policies for all projects listed on the user's GitHub profile that are currently missing from the `Privacy-Policies` repository.

## Proposed Changes

### [New Privacy Policies]

I will create the following new Markdown files in the root directory:

#### [NEW] [portfolio.md](file:///F:/Repositories/Privacy-Policies/portfolio.md)
*   **Purpose:** Covers the dynamic portfolio template.
*   **Key points:** Mentions GitHub API usage for fetching profile/repo data, local processing, and no server-side storage of user data.

#### [NEW] [social-post-scheduler.md](file:///F:/Repositories/Privacy-Policies/social-post-scheduler.md)
*   **Purpose:** Covers the Facebook and Twitter scheduling tool.
*   **Key points:** Mentions OAuth authentication, handling of access tokens, and that data is only used to facilitate scheduled posting as requested by the user.

#### [NEW] [autolock.md](file:///F:/Repositories/Privacy-Policies/autolock.md)
*   **Purpose:** Covers the computer session time limit tool.
*   **Key points:** Focuses on local session management and the absence of data collection or transmission.

#### [NEW] [easylogger.md](file:///F:/Repositories/Privacy-Policies/easylogger.md)
*   **Purpose:** Covers the .NET logging library.
*   **Key points:** Clarifies that as a library, it writes logs to the location specified by the developer/user and does not transmit data externally.

#### [NEW] [stickypad.md](file:///F:/Repositories/Privacy-Policies/stickypad.md)
*   **Purpose:** Covers the Windows desktop notes app.
*   **Key points:** Notes that content is stored locally on the device and not synced or uploaded.

#### [NEW] [xmenutools.md](file:///F:/Repositories/Privacy-Policies/xmenutools.md)
*   **Purpose:** Covers the archived extended context menu tools.
*   **Key points:** Similar to XtendedMenu, focusing on local registry/system modifications without data harvesting.

---

### [Repository Overview]

#### [MODIFY] [README.md](file:///F:/Repositories/Privacy-Policies/README.md)
*   Update the "Available Policies" table to include the 6 new entries.

## Verification Plan

### Manual Verification
*   Verify that all new files follow the consistent formatting used in existing policies (e.g., `pip.md`, `bookmarks.md`).
*   Ensure the `README.md` links are correct and the descriptions match the GitHub project descriptions.
