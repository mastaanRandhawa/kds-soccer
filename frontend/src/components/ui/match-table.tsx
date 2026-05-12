import { motion } from "framer-motion";
import type { Match } from "@/lib/api";
import { fmtShortDate, fmtTime } from "@/lib/utils";

interface MatchTableProps {
  matches: Match[];
  emptyMessage?: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; color: string; dot?: boolean }> = {
    LIVE: { label: "Live", bg: "#d1fae5", color: "#065f46", dot: true },
    SCHEDULED: { label: "Upcoming", bg: "#dbeafe", color: "#1e40af" },
    COMPLETED: { label: "FT", bg: "#f3f4f6", color: "#374151" },
  };
  const c = config[status] ?? config.SCHEDULED;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "100px",
        backgroundColor: c.bg,
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        fontWeight: 600,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      {c.dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#10B981",
            display: "inline-block",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      {c.label}
    </span>
  );
}

function RoundBadge({ round }: { round: string }) {
  const label = round
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        color: "#6b7280",
        backgroundColor: "#f9fafb",
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid #e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function TeamCell({ name, logoUrl, isWinner, italic }: { name: string; logoUrl?: string; isWinner?: boolean; italic?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12px", color: "#1a1a1a" }}>
            {name.charAt(0)}
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: isWinner ? 600 : 400,
          color: italic ? "#9ca3af" : "#1a1a1a",
          fontStyle: italic ? "italic" : "normal",
        }}
      >
        {name}
      </span>
    </div>
  );
}

/** Safe name that falls back to placeholder text then "TBD" */
function resolveTeamName(match: Match, side: "home" | "away"): string {
  if (side === "home") return match.homePlaceholder ?? match.team1?.name ?? "TBD";
  return match.awayPlaceholder ?? match.team2?.name ?? "TBD";
}
function resolveLogoUrl(match: Match, side: "home" | "away"): string | undefined {
  return side === "home" ? match.team1?.logoUrl : match.team2?.logoUrl;
}
function isPlaceholderTeam(match: Match, side: "home" | "away"): boolean {
  return side === "home" ? !!match.homePlaceholder : !!match.awayPlaceholder;
}

// Desktop table row
function DesktopRow({ match, idx }: { match: Match; idx: number }) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const showScore = isCompleted || isLive;
  const team1Wins = isCompleted && match.score1 > match.score2;
  const team2Wins = isCompleted && match.score2 > match.score1;

  const home1 = resolveTeamName(match, "home");
  const home2 = resolveTeamName(match, "away");
  const logo1 = resolveLogoUrl(match, "home");
  const logo2 = resolveLogoUrl(match, "away");

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      style={{ borderBottom: "1px solid #f3f4f6" }}
      className="hover:bg-gray-50 transition-colors"
    >
      {/* Date */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        {match.matchDate ? (
          <div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#1a1a1a" }}>
              {fmtShortDate(match.matchDate)}
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}>
              {fmtTime(match.matchDate)}
            </div>
          </div>
        ) : (
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#9ca3af" }}>TBD</span>
        )}
      </td>

      {/* Home team */}
      <td style={{ padding: "14px 16px" }}>
        <TeamCell name={home1} logoUrl={logo1} isWinner={team1Wins} italic={isPlaceholderTeam(match, "home")} />
      </td>

      {/* Score */}
      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        {showScore ? (
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.05em" }}>
            {match.score1} <span style={{ color: "#d1d5db", fontWeight: 400 }}>–</span> {match.score2}
          </span>
        ) : (
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 500, color: "#9ca3af" }}>vs</span>
        )}
      </td>

      {/* Away team */}
      <td style={{ padding: "14px 16px" }}>
        <TeamCell name={home2} logoUrl={logo2} isWinner={team2Wins} italic={isPlaceholderTeam(match, "away")} />
      </td>

      {/* Round */}
      <td style={{ padding: "14px 16px" }}>
        <RoundBadge round={match.round} />
      </td>

      {/* Status */}
      <td style={{ padding: "14px 16px" }}>
        <StatusBadge status={match.status} />
      </td>
    </motion.tr>
  );
}

// Mobile match card
function MobileCard({ match, idx }: { match: Match; idx: number }) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const showScore = isCompleted || isLive;
  const team1Wins = isCompleted && match.score1 > match.score2;
  const team2Wins = isCompleted && match.score2 > match.score1;

  const home1 = resolveTeamName(match, "home");
  const home2 = resolveTeamName(match, "away");
  const logo1 = resolveLogoUrl(match, "home");
  const logo2 = resolveLogoUrl(match, "away");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Top bar: round + status + date */}
      <div
        style={{
          padding: "10px 14px",
          backgroundColor: "#f9fafb",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <RoundBadge round={match.round} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {match.matchDate && (
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}>
              {fmtShortDate(match.matchDate)} {fmtTime(match.matchDate)}
            </span>
          )}
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Match body */}
      <div style={{ padding: "14px 16px" }}>
        {/* Team 1 row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: "8px",
            backgroundColor: team1Wins ? "#eff6ff" : "transparent",
            marginBottom: "4px",
          }}
        >
          <TeamCell name={home1} logoUrl={logo1} isWinner={team1Wins} italic={isPlaceholderTeam(match, "home")} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: team1Wins ? "#1a1a1a" : isCompleted ? "#9ca3af" : "#1a1a1a" }}>
            {showScore ? match.score1 : "–"}
          </span>
        </div>

        {/* Team 2 row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: "8px",
            backgroundColor: team2Wins ? "#eff6ff" : "transparent",
          }}
        >
          <TeamCell name={home2} logoUrl={logo2} isWinner={team2Wins} italic={isPlaceholderTeam(match, "away")} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: team2Wins ? "#1a1a1a" : isCompleted ? "#9ca3af" : "#1a1a1a" }}>
            {showScore ? match.score2 : "–"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function MatchTable({ matches, emptyMessage = "No matches found." }: MatchTableProps) {
  if (matches.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#9ca3af" }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table (md and up) */}
      <div className="hidden md:block">
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Home", "Score", "Away", "Round", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: h === "Score" ? "center" : "left",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((match, idx) => (
                <DesktopRow key={match.id} match={match} idx={idx} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards (below md) */}
      <div className="md:hidden space-y-3">
        {matches.map((match, idx) => (
          <MobileCard key={match.id} match={match} idx={idx} />
        ))}
      </div>
    </>
  );
}
