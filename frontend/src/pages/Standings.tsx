import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { leaguesApi, StandingRow, League } from "@/lib/api";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Schedule", href: "/schedule" },
  { label: "Standings", href: "/standings" },
  { label: "Bracket", href: "/bracket" },
  { label: "UFSA Rules", href: "https://usfa.ca/", external: true },
];

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  if (rows.length === 0) {
    return (
      <p style={{ fontFamily: "Inter, sans-serif", color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
        No completed matches yet — standings will appear here once results are recorded.
      </p>
    );
  }

  const cols: { key: keyof StandingRow; label: string; title: string }[] = [
    { key: "gp", label: "GP", title: "Games Played" },
    { key: "w",  label: "W",  title: "Wins" },
    { key: "d",  label: "D",  title: "Draws" },
    { key: "l",  label: "L",  title: "Losses" },
    { key: "gf", label: "GF", title: "Goals For" },
    { key: "ga", label: "GA", title: "Goals Against" },
    { key: "gd", label: "GD", title: "Goal Difference" },
    { key: "pts", label: "PTS", title: "Points" },
  ];

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
      <table className="w-full min-w-[520px]">
        <thead>
          <tr style={{ backgroundColor: "#F9FAFB" }}>
            <th
              className="px-4 py-3 text-left"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#718096", textTransform: "uppercase", whiteSpace: "nowrap" }}
            >
              #
            </th>
            <th
              className="px-4 py-3 text-left"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#718096", textTransform: "uppercase" }}
            >
              Team
            </th>
            {cols.map((c) => (
              <th
                key={c.key}
                title={c.title}
                className="px-3 py-3 text-center"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#718096", textTransform: "uppercase", whiteSpace: "nowrap", cursor: "help" }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.teamId}
              className="border-t"
              style={{
                borderColor: "#e2e8f0",
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafafa",
              }}
            >
              <td className="px-4 py-3 text-center">
                {idx === 0 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-amber-100 text-amber-700">1</span>
                ) : idx === 1 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-gray-100 text-gray-600">2</span>
                ) : idx === 2 ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-orange-50 text-orange-600">3</span>
                ) : (
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#9ca3af" }}>{idx + 1}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: idx === 0 ? 700 : 500,
                    color: "#1a1a1a",
                  }}
                >
                  {row.teamName}
                </span>
              </td>
              {cols.map((c) => (
                <td key={c.key} className="px-3 py-3 text-center">
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: c.key === "pts" ? 700 : 400,
                      color: c.key === "pts" ? "#1a1a1a" : c.key === "gd" && (row[c.key] as number) > 0 ? "#10B981" : c.key === "gd" && (row[c.key] as number) < 0 ? "#EF4444" : "#4a5568",
                    }}
                  >
                    {c.key === "gd" && (row[c.key] as number) > 0 ? `+${row[c.key]}` : row[c.key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StandingsPage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const { data: leagues, isLoading: leaguesLoading } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesApi.getAll(),
  });

  const activeLeague: League | null =
    selectedLeagueId
      ? (leagues?.find((l) => l.id === selectedLeagueId) ?? null)
      : (leagues?.[0] ?? null);

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ["standings", activeLeague?.id],
    queryFn: () => leaguesApi.getStandings(activeLeague!.id),
    enabled: !!activeLeague,
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen bg-white">
      <SoccerHero
        logo="KDS Soccer"
        navigation={NAV}
        title="Standings"
        subtitle="League tables updated after every completed match"
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
            League Standings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ fontFamily: "Inter, sans-serif", fontSize: "17px", color: "#4a5568" }}
          >
            Points · Goals · Win/Draw/Loss
          </motion.p>
        </div>
      </SoccerHero>

      <section className="py-10 lg:py-16">
        <div className="container mx-auto px-6 lg:px-16">

          {/* League selector tabs */}
          {leaguesLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-800" />
            </div>
          ) : !leagues || leagues.length === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ border: "1px dashed #e2e8f0" }}
            >
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", color: "#9ca3af" }}>
                No leagues have been created yet.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                {leagues.map((league) => {
                  const active = (activeLeague?.id ?? leagues[0]?.id) === league.id;
                  return (
                    <button
                      key={league.id}
                      onClick={() => setSelectedLeagueId(league.id)}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "100px",
                        border: "1.5px solid",
                        borderColor: active ? "#1a1a1a" : "#e5e7eb",
                        background: active ? "#1a1a1a" : "transparent",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: active ? "#ffffff" : "#4a5568",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {league.name}
                      {league.division && (
                        <span style={{ opacity: 0.7, marginLeft: "6px", fontSize: "11px" }}>
                          {league.division}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stats legend */}
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { abbr: "GP", full: "Games Played" },
                  { abbr: "W", full: "Wins" },
                  { abbr: "D", full: "Draws" },
                  { abbr: "L", full: "Losses" },
                  { abbr: "GF", full: "Goals For" },
                  { abbr: "GA", full: "Goals Against" },
                  { abbr: "GD", full: "Goal Difference" },
                  { abbr: "PTS", full: "Points" },
                ].map(({ abbr, full }) => (
                  <span key={abbr} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}>
                    <strong style={{ color: "#4a5568" }}>{abbr}</strong> = {full}
                  </span>
                ))}
              </div>

              {/* Table */}
              {standingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-800" />
                </div>
              ) : (
                <motion.div
                  key={activeLeague?.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {activeLeague && (
                    <div className="mb-4 flex items-baseline gap-3">
                      <h2
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          fontSize: "22px",
                          color: "#1a1a1a",
                        }}
                      >
                        {activeLeague.name}
                      </h2>
                      {activeLeague.division && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#E8F0FF", color: "#3B82F6", fontFamily: "Inter, sans-serif" }}
                        >
                          {activeLeague.division}
                        </span>
                      )}
                    </div>
                  )}
                  <StandingsTable rows={standings ?? []} />

                  <p
                    className="mt-3 text-right"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#9ca3af" }}
                  >
                    W = 3 pts · D = 1 pt · L = 0 pts · Auto-refreshes every 60s
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
