# Structure

- `client/src/App.tsx` — dark theme provider and route shell.
- `client/src/pages/Home.tsx` — the complete chess/camera surface. Chess state is kept as plain React state for the frontend-only prototype.
- `client/src/index.css` — design tokens, board geometry, responsive layout, motion, and camera presentation.
- `client/index.html` — Vietnamese document metadata and display fonts.
- `/manus-storage/camera-ambient_5e1ac6fb.png` — generated low-light camera companion texture.
- `/manus-storage/player-avatar_2671cb50.png` — generated player avatar.

## State model
`ThemeBoard` is an 8×8 matrix of `Piece | null`. `getLegalMoves` handles piece geometry and blockers. `chooseEngineMove` picks a deterministic high-value black move. `MediaStream` lives in a ref and is stopped on unmount or camera toggle.

## Intentional product boundary
This is a client-only playable prototype: no account system, multiplayer transport, or server-side persistence is included. Camera access remains local to the browser session.
