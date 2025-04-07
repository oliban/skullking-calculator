# Development Workflow

This document outlines the agreed-upon collaborative workflow for developing the Skull King Score Calculator.

## Workflow Steps

1.  **USER**: Requests changes or new features.
2.  **AI**: Suggests a strategy or plan to implement the changes.
3.  **USER**: Reviews and accepts the proposed strategy.
4.  **AI**: Writes unit tests (`script.test.js`) covering the requirements of the change, especially if it involves scoring logic.
5.  **USER**: Reviews and accepts the unit tests.
6.  **AI**: Implements the required code changes (e.g., in `script.js`, `index.html`, `style.css`).
7.  **AI**: Runs the unit tests using `npm test` and confirms they pass.
8.  **USER**: Manually tests the application in the browser to verify the changes work as expected.
9.  **AI**: Suggests a **short, concise** Git commit message summarizing the changes made.
10. **USER**: Handles Git staging, committing, and pushing.
11. **AI**: Posts a celebratory message! 🥳🎉

This workflow ensures clear communication, incorporates testing early, and allows for verification at multiple stages. 