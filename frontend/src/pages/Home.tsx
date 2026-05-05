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
          { label: "Live Scores", href: "/live-scores" },
          { label: "Bracket", href: "/bracket" },
          { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
        ]}
        ctaButton={{
          label: "View Live Scores",
          onClick: () => navigate("/live-scores"),
        }}
        title={tournament?.name || "KDS Soccer Championship 2026"}
        subtitle={
          tournament?.description ||
          "Experience the thrill of competition as top teams battle for glory. Live scores, real-time brackets, and all the action you need."
        }
        primaryAction={{
          label: "View Live Scores",
          onClick: () => navigate("/live-scores"),
        }}
        secondaryAction={{
          label: "See Bracket",
          onClick: () => navigate("/bracket"),
        }}
        disclaimer="*Auto-refreshing live match scores"
        matches={matchCards}
      />

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section
          className="py-14 lg:py-20"
          style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 100%)" }}
        >
          <div className="container mx-auto px-6 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(24px, 3.5vw, 40px)",
                    color: "#1a1a1a",
                  }}
                >
                  Live Now
                </h2>
              </div>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#4a5568" }}>
                Watch the action unfold in real-time
              </p>
            </motion.div>
            <MatchTable matches={liveMatches} />
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="py-14 lg:py-20 bg-white">
          <div className="container mx-auto px-6 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 3.5vw, 40px)",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                Upcoming Matches
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#4a5568" }}>
                Don't miss these exciting matchups
              </p>
            </motion.div>

            <MatchTable matches={upcomingMatches} />

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10"
            >
              <button
                onClick={() => navigate("/live-scores")}
                className="px-8 py-3.5 rounded-full transition-all hover:scale-105"
                style={{
                  background: "#1a1a1a",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                View All Matches →
              </button>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
