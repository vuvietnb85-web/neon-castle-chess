import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flag,
  Handshake,
  Maximize2,
  MicOff,
  MoreHorizontal,
  RefreshCw,
  ScanLine,
  Settings2,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Trophy,
  UserRound,
  Video,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Color = "w" | "b";
type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
type Piece = { type: PieceType; color: Color };
type Square = { r: number; c: number };
type MoveRecord = { from: string; to: string; capture?: boolean; note?: string };

type ThemeBoard = (Piece | null)[][];

const glyphs: Record<Color, Record<PieceType, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const pieceNames: Record<PieceType, string> = { k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn" };
const initialMoves: MoveRecord[] = [
  { from: "e2", to: "e4" },
  { from: "e7", to: "e5" },
  { from: "g1", to: "f3" },
  { from: "b8", to: "c6" },
  { from: "f1", to: "b5" },
  { from: "a7", to: "a6" },
  { from: "b5", to: "a4", note: "book" },
];

function makeInitialBoard(): ThemeBoard {
  const back: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const board: ThemeBoard = Array.from({ length: 8 }, () => Array<Piece | null>(8).fill(null));
  back.forEach((type, c) => {
    board[0][c] = { type, color: "b" };
    board[7][c] = { type, color: "w" };
    board[1][c] = { type: "p", color: "b" };
    board[6][c] = { type: "p", color: "w" };
  });
  // A recognisable tactical snapshot: the center is already open.
  board[1][4] = null;
  board[3][4] = { type: "p", color: "b" };
  board[6][3] = null;
  board[4][3] = { type: "p", color: "w" };
  board[7][5] = null;
  board[4][2] = { type: "b", color: "w" };
  board[0][1] = null;
  board[2][2] = { type: "n", color: "b" };
  return board;
}

function squareName(square: Square) {
  return `${files[square.c]}${8 - square.r}`;
}

function isInside(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getLegalMoves(board: ThemeBoard, from: Square): Square[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];
  const moves: Square[] = [];
  const push = (r: number, c: number) => {
    if (!isInside(r, c)) return false;
    const target = board[r][c];
    if (!target) {
      moves.push({ r, c });
      return true;
    }
    if (target.color !== piece.color) moves.push({ r, c });
    return false;
  };

  if (piece.type === "p") {
    const dir = piece.color === "w" ? -1 : 1;
    const start = piece.color === "w" ? 6 : 1;
    if (isInside(from.r + dir, from.c) && !board[from.r + dir][from.c]) {
      moves.push({ r: from.r + dir, c: from.c });
      if (from.r === start && !board[from.r + dir * 2][from.c]) moves.push({ r: from.r + dir * 2, c: from.c });
    }
    [-1, 1].forEach((dc) => {
      const r = from.r + dir;
      const c = from.c + dc;
      if (isInside(r, c) && board[r][c] && board[r][c]?.color !== piece.color) moves.push({ r, c });
    });
    return moves;
  }

  if (piece.type === "n") {
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => push(from.r + dr, from.c + dc));
    return moves;
  }

  if (piece.type === "k") {
    for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) push(from.r + dr, from.c + dc);
    return moves;
  }

  const directions: Record<PieceType, number[][]> = {
    r: [[1, 0], [-1, 0], [0, 1], [0, -1]],
    b: [[1, 1], [1, -1], [-1, 1], [-1, -1]],
    q: [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
    n: [], k: [], p: [],
  };
  directions[piece.type].forEach(([dr, dc]) => {
    let r = from.r + dr;
    let c = from.c + dc;
    while (push(r, c)) { r += dr; c += dc; }
  });
  return moves;
}

function chooseEngineMove(board: ThemeBoard) {
  const candidates: { from: Square; to: Square; score: number }[] = [];
  board.forEach((row, r) => row.forEach((piece, c) => {
    if (!piece || piece.color !== "b") return;
    getLegalMoves(board, { r, c }).forEach((to) => {
      const target = board[to.r][to.c];
      const score = target ? ({ q: 9, r: 5, b: 3, n: 3, p: 1, k: 20 }[target.type] ?? 0) : (to.r > 3 ? 0.4 : 0);
      candidates.push({ from: { r, c }, to, score });
    });
  }));
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] ?? null;
}

function PlayerChip({ avatar, name, rating, color, active, time, tag }: { avatar?: string; name: string; rating: string; color: Color; active?: boolean; time: string; tag?: string }) {
  return (
    <div className={`player-chip ${active ? "player-chip-active" : ""}`}>
      <div className={`avatar ${color === "b" ? "avatar-dark" : ""}`}>
        {avatar ? <img src={avatar} alt="" /> : <UserRound size={18} />}
        <span className="online-dot" />
      </div>
      <div className="player-copy">
        <div className="player-name">{name} {tag && <span className="tiny-tag">{tag}</span>}</div>
        <div className="player-rating">{rating} <span className="rating-dot">•</span> {color === "w" ? "White" : "Black"}</div>
      </div>
      <div className={`player-time ${active ? "time-active" : ""}`}><Clock3 size={13} />{time}</div>
    </div>
  );
}

export default function Home() {
  const [board, setBoard] = useState<ThemeBoard>(() => makeInitialBoard());
  const [turn, setTurn] = useState<Color>("w");
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square }>({ from: { r: 1, c: 4 }, to: { r: 3, c: 4 } });
  const [moveList, setMoveList] = useState<MoveRecord[]>(initialMoves);
  const [engineStatus, setEngineStatus] = useState("Your move");
  const [activeTab, setActiveTab] = useState<"game" | "moves" | "analysis">("game");
  const [cameraSide, setCameraSide] = useState<"front" | "rear">("front");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("Camera standby");
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const engineTimer = useRef<number | null>(null);
  const demoMode = useMemo(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo"), []);

  const legalTargets = selected ? getLegalMoves(board, selected) : [];
  const legalTargetKeys = new Set(legalTargets.map(squareName));

  useEffect(() => {
    if (!demoMode) return;
    setEngineStatus("Demo line armed");
    const demoTimer = window.setTimeout(() => {
      setEngineStatus("Your move");
    }, 1500);
    return () => window.clearTimeout(demoTimer);
  }, [demoMode]);

  useEffect(() => () => {
    if (engineTimer.current) window.clearTimeout(engineTimer.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
    setCameraMessage("Camera standby");
  };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("Camera unavailable in this browser");
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: cameraSide }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setCameraMessage(`${cameraSide === "front" ? "Front" : "Rear"} camera live`);
    } catch {
      setCameraOn(false);
      setCameraMessage("Camera permission needed");
    }
  };

  const toggleCamera = () => {
    if (cameraOn) stopCamera();
    else void startCamera();
  };

  const flipCamera = () => {
    const next = cameraSide === "front" ? "rear" : "front";
    setCameraSide(next);
    if (cameraOn) {
      window.setTimeout(() => void startCamera(), 80);
    }
  };

  const runEngineReply = (currentBoard: ThemeBoard) => {
    engineTimer.current = window.setTimeout(() => {
      const reply = chooseEngineMove(currentBoard);
      if (!reply) {
        setEngineStatus("Game over");
        return;
      }
      const nextBoard = currentBoard.map((row) => [...row]);
      const moving = nextBoard[reply.from.r][reply.from.c];
      if (!moving) return;
      const captured = Boolean(nextBoard[reply.to.r][reply.to.c]);
      nextBoard[reply.to.r][reply.to.c] = moving;
      nextBoard[reply.from.r][reply.from.c] = null;
      setBoard(nextBoard);
      setLastMove({ from: reply.from, to: reply.to });
      setMoveList((history) => [...history, { from: squareName(reply.from), to: squareName(reply.to), capture: captured, note: captured ? "tactical" : "engine" }]);
      setTurn("w");
      setEngineStatus(captured ? "Material shift — your move" : "Your move");
    }, 820);
  };

  const handleSquareClick = (square: Square) => {
    const piece = board[square.r][square.c];
    if (turn !== "w") return;
    if (selected && legalTargetKeys.has(squareName(square))) {
      const currentBoard = board.map((row) => [...row]);
      const movingPiece = currentBoard[selected.r][selected.c];
      if (!movingPiece) return;
      const captured = Boolean(currentBoard[square.r][square.c]);
      currentBoard[square.r][square.c] = movingPiece.type === "p" && (square.r === 0 || square.r === 7) ? { type: "q", color: movingPiece.color } : movingPiece;
      currentBoard[selected.r][selected.c] = null;
      setBoard(currentBoard);
      setLastMove({ from: selected, to: square });
      setMoveList((history) => [...history, { from: squareName(selected), to: squareName(square), capture: captured }]);
      setSelected(null);
      setTurn("b");
      setEngineStatus("Deep Glass is calculating");
      runEngineReply(currentBoard);
      return;
    }
    if (piece?.color === "w") setSelected(square);
    else setSelected(null);
  };

  const resetGame = () => {
    if (engineTimer.current) window.clearTimeout(engineTimer.current);
    setBoard(makeInitialBoard());
    setTurn("w");
    setSelected(null);
    setLastMove({ from: { r: 1, c: 4 }, to: { r: 3, c: 4 } });
    setMoveList(initialMoves);
    setEngineStatus("Your move");
  };

  const statusText = turn === "w" ? "White to move" : "Engine turn";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><span /></div>
          <div><div className="brand-name">NEON CASTLE</div><div className="brand-sub">CHESS / SESSION 04</div></div>
        </div>
        <div className="session-pill"><span className="live-dot" /> LIVE MATCH <strong>04:18</strong></div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Help"><CircleHelp size={17} /></button>
          <button className="icon-button" aria-label="Settings"><Settings2 size={17} /></button>
          <div className="top-avatar"><img src="/manus-storage/player-avatar_2671cb50.png" alt="Player avatar" /></div>
        </div>
      </header>

      <section className="main-layout">
        <div className="arena-shell">
          <nav className="nav-rail" aria-label="Game navigation">
            <div className="rail-label">MODE</div>
            <button className="rail-item rail-item-active" aria-label="Play"><span className="rail-glyph">♞</span><small>Play</small></button>
            <button className="rail-item" aria-label="Puzzles"><Sparkles size={18} /><small>Puzzles</small></button>
            <button className="rail-item" aria-label="Watch"><Video size={18} /><small>Watch</small></button>
            <button className="rail-item" aria-label="Stats"><Trophy size={18} /><small>Stats</small></button>
            <div className="rail-spacer" />
            <button className="rail-item rail-more" aria-label="More"><MoreHorizontal size={18} /><small>More</small></button>
          </nav>

          <section className="game-column">
            <div className="game-toolbar">
              <div className="match-context"><span className="eyebrow">RATED / RAPID</span><span className="match-title">The Amber Gambit</span></div>
              <div className="toolbar-actions"><span className="engine-chip"><Zap size={12} /> DEEP GLASS 3.1</span><button className="mini-button" onClick={resetGame} aria-label="Reset game"><RefreshCw size={15} /></button><button className="mini-button" aria-label="More options"><SlidersHorizontal size={15} /></button></div>
            </div>
            <div className="player-row player-row-top"><PlayerChip name="Mikhail V." rating="2,184" color="b" time="08:42" tag="GM" /></div>
            <div className="board-stage-wrap">
              <div className="board-stage">
                <div className="board-glow" />
                <div className="chessboard" role="grid" aria-label="Chess board">
                  {board.map((row, r) => row.map((piece, c) => {
                    const current = { r, c };
                    const key = squareName(current);
                    const isLight = (r + c) % 2 === 0;
                    const isSelected = selected && selected.r === r && selected.c === c;
                    const isLast = (lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c);
                    const isTarget = legalTargetKeys.has(key);
                    return (
                      <button
                        key={key}
                        role="gridcell"
                        className={`square ${isLight ? "square-light" : "square-dark"} ${isSelected ? "square-selected" : ""} ${isLast ? "square-last" : ""} ${isTarget ? "square-target" : ""}`}
                        onClick={() => handleSquareClick(current)}
                        aria-label={`${key}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${pieceNames[piece.type]}` : " empty"}`}
                      >
                        {c === 0 && <span className={`rank-label ${isLight ? "label-dark" : "label-light"}`}>{8 - r}</span>}
                        {r === 7 && <span className={`file-label ${isLight ? "label-dark" : "label-light"}`}>{files[c]}</span>}
                        {piece && <span className={`piece piece-${piece.color}`}>{glyphs[piece.color][piece.type]}</span>}
                        {isTarget && <span className="target-dot" />}
                      </button>
                    );
                  }))}
                </div>
              </div>
            </div>
            <div className="player-row player-row-bottom"><PlayerChip avatar="/manus-storage/player-avatar_2671cb50.png" name="You" rating="1,850" color="w" active time="09:55" tag="YOU" /></div>
            <div className="board-footer"><span><span className="status-indicator" /> {statusText}</span><span className="footer-note"><ShieldCheck size={13} /> Fair play monitored</span><span className="notation">{lastMove ? `${squareName(lastMove.from)} → ${squareName(lastMove.to)}` : "—"}</span></div>
          </section>
        </div>

        <aside className="companion-panel">
          <div className="tabs" role="tablist">
            {(["game", "moves", "analysis"] as const).map((tab) => <button key={tab} className={`tab ${activeTab === tab ? "tab-active" : ""}`} onClick={() => setActiveTab(tab)} role="tab" aria-selected={activeTab === tab}>{tab === "game" ? "Game" : tab === "moves" ? "Move list" : "Analysis"}</button>)}
            <button className="tab-settings" aria-label="Panel settings"><MoreHorizontal size={16} /></button>
          </div>
          <div className="camera-card">
            <div className="camera-header"><div className="camera-title"><span className={`camera-state ${cameraOn ? "camera-state-on" : ""}`} /> <span>Camera companion</span></div><button className="camera-expand" aria-label="Expand camera"><Maximize2 size={15} /></button></div>
            <div className="camera-view" style={{ backgroundImage: `url(/manus-storage/camera-ambient_5e1ac6fb.png)` }}>
              <img className={`camera-avatar ${cameraOn ? "camera-avatar-hidden" : ""}`} src="/manus-storage/player-avatar_2671cb50.png" alt="Camera placeholder" />
              <video ref={videoRef} className={`camera-video ${cameraOn ? "camera-video-on" : ""}`} muted={muted} playsInline />
              <div className="camera-corner camera-corner-tl" /><div className="camera-corner camera-corner-tr" /><div className="camera-corner camera-corner-bl" /><div className="camera-corner camera-corner-br" />
              <div className="camera-copy"><span className="camera-kicker">{cameraOn ? "PRIVATE PREVIEW" : "YOUR MOVE, YOUR SPACE"}</span><strong>{cameraOn ? cameraMessage : "Connect your camera"}</strong><small>{cameraOn ? "Only visible to you in this session" : "Keep the game face-to-face"}</small></div>
              <div className="camera-mode-switch"><button className={cameraSide === "front" ? "mode-active" : ""} onClick={() => setCameraSide("front")}>Front</button><button className="flip-button" onClick={flipCamera} aria-label="Switch camera"><RefreshCw size={13} /></button><button className={cameraSide === "rear" ? "mode-active" : ""} onClick={() => setCameraSide("rear")}>Rear</button></div>
            </div>
            <div className="camera-controls"><button className="control-button" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button><button className={`camera-main-button ${cameraOn ? "camera-main-button-live" : ""}`} onClick={toggleCamera} aria-label={cameraOn ? "Stop camera" : "Start camera"}>{cameraOn ? <CameraOff size={21} /> : <Camera size={21} />}</button><button className="control-button" onClick={flipCamera} aria-label="Flip camera"><RefreshCw size={17} /></button></div>
            <div className="camera-privacy"><ShieldCheck size={13} /> Local-only camera access <span>{cameraOn ? "LIVE" : "OFF"}</span></div>
          </div>
          <div className="panel-content">
            {activeTab === "game" && <><div className="panel-section-head"><span>Match pulse</span><span className="section-live"><span className="live-dot" /> synced</span></div><div className="pulse-card"><div className="pulse-top"><div><span className="eyebrow">POSITION EVALUATION</span><strong>{engineStatus}</strong></div><span className="eval-score">+0.24</span></div><div className="eval-bar"><span /></div><div className="pulse-meta"><span>depth 18</span><span>12.4M nodes</span><span>63%</span></div></div><div className="panel-actions"><button className="action-button" onClick={() => setEngineStatus("Draw offer sent")}><Handshake size={15} /> Offer draw</button><button className="action-button action-danger" onClick={() => setEngineStatus("Flag menu opened")}><Flag size={15} /> Resign</button></div></>}
            {activeTab === "moves" && <div className="moves-panel"><div className="panel-section-head"><span>Notation</span><span className="section-live">7 moves</span></div>{moveList.map((move, index) => <div className="move-line" key={`${move.from}-${move.to}-${index}`}><span>{String(Math.floor(index / 2) + 1).padStart(2, "0")}{index % 2 === 0 ? "." : "…"}</span><strong>{move.from} → {move.to}</strong><small>{move.capture ? "capture" : move.note ?? "quiet"}</small></div>)}</div>}
            {activeTab === "analysis" && <div className="analysis-panel"><div className="analysis-card"><Sparkles size={16} /><div><strong>Find the amber square</strong><p>There is a forcing line in the open center. Tap a white piece to reveal candidate squares.</p></div></div><div className="hint-row"><span><Zap size={14} /> Tactical vision</span><span className="hint-value">ON</span></div><div className="hint-row"><span><ScanLine size={14} /> Board scan</span><span className="hint-value">18 ply</span></div></div>}
          </div>
          <div className="panel-bottom"><button className="round-control" aria-label="Previous match"><ChevronLeft size={18} /></button><button className="next-match"><span>Next match</span><ChevronRight size={16} /></button><button className="round-control" aria-label="Next match"><ChevronRight size={18} /></button></div>
        </aside>
      </section>
    </main>
  );
}

void MicOff;
void Video;
void Clock3;
void SlidersHorizontal;
void Trophy;
void Zap;
void ShieldCheck;
void Handshake;
void Flag;
void ChevronLeft;
void ChevronRight;
void CameraOff;
void Maximize2;
void CircleHelp;
void UserRound;
void MoreHorizontal;
void Settings2;
void RefreshCw;
void Sparkles;
void ScanLine;
void Volume2;
void VolumeX;
void Camera;
void Button;
