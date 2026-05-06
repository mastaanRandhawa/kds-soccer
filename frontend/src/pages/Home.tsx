import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { MatchTable } from "@/components/ui/match-table";
import { matchesApi, mediaApi, tournamentsApi } from "@/lib/api";
import { motion } from "framer-motion";

export default function HomePage() {
  const navigate = useNavigate();

  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesApi.getAll(),
  });

  const { data: media } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.getAll(),
  });

  const { data: tournament } = useQuery({
    queryKey: ["tournament"],
    queryFn: () => tournamentsApi.getActive(),
    retry: false,
  });

  const liveMatches = matches?.filter((m) => m.status === "LIVE") || [];
  const upcomingMatches = matches?.filter((m) => m.status === "SCHEDULED").slice(0, 4) || [];

  // Gallery images for the hero carousel
  const matchCards = media?.slice(0, 5).map((m, idx) => ({
    image: m.imageUrl,
    category: m.category?.toUpperCase() || "TOURNAMENT",
    title: m.description || `Highlight ${idx + 1}`,
    onClick: () => {},
  })) || [
    {
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop",
      category: "STADIUM",
      title: "Championship Arena",
      onClick: () => {},
    },
    {
      image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=500&fit=crop",
      category: "CELEBRATION",
      title: "Victory Moments",
      onClick: () => {},
    },
    {
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=500&fit=crop",
      category: "ACTION",
      title: "Game Highlights",
      onClick: () => {},
    },
    {
      image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=400&h=500&fit=crop",
      category: "FANS",
      title: "Fan Energy",
      onClick: () => {},
    },
    {
      image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=500&fit=crop",
      category: "TEAMS",
      title: "Team Spirit",
      onClick: () => {},
    },
  ];

  return (
    <div className="min-h-screen">
      <SoccerHero
        logo="KDS Soccer"
        navigation={[
          { label: "Home", href: "/" },
          { label: "Schedule", href: "/schedule" },
          { label: "Standings", href: "/standings" },
          { label: "Bracket", href: "/bracket" },
          { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
        ]}
        ctaButton={{
          label: "View Schedule",
          onClick: () => navigate("/schedule"),
        }}
        title={tournament?.name || "KDS Soccer Championship 2026"}
        subtitle={
          tournament?.description ||
          "Experience the thrill of competition as top teams battle for glory. Full schedule, standings, and brackets — all in one place."
        }
        primaryAction={{
          label: "View Schedule",
          onClick: () => navigate("/schedule"),
        }}
        secondaryAction={{
          label: "See Bracket",
          onClick: () => navigate("/bracket"),
        }}
        disclaimer="*Scores updated in real-time"
        matches={matchCards}
      />

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-950">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-400">Live now</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Matches in Progress
              </h2>
            </motion.div>
            <MatchTable matches={liveMatches} />
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Schedule</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  Upcoming Matches
                </h2>
              </div>
              <button
                onClick={() => navigate("/schedule")}
                className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 hover:scale-105 transition-all"
                style={{ background: "#1a1a1a", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                Full Schedule →
              </button>
            </motion.div>

            <MatchTable matches={upcomingMatches} />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
