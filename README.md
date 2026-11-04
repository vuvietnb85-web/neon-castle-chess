# Neon Castle Chess — Dark Browser Chess Game vs AI with Camera Companion

**Neon Castle Chess is a full-screen, dark-themed web chess app where you play white against a minimax alpha-beta engine, with an optional live camera companion panel and opt-in sound effects.**

## Features

- Tap-to-select chess board with legal move targets for pawns, knights, bishops, rooks, queens and kings.
- Browser chess engine: minimax with alpha-beta pruning, capture ordering and material / center / pawn heuristics, with a visible "thinking" state and move list.
- Camera companion panel: front/rear camera, start/stop, flip and expand, with graceful denied/unsupported states; video stays local.
- Opt-in Web Audio soundscape (capture impact + chime, ambient ticks) with a sound toggle.
- Animated capture celebration overlay with scrolling marquee text; respects reduced-motion settings.
- Responsive layout: 2/3 game area + 1/3 camera panel on desktop, stacked on tablet and phone.

## How to run

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev        # local development server
pnpm build      # production build
pnpm start      # run the production build
```

## Tech stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Web APIs (`getUserMedia`, Web Audio API), Express for production serving.

## FAQ

**What is Neon Castle Chess?** A single-player chess game in the browser against a built-in AI engine, styled in a graphite / ivory / amber dark theme.

**Is it a full chess engine like Stockfish?** No. It is a lightweight minimax alpha-beta engine for casual play written in TypeScript.

**Does it need an account or internet server?** No account. All game logic and camera handling run in your browser.

**Can I turn off sounds and animations?** Sound is off until you enable it, and motion honors your system's reduced-motion preference.

## Tiếng Việt

**Neon Castle Chess** là game **cờ vua online chơi với máy** trên trình duyệt, giao diện tối sang trọng. AI dùng minimax alpha-beta, có bảng camera trước/sau (chỉ chạy trên máy), âm thanh bật tùy chọn và hiệu ứng ăn quân. Dùng tốt trên máy tính và điện thoại.

Từ khóa: cờ vua, chơi cờ vua với máy, cờ vua AI, chess online.

## Support / Ủng hộ

If this project helps you, you can support the author:

- ☕ Ko-fi: https://ko-fi.com/quocvietvu
- 💙 PayPal: https://www.paypal.com/donate?business=vuvietnb85%40gmail.com&currency_code=USD

## Author

**Vu Quoc Viet (Vũ Quốc Việt)** — VXO Digital Lab, Vietnam · GitHub [@vuvietnb85-web](https://github.com/vuvietnb85-web)
