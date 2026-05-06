import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { Bracket as BracketView } from "@/components/ui/bracket";
import { MatchTable } from "@/components/ui/match-table";
import { matchesApi, leaguesApi, League } from "@/lib/api";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Live Scores", href: "/live-scores" },
  { label: "Standings", href: "/standings" },
  { label: "Bracket", href: "/bracket" },
  { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
];

type ViewMode = "bracket" | "table";

export default function BracketPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("bracket");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesApi.getAll(),
  });

  const activeLeague: League | null =
    selectedLeagueId
      ? (leagues?.find((l) => l.id === selectedLeagueId) ?? null)
      : (leagues?.[0] ?? null);

  const { data: bracket, isLoading: bracketLoading } = useQuery({
    queryKey: ["bracket", activeLeague?.id],
    queryFn: () =>
      activeLeague
        ? leaguesApi.getBracket(activeLeague.id)
        : matchesApi.getBracket(),
    refetchInterval: 30_000,
  });

  const { data: allMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", activeLeague?.id],
    queryFn: () =>
      matchesApi.getAll(activeLeague ? { leagueId: activeLeague.id } : undefined),
    refetchInterval: 30_000,
  });

  const isLoading = bracketLoading || matchesLoading;

  return (
    <div className="min-h-screen bg-white">
      <SoccerHero
        logo="KDS Soccer"
        navigation={NAV}
        title="Tournament Bracket"
        subtitle="Follow the journey to the championship"
        className="min-h-[44vh]"
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
            Tournament Bracket
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "#4a5568" }}
          >
            Follow the journey to the championship
          </motion.p>
        </div>
      </SoccerHero>

      <section className="py-10 lg:py-16">
        <div className="container mx-auto px-6 lg:px-16">

          {/* League selector */}
          {leagues && leagues.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedLeagueId(null)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "100px",
                  border: "1.5px solid",
                  borderColor: !selectedLeagueId && !activeLeague ? "#1a1a1a" : "#e5e7eb",
                  background: !selectedLeagueId && !activeLeague ? "#1a1a1a" : "transparent",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: !selectedLeagueId && !activeLeague ? "#ffffff" : "#4a5568",
                  cursor: "pointer",
                }}
              >
                All
              </button>
              {leagues.map((league) => {
                const active = (selectedLeagueId ?? leagues[0]?.id) === league.id;
                return (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeagueId(league.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "100px",
                      border: "1.5px solid",
                      borderColor: active ? "#1a1a1a" : "#e5e7eb",
                      background: active ? "#1a1a1a" : "transparent",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: active ? "#ffffff" : "#4a5568",
                      cursor: "pointer",
                    }}
                  >
                    {league.name}
                    {league.division && (
                      <span style={{ opacity: 0.7, marginLeft: "5px", fontSize: "11px" }}>
                        {league.division}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-3 mb-8">
            {(["bracket", "table"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="transition-all hover:scale-105"
                style={{
                  padding: "8px 20px",
                  borderRadius: "100px",
                  border: "1.5px solid",
                  borderColor: viewMode === mode ? "#1a1a1a" : "#e5e7eb",
                  background: viewMode === mode ? "#1a1a1a" : "transparent",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: viewMode === mode ? "#ffffff" : "#4a5568",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {mode === "bracket" ? "Visual Bracket" : "Match Table"}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}>
                Auto-refreshing every 30s
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800" />
            </div>
          ) : viewMode === "bracket" ? (
            <>
              {bracket ? (
                <motion.div key={activeLeague?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <BracketView
                    quarterfinals={bracket.quarterfinals ?? []}
                    semifinals={bracket.semifinals ?? []}
                    final={bracket.final ?? []}
                    thirdPlace={bracket.thirdPlace ?? []}
                  />
                </motion.div>
              ) : (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#9ca3af", textAlign: "center", padding: "48px 0" }}>
                  Bracket data not available yet.
                </p>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex flex-wrap gap-5"
              >
                {[
                  { color: "#10B981", label: "Live" },
                  { color: "#3b82f6", label: "Scheduled" },
                  { color: "#6b7280", label: "Completed" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: color, display: "inline-block" }} />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6b7280" }}>{label}</span>
                  </div>
                ))}
              </motion.div>
            </>
          ) : (
            <motion.div key={activeLeague?.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <MatchTable
                matches={allMatches ?? []}
                emptyMessage="No matches available yet."
              />
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
