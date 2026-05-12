import { motion } from "framer-motion";
import type { Match } from "@/lib/api";
import { fmtDateTime } from "@/lib/utils";

interface MatchCardProps {
  match: Match;
  showDate?: boolean;
}

export function MatchCard({ match, showDate = true }: MatchCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "#10B981";
      case "COMPLETED":
        return "#6B7280";
      default:
        return "#3B82F6";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "LIVE":
        return "LIVE";
      case "COMPLETED":
        return "FINAL";
      default:
        return "UPCOMING";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
      style={{
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{
            backgroundColor: getStatusColor(match.status),
            fontFamily: "Inter, sans-serif",
          }}
        >
          {match.status === "LIVE" && (
            <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
          )}
          {getStatusLabel(match.status)}
        </span>
        <span
          className="text-xs"
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#718096",
          }}
        >
          {match.round.replace("_", " ")}
        </span>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8F0FF" }}
            >
              {match.team1?.logoUrl ? (
                <img
                  src={match.team1.logoUrl}
                  alt={match.team1?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#1a1a1a" }}>
                  {(match.homePlaceholder ?? match.team1?.name ?? "?").charAt(0)}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                color: match.homePlaceholder ? "#9ca3af" : "#1a1a1a",
                fontStyle: match.homePlaceholder ? "italic" : "normal",
              }}
            >
              {match.homePlaceholder ?? match.team1?.name ?? "TBD"}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "24px",
              color: match.score1 > match.score2 ? "#1a1a1a" : "#718096",
            }}
          >
            {match.score1}
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px"
          style={{ backgroundColor: "#e2e8f0" }}
        />

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#E8F0FF" }}
            >
              {match.team2?.logoUrl ? (
                <img
                  src={match.team2.logoUrl}
                  alt={match.team2?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#1a1a1a" }}>
                  {(match.awayPlaceholder ?? match.team2?.name ?? "?").charAt(0)}
                </span>
              )}
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                color: match.awayPlaceholder ? "#9ca3af" : "#1a1a1a",
                fontStyle: match.awayPlaceholder ? "italic" : "normal",
              }}
            >
              {match.awayPlaceholder ?? match.team2?.name ?? "TBD"}
            </span>
          </div>
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "24px",
              color: match.score2 > match.score1 ? "#1a1a1a" : "#718096",
            }}
          >
            {match.score2}
          </span>
        </div>
      </div>

      {/* Match Date */}
      {showDate && match.matchDate && (
        <div
          className="mt-4 pt-4 text-center"
          style={{ borderTop: "1px solid #e2e8f0" }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#718096",
            }}
          >
            {fmtDateTime(match.matchDate)}
          </span>
        </div>
      )}
    </motion.div>
  );
}
