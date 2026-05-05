import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { MatchCard } from "@/components/ui/match-card";
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
  });

  const liveMatches = matches?.filter((m) => m.status === "LIVE") || [];
  const upcomingMatches = matches?.filter((m) => m.status === "SCHEDULED").slice(0, 3) || [];

  const matchCards = media?.slice(0, 5).map((m, idx) => ({
    image: m.imageUrl,
    category: m.category?.toUpperCase() || "TOURNAMENT",
    title: m.description || `Match Moment ${idx + 1}`,
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
          { label: "UFSA Rules", href: "https://ufsa.com", external: true },
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
        disclaimer="*Stay updated with real-time match scores"
        socialProof={{
          avatars: [
            "https://i.pravatar.cc/150?img=11",
            "https://i.pravatar.cc/150?img=12",
            "https://i.pravatar.cc/150?img=13",
            "https://i.pravatar.cc/150?img=14",
          ],
          text: "Join thousands of fans watching",
        }}
        matches={matchCards}
      />

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <section
          className="py-16 lg:py-24"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #F5F9FF 100%)",
          }}
        >
          <div className="container mx-auto px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(28px, 4vw, 48px)",
                    color: "#1a1a1a",
                  }}
                >
                  Live Now
                </h2>
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  color: "#4a5568",
                }}
              >
                Watch the action unfold in real-time
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-8 lg:px-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(28px, 4vw, 48px)",
                  color: "#1a1a1a",
                }}
              >
                Upcoming Matches
              </h2>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  color: "#4a5568",
                  marginTop: "16px",
                }}
              >
                Don't miss these exciting matchups
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <button
                onClick={() => navigate("/live-scores")}
                className="px-8 py-4 rounded-full transition-all hover:scale-105"
                style={{
                  background: "#1a1a1a",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                }}
              >
                View All Matches
              </button>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
