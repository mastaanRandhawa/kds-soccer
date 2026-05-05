import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { MatchTable } from "@/components/ui/match-table";
import { matchesApi } from "@/lib/api";

type MatchFilter = "all" | "live" | "upcoming" | "completed";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Live Scores", href: "/live-scores" },
  { label: "Bracket", href: "/bracket" },
  { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
];

export default function LiveScoresPage() {
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [roundFilter, setRoundFilter] = useState<string>("all");

  const { data: matches, dataUpdatedAt } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesApi.getAll(),
    refetchInterval: 30_000,
  });

  const liveCount = matches?.filter((m) => m.status === "LIVE").length ?? 0;
  const upcomingCount = matches?.filter((m) => m.status === "SCHEDULED").length ?? 0;
  const completedCount = matches?.filter((m) => m.status === "COMPLETED").length ?? 0;

  // Unique rounds available
  const allRounds = [...new Set(matches?.map((m) => m.round) ?? [])].sort();

  const filteredMatches =
    matches?.filter((match) => {
      const statusOk =
        filter === "all"
          ? true
          : filter === "live"
          ? match.status === "LIVE"
          : filter === "upcoming"
          ? match.status === "SCHEDULED"
          : match.status === "COMPLETED";

      const roundOk = roundFilter === "all" || match.round === roundFilter;
      return statusOk && roundOk;
    }) ?? [];

  const filterButtons: { label: string; value: MatchFilter; count?: number }[] = [
    { label: "All", value: "all", count: matches?.length },
    { label: "Live", value: "live", count: liveCount },
    { label: "Upcoming", value: "upcoming", count: upcomingCount },
    { label: "Completed", value: "completed", count: completedCount },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Compact header-only hero */}
      <SoccerHero
        logo="KDS Soccer"
        navigation={NAV}
        title="Match Scores"
        subtitle="Live and upcoming fixtures — auto-refreshes every 30 seconds"
        className="min-h-[46vh]"
      >
        <div className="w-full max-w-3xl mx-auto px-6 py-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 52px)",
              color: "#1a1a1a",
              marginBottom: "12px",
            }}
          >
            Match Scores
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "#4a5568" }}
          >
            Live and upcoming fixtures
          </motion.p>
        </div>
      </SoccerHero>

      {/* Content */}
      <section className="py-10 lg:py-16">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Filter toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Status filter */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className="transition-all hover:scale-105 active:scale-95"
                  style={{
                    padding: "8px 18px",
                    borderRadius: "100px",
                    border: "1.5px solid",
                    borderColor: filter === btn.value ? "#1a1a1a" : "#e5e7eb",
                    background: filter === btn.value ? "#1a1a1a" : "transparent",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: filter === btn.value ? "#ffffff" : "#4a5568",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {btn.value === "live" && filter !== "live" && liveCount > 0 && (
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block" }} />
                  )}
                  {btn.label}
                  {btn.count !== undefined && btn.count > 0 && (
                    <span
                      style={{
                        background: filter === btn.value ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                        color: filter === btn.value ? "#ffffff" : "#6b7280",
                        borderRadius: "100px",
                        padding: "1px 7px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {btn.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Round filter */}
            {allRounds.length > 1 && (
              <select
                value={roundFilter}
                onChange={(e) => setRoundFilter(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "100px",
                  border: "1.5px solid #e5e7eb",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#4a5568",
                  backgroundColor: "white",
                  cursor: "pointer",
                  appearance: "none",
                  paddingRight: "32px",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                }}
              >
                <option value="all">All Rounds</option>
                {allRounds.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}>
              Auto-refreshing · Last updated {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
            </span>
          </div>

          {/* Match table */}
          <MatchTable
            matches={filteredMatches}
            emptyMessage="No matches match the selected filters."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
