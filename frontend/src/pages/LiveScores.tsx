import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { MatchCard } from "@/components/ui/match-card";
import { matchesApi } from "@/lib/api";

type MatchFilter = "all" | "live" | "upcoming" | "completed";

export default function LiveScoresPage() {
  const [filter, setFilter] = useState<MatchFilter>("all");

  const { data: matches, refetch } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesApi.getAll(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const filteredMatches = matches?.filter((match) => {
    switch (filter) {
      case "live":
        return match.status === "LIVE";
      case "upcoming":
        return match.status === "SCHEDULED";
      case "completed":
        return match.status === "COMPLETED";
      default:
        return true;
    }
  }) || [];

  const liveCount = matches?.filter((m) => m.status === "LIVE").length || 0;

  const filterButtons: { label: string; value: MatchFilter }[] = [
    { label: "All Matches", value: "all" },
    { label: `Live (${liveCount})`, value: "live" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div className="min-h-screen">
      <SoccerHero
        logo="KDS Soccer"
        navigation={[
          { label: "Home", href: "/" },
          { label: "Live Scores", href: "/live-scores" },
          { label: "Bracket", href: "/bracket" },
          { label: "UFSA Rules", href: "https://ufsa.com", external: true },
        ]}
        title="Live Scores"
        subtitle="Stay updated with real-time match scores. Auto-refreshes every 30 seconds."
        className="min-h-[50vh]"
      >
        <div className="w-full max-w-6xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(36px, 6vw, 56px)",
                color: "#1a1a1a",
                marginBottom: "16px",
              }}
            >
              Live Scores
            </h1>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                color: "#4a5568",
              }}
            >
              Stay updated with real-time match scores
            </p>
          </motion.div>
        </div>
      </SoccerHero>

      {/* Filters and Matches */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-8 lg:px-16">
          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className="px-6 py-3 rounded-full transition-all"
                style={{
                  background: filter === btn.value ? "#1a1a1a" : "transparent",
                  border: "1px solid #e2e8f0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: filter === btn.value ? "#FFFFFF" : "#4a5568",
                }}
              >
                {btn.label}
              </button>
            ))}
          </motion.div>

          {/* Auto-refresh indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#10B981" }}
            />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                color: "#718096",
              }}
            >
              Auto-refreshing every 30 seconds
            </span>
          </motion.div>

          {/* Matches Grid */}
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  color: "#718096",
                }}
              >
                No matches found for the selected filter.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
