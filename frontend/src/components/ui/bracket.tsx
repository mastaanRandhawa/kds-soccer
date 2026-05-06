import { motion } from "framer-motion";
import type { Match } from "@/lib/api";

interface BracketProps {
  quarterfinals: Match[];
  semifinals: Match[];
  final: Match[];
  thirdPlace: Match[];
}

// Layout constants
const SLOT_H = 148;   // vertical space per QF slot
const CARD_H = 116;   // card height in px
const COL_W = 228;    // column card width
const CONN_W = 56;    // connector gap width between columns

// Derive card positions for an n-slot (QF) bracket
function calcLayout(numQF: number) {
  const totalH = numQF * SLOT_H;

  // Card vertical centers for each round
  const qfCenters = Array.from({ length: numQF }, (_, i) => i * SLOT_H + SLOT_H / 2);

  // SF: each card centered between its two QF feeders
  const sfCenters =
    numQF >= 4
      ? [
          (qfCenters[0] + qfCenters[1]) / 2,
          (qfCenters[2] + qfCenters[3]) / 2,
        ]
      : numQF >= 2
      ? [(qfCenters[0] + qfCenters[1]) / 2]
      : [];

  // Final: centered between the two SF cards (or the two QF cards when no SF)
  const srcCenters = sfCenters.length >= 2 ? sfCenters : qfCenters;
  const finalCenter =
    srcCenters.length >= 2
      ? (srcCenters[0] + srcCenters[srcCenters.length - 1]) / 2
      : srcCenters[0] ?? totalH / 2;

  // Column x positions
  const qfX = 0;
  const sfX = numQF >= 4 ? COL_W + CONN_W : -1; // -1 means hidden
  const finalX =
    numQF >= 4
      ? sfX + COL_W + CONN_W
      : numQF >= 2
      ? COL_W + CONN_W
      : 0;
  const totalW = finalX + COL_W;

  return {
    totalH,
    totalW,
    qfX,
    sfX,
    finalX,
    qfCenters,
    sfCenters,
    finalCenter,
    qfTops: qfCenters.map((c) => c - CARD_H / 2),
    sfTops: sfCenters.map((c) => c - CARD_H / 2),
    finalTop: finalCenter - CARD_H / 2,
  };
}

// Connector lines rendered as SVG overlay
function ConnectorSVG({
  layout,
  numQF,
}: {
  layout: ReturnType<typeof calcLayout>;
  numQF: number;
}) {
  const { qfCenters, sfCenters, finalCenter, qfX, sfX, finalX, totalH, totalW } = layout;

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  if (numQF >= 4 && sfX !== -1) {
    // QF[0,1] → SF[0]
    const midX1 = qfX + COL_W + CONN_W / 2;
    lines.push(
      { x1: qfX + COL_W, y1: qfCenters[0], x2: midX1, y2: qfCenters[0] },
      { x1: qfX + COL_W, y1: qfCenters[1], x2: midX1, y2: qfCenters[1] },
      { x1: midX1, y1: qfCenters[0], x2: midX1, y2: qfCenters[1] },
      { x1: midX1, y1: sfCenters[0], x2: sfX, y2: sfCenters[0] }
    );
    // QF[2,3] → SF[1]
    lines.push(
      { x1: qfX + COL_W, y1: qfCenters[2], x2: midX1, y2: qfCenters[2] },
      { x1: qfX + COL_W, y1: qfCenters[3], x2: midX1, y2: qfCenters[3] },
      { x1: midX1, y1: qfCenters[2], x2: midX1, y2: qfCenters[3] },
      { x1: midX1, y1: sfCenters[1], x2: sfX, y2: sfCenters[1] }
    );
    // SF[0,1] → Final
    const midX2 = sfX + COL_W + CONN_W / 2;
    lines.push(
      { x1: sfX + COL_W, y1: sfCenters[0], x2: midX2, y2: sfCenters[0] },
      { x1: sfX + COL_W, y1: sfCenters[1], x2: midX2, y2: sfCenters[1] },
      { x1: midX2, y1: sfCenters[0], x2: midX2, y2: sfCenters[1] },
      { x1: midX2, y1: finalCenter, x2: finalX, y2: finalCenter }
    );
  } else if (numQF >= 2) {
    // Direct QF → Final
    const midX = qfX + COL_W + CONN_W / 2;
    lines.push(
      { x1: qfX + COL_W, y1: qfCenters[0], x2: midX, y2: qfCenters[0] },
      { x1: qfX + COL_W, y1: qfCenters[1], x2: midX, y2: qfCenters[1] },
      { x1: midX, y1: qfCenters[0], x2: midX, y2: qfCenters[1] },
      { x1: midX, y1: finalCenter, x2: finalX, y2: finalCenter }
    );
  }

  return (
    <svg
      style={{ position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}
      width={totalW}
      height={totalH}
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#d1d5db"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

// A single match card in the bracket
function BracketCard({
  match,
  delay = 0,
  style,
}: {
  match?: Match;
  delay?: number;
  style?: React.CSSProperties;
}) {
  if (!match) {
    return (
      <div
        style={{
          ...style,
          width: COL_W,
          height: CARD_H,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "12px",
          backgroundColor: "#f9fafb",
          border: "1.5px dashed #d1d5db",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            color: "#9ca3af",
            fontStyle: "italic",
          }}
        >
          TBD
        </span>
      </div>
    );
  }

  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const team1Wins = isCompleted && match.score1 > match.score2;
  const team2Wins = isCompleted && match.score2 > match.score1;

  const statusColor = isLive ? "#10B981" : isCompleted ? "#6b7280" : "#3b82f6";
  const statusLabel = isLive ? "LIVE" : isCompleted ? "FT" : "UP";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay }}
      style={{
        ...style,
        width: COL_W,
        height: CARD_H,
        position: "absolute",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        border: "1.5px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Status strip at top */}
      <div
        style={{
          height: "3px",
          backgroundColor: statusColor,
          width: "100%",
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "10px 12px 8px" }}>
        {/* Team 1 row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 6px",
            borderRadius: "6px",
            backgroundColor: team1Wins ? "#eff6ff" : "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#e8f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {match.team1?.logoUrl ? (
                <img src={match.team1.logoUrl} alt="" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px", color: "#1a1a1a" }}>
                  {(match.homePlaceholder ?? match.team1?.name ?? "?").charAt(0)}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: team1Wins ? 600 : 400,
                color: match.homePlaceholder ? "#9ca3af" : "#1a1a1a",
                fontStyle: match.homePlaceholder ? "italic" : "normal",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
              }}
            >
              {match.homePlaceholder ?? match.team1?.name ?? "TBD"}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: team1Wins ? "#1a1a1a" : isCompleted ? "#9ca3af" : "#1a1a1a",
              flexShrink: 0,
            }}
          >
            {isCompleted || isLive ? match.score1 : "-"}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", backgroundColor: "#f3f4f6", margin: "2px 0" }} />

        {/* Team 2 row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 6px",
            borderRadius: "6px",
            backgroundColor: team2Wins ? "#eff6ff" : "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "#e8f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {match.team2?.logoUrl ? (
                <img src={match.team2.logoUrl} alt="" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "11px", color: "#1a1a1a" }}>
                  {(match.awayPlaceholder ?? match.team2?.name ?? "?").charAt(0)}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                fontWeight: team2Wins ? 600 : 400,
                color: match.awayPlaceholder ? "#9ca3af" : "#1a1a1a",
                fontStyle: match.awayPlaceholder ? "italic" : "normal",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "120px",
              }}
            >
              {match.awayPlaceholder ?? match.team2?.name ?? "TBD"}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: team2Wins ? "#1a1a1a" : isCompleted ? "#9ca3af" : "#1a1a1a",
              flexShrink: 0,
            }}
          >
            {isCompleted || isLive ? match.score2 : "-"}
          </span>
        </div>

        {/* Footer: status + live indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", paddingTop: "4px", borderTop: "1px solid #f3f4f6" }}>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              color: statusColor,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {isLive && <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981", animation: "pulse 1.5s infinite" }} />}
            {statusLabel}
          </span>
          {match.matchDate && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#9ca3af" }}>
              {new Date(match.matchDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Bracket({ quarterfinals, semifinals, final, thirdPlace }: BracketProps) {
  // Determine how many QF slots to render (pad to nearest even number, min 4)
  const numQF = Math.max(4, Math.ceil(quarterfinals.length / 2) * 2);
  const layout = calcLayout(numQF);

  // Build round labels
  const hasQF = quarterfinals.length > 0;
  const hasSF = semifinals.length > 0 || quarterfinals.length > 0;
  const rounds: { label: string; x: number }[] = [];
  if (hasQF && layout.sfX !== -1) rounds.push({ label: "Quarter-finals", x: layout.qfX });
  if (hasSF && layout.sfX !== -1) rounds.push({ label: "Semi-finals", x: layout.sfX });
  rounds.push({ label: "Final", x: layout.finalX });

  return (
    <div>
      {/* Scroll wrapper for mobile */}
      <div className="w-full overflow-x-auto pb-4">
        <div style={{ padding: "16px 24px 24px" }}>
          {/* Round header labels */}
          <div style={{ position: "relative", width: layout.totalW, marginBottom: "20px" }}>
            {rounds.map((r) => (
              <div
                key={r.label}
                style={{
                  position: "absolute",
                  left: r.x,
                  width: COL_W,
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "inline-block",
                    padding: "4px 12px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "100px",
                  }}
                >
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          {/* Bracket body */}
          <div
            style={{
              position: "relative",
              width: layout.totalW,
              height: layout.totalH,
            }}
          >
            {/* SVG connector lines */}
            <ConnectorSVG layout={layout} numQF={numQF} />

            {/* QF cards */}
            {Array.from({ length: numQF }, (_, i) => (
              <BracketCard
                key={`qf-${i}`}
                match={quarterfinals[i]}
                delay={i * 0.08}
                style={{ left: layout.qfX, top: layout.qfTops[i] }}
              />
            ))}

            {/* SF cards */}
            {layout.sfX !== -1 && (
              <>
                {[0, 1].map((j) => (
                  <BracketCard
                    key={`sf-${j}`}
                    match={semifinals[j]}
                    delay={0.35 + j * 0.1}
                    style={{ left: layout.sfX, top: layout.sfTops[j] }}
                  />
                ))}
              </>
            )}

            {/* Final card */}
            <BracketCard
              match={final[0]}
              delay={0.55}
              style={{ left: layout.finalX, top: layout.finalTop }}
            />
          </div>
        </div>
      </div>

      {/* Third place (separate, below the main bracket) */}
      {(thirdPlace.length > 0 || true) && (
        <div className="mt-8 px-6">
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "24px",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Third Place Match
            </p>
            <div style={{ width: COL_W }}>
              {thirdPlace.length > 0 ? (
                <div style={{ position: "relative", height: CARD_H }}>
                  <BracketCard match={thirdPlace[0]} delay={0.65} style={{ left: 0, top: 0 }} />
                </div>
              ) : (
                <div style={{ position: "relative", height: CARD_H }}>
                  <BracketCard style={{ left: 0, top: 0 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
