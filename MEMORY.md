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


## Capture celebration
- Official brand context was checked against the [Quanta Computer Taiwan website](https://www.quantatw.com/quanta/english/default.aspx). The UI uses a decorative QUANTA / TAIWAN wordmark rather than copying a protected logo asset.
- A blue Taiwan-inspired capture celebration now triggers only when a move captures a piece. It includes a centered orbital splash, material-shift caption, and three low-opacity full-screen marquee layers using the requested Vietnamese phrase.
- `?capture-demo` makes the celebration render on initial load for visual QA.


## Marquee gold upgrade
- The requested marquee phrase now renders at double size in portrait and desktop contexts, with a precious-metal gradient, animated brightness pulse, gold bloom, and retained Taiwan-blue edge glow for contrast.


## Soundscape
- Added an opt-in Web Audio API soundscape with no external audio assets. The sound toggle is visible in the top bar and changes to a glowing gold state when enabled.
- Captures play a layered low impact plus ascending triangle chime. Each marquee animation iteration plays a short high-frequency Taiwan-blue tick, and enabling sound provides an immediate confirmation cue.
- Audio remains off by default to respect browser autoplay policies and user preference; the first cue is unlocked through the sound button gesture.
