import React from "react";
import { motion } from "framer-motion";
import type { Match } from "@/lib/api";

interface BracketProps {
  quarterfinals: Match[];
  semifinals: Match[];
  final: Match[];
  thirdPlace: Match[];
}

function BracketMatch({ match, delay = 0 }: { match: Match; delay?: number }) {
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

  const isWinner = (teamScore: number, otherScore: number, status: string) => {
    if (status !== "COMPLETED") return false;
    return teamScore > otherScore;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-3 shadow-md min-w-[200px]"
      style={{
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Status */}
      <div className="flex justify-end mb-2">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
          style={{
            backgroundColor: getStatusColor(match.status),
            fontFamily: "Inter, sans-serif",
          }}
        >
          {match.status === "LIVE" && (
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
          )}
          {match.status}
        </span>
      </div>

      {/* Team 1 */}
      <div
        className="flex items-center justify-between py-2 px-2 rounded-lg mb-1"
        style={{
          backgroundColor: isWinner(match.score1, match.score2, match.status)
            ? "#E8F0FF"
            : "transparent",
        }}
      >
        <span
          className="text-sm truncate max-w-[120px]"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: isWinner(match.score1, match.score2, match.status) ? 600 : 400,
            color: "#1a1a1a",
          }}
        >
          {match.team1.name}
        </span>
        <span
          className="text-sm font-bold"
          style={{
            fontFamily: "Inter, sans-serif",
            color: isWinner(match.score1, match.score2, match.status) ? "#1a1a1a" : "#718096",
          }}
        >
          {match.score1}
        </span>
      </div>

      {/* Team 2 */}
      <div
        className="flex items-center justify-between py-2 px-2 rounded-lg"
        style={{
          backgroundColor: isWinner(match.score2, match.score1, match.status)
            ? "#E8F0FF"
            : "transparent",
        }}
      >
        <span
          className="text-sm truncate max-w-[120px]"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: isWinner(match.score2, match.score1, match.status) ? 600 : 400,
            color: "#1a1a1a",
          }}
        >
          {match.team2.name}
        </span>
        <span
          className="text-sm font-bold"
          style={{
            fontFamily: "Inter, sans-serif",
            color: isWinner(match.score2, match.score1, match.status) ? "#1a1a1a" : "#718096",
          }}
        >
          {match.score2}
        </span>
      </div>
    </motion.div>
  );
}

export function Bracket({ quarterfinals, semifinals, final, thirdPlace }: BracketProps) {
  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex items-center justify-center gap-8 min-w-[900px] px-8">
        {/* Quarterfinals */}
        <div className="flex flex-col gap-8">
          <h3
            className="text-center mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            Quarterfinals
          </h3>
          <div className="flex flex-col gap-16">
            {quarterfinals.map((match, idx) => (
              <BracketMatch key={match.id} match={match} delay={idx * 0.1} />
            ))}
          </div>
        </div>

        {/* Connector Lines */}
        <div className="flex flex-col gap-32 py-16">
          <div className="w-8 h-px" style={{ backgroundColor: "#e2e8f0" }} />
          <div className="w-8 h-px" style={{ backgroundColor: "#e2e8f0" }} />
        </div>

        {/* Semifinals */}
        <div className="flex flex-col gap-8">
          <h3
            className="text-center mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            Semifinals
          </h3>
          <div className="flex flex-col gap-32">
            {semifinals.length > 0 ? (
              semifinals.map((match, idx) => (
                <BracketMatch key={match.id} match={match} delay={0.4 + idx * 0.1} />
              ))
            ) : (
              <>
                <div className="bg-gray-100 rounded-xl p-3 min-w-[200px] h-[120px] flex items-center justify-center">
                  <span className="text-sm text-gray-400">TBD</span>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 min-w-[200px] h-[120px] flex items-center justify-center">
                  <span className="text-sm text-gray-400">TBD</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Connector Lines */}
        <div className="w-8 h-px" style={{ backgroundColor: "#e2e8f0" }} />

        {/* Final */}
        <div className="flex flex-col gap-8">
          <h3
            className="text-center mb-4"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            Final
          </h3>
          {final.length > 0 ? (
            <BracketMatch match={final[0]} delay={0.6} />
          ) : (
            <div className="bg-gray-100 rounded-xl p-3 min-w-[200px] h-[120px] flex items-center justify-center">
              <span className="text-sm text-gray-400">TBD</span>
            </div>
          )}

          {/* Third Place */}
          {thirdPlace.length > 0 && (
            <div className="mt-8">
              <h4
                className="text-center mb-4 text-sm"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  color: "#718096",
                }}
              >
                Third Place
              </h4>
              <BracketMatch match={thirdPlace[0]} delay={0.7} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
