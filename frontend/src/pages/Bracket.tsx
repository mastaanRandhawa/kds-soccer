import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { Bracket as BracketView } from "@/components/ui/bracket";
import { matchesApi } from "@/lib/api";

export default function BracketPage() {
  const { data: bracket, isLoading } = useQuery({
    queryKey: ["bracket"],
    queryFn: () => matchesApi.getBracket(),
    refetchInterval: 30000,
  });

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
        title="Tournament Bracket"
        subtitle="Follow the journey to the championship"
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
              Tournament Bracket
            </h1>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "18px",
                color: "#4a5568",
              }}
            >
              Follow the journey to the championship
            </p>
          </motion.div>
        </div>
      </SoccerHero>

      {/* Bracket View */}
      <section className="py-12 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          ) : bracket ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BracketView
                quarterfinals={bracket.quarterfinals || []}
                semifinals={bracket.semifinals || []}
                final={bracket.final || []}
                thirdPlace={bracket.thirdPlace || []}
              />
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "18px",
                  color: "#718096",
                }}
              >
                Bracket data not available yet.
              </p>
            </div>
          )}

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#10B981" }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#4a5568",
                }}
              >
                Live
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#3B82F6" }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#4a5568",
                }}
              >
                Scheduled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#6B7280" }}
              />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#4a5568",
                }}
              >
                Completed
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
