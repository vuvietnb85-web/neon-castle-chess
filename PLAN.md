# Neon Castle Chess — Build Plan

## Product direction
A full-screen dark chess super-app with a 2/3 desktop game area and a 1/3 camera companion panel. The visual language is Graphite / Ivory / Amber: premium, quiet, tactile, and iPhone-inspired rather than skeuomorphic.

## Risk slices
1. **Board interaction:** tap-to-select, legal movement geometry for pawns, knights, bishops, rooks, queens, and kings; selected squares and targets must be visible.
2. **Engine response:** deterministic Deep Glass reply after a user move with a visible thinking state and move list.
3. **Camera permissions:** front/rear option, start/stop, flip, local-only messaging, and graceful unsupported/denied state.
4. **Responsive composition:** desktop split ratio, tablet stack, and narrow mobile board without horizontal overflow.
5. **Visual fidelity:** generated ambient image and avatar used from WebDev storage; no external user data required.

## Verification criteria
- Clicking a white piece reveals legal target markers.
- Clicking a legal target moves the piece and triggers an engine reply.
- Reset, draw, resign, tab switch, mute, camera, and camera flip buttons produce visible state changes.
- Camera denial does not throw a runtime error.
- `pnpm check` and production build pass.
- Preview screenshot at 1280×720 shows the board, player clocks, camera panel, tabs, and premium dark visual system.
- Preview screenshot at 390×844 has a usable board and stacked companion panel.
