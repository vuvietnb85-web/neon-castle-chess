# Memory

- Initialized as `web-static`; frontend-only is sufficient for the requested experience.
- Do not touch `server/`; no backend or external API is needed.
- Generated assets were uploaded before wiring the UI so the app references `/manus-storage/...` paths instead of committing large binaries.
- The board starts in a recognisable open-center snapshot rather than a blank initial position to make the screen immediately feel like an active match.
- Camera permission is intentionally opt-in. If permission is rejected, the UI remains in a polished standby state and explains the next action.
- `?demo` is supported as a deterministic visual-verification flag; it briefly shows the demo state without changing the initial board layout.


## Portrait redesign
- The primary interaction surface is now a fullscreen portrait composition tuned for 9:16.
- Desktop-style companion tabs/panel are hidden in portrait so the chess board remains the focus.
- The camera card becomes a circular floating bubble positioned via percentage coordinates. It is draggable with Pointer Events and constrained inside the viewport.
- The bubble keeps a compact camera toggle, front/rear switch, and local-only camera behavior so the feature remains accessible after the desktop controls are collapsed.
