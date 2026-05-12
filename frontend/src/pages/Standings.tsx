import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { SoccerHero } from "@/components/ui/soccer-hero";
import { Footer } from "@/components/ui/footer";
import { leaguesApi, StandingRow, League } from "@/lib/api";
import { RefreshCw } from "lucide-react";
import { fmtLastUpdatedShort } from "@/lib/utils";

// ─── Column definitions ──────────────────────────────────────────────────────

const COLS: { key: keyof StandingRow; label: string; title: string; hide?: boolean }[] = [
  { key: "gp",  label: "GP",  title: "Games Played" },
  { key: "w",   label: "W",   title: "Wins" },
  { key: "d",   label: "D",   title: "Draws" },
  { key: "l",   label: "L",   title: "Losses" },
  { key: "gf",  label: "GF",  title: "Goals For",       hide: true },
  { key: "ga",  label: "GA",  title: "Goals Against",   hide: true },
  { key: "gd",  label: "GD",  title: "Goal Difference" },
  { key: "pts", label: "PTS", title: "Points" },
];

const POSITION_STYLE = [
  { ring: "#F59E0B", bg: "bg-amber-50",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700" },
  { ring: "#9CA3AF", bg: "bg-gray-50",   text: "text-gray-600",   badge: "bg-gray-100  text-gray-600" },
  { ring: "#D97706", bg: "bg-orange-50", text: "text-orange-600", badge: "bg-orange-50 text-orange-600" },
];

// ─── Standings table ─────────────────────────────────────────────────────────

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
        <RefreshCw size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-400">No completed matches yet</p>
        <p className="text-xs text-gray-300 mt-1">Standings will appear here once results are recorded.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="w-10 px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</th>
            {COLS.map((c) => (
              <th
                key={c.key}
                title={c.title}
                className={`px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-help ${c.hide ? "hidden sm:table-cell" : ""}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const pos = POSITION_STYLE[idx] ?? null;
            return (
              <tr
                key={row.teamId}
                className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/80 ${idx < 3 ? pos!.bg : ""}`}
                style={pos ? { borderLeft: `3px solid ${pos.ring}` } : { borderLeft: "3px solid transparent" }}
              >
                {/* Position */}
                <td className="px-4 py-3.5 text-center">
                  {idx < 3 ? (
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${pos!.badge}`}>
                      {idx + 1}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 tabular-nums">{idx + 1}</span>
                  )}
                </td>

                {/* Team name */}
                <td className="px-4 py-3.5">
                  <span className={`font-semibold tracking-tight ${idx === 0 ? "text-gray-900 text-[15px]" : "text-gray-700"}`}>
                    {row.teamName}
                  </span>
                </td>

                {/* Stats */}
                {COLS.map((c) => {
                  const val = row[c.key] as number;
                  const isGd = c.key === "gd";
                  const isPts = c.key === "pts";
                  return (
                    <td
                      key={c.key}
                      className={`px-3 py-3.5 text-center tabular-nums ${c.hide ? "hidden sm:table-cell" : ""}`}
                    >
                      {isPts ? (
                        <span className="inline-flex items-center justify-center min-w-[32px] h-7 rounded-lg bg-gray-900 text-white text-xs font-bold px-2">
                          {val}
                        </span>
                      ) : isGd ? (
                        <span className={`text-sm font-semibold ${val > 0 ? "text-emerald-600" : val < 0 ? "text-red-500" : "text-gray-400"}`}>
                          {val > 0 ? `+${val}` : val}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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

  const { data: standings, isLoading: standingsLoading, dataUpdatedAt } = useQuery({
    queryKey: ["standings", activeLeague?.id],
    queryFn: () => leaguesApi.getStandings(activeLeague!.id),
    enabled: !!activeLeague,
    refetchInterval: 60_000,
  });

  const lastUpdated = dataUpdatedAt ? fmtLastUpdatedShort(dataUpdatedAt) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <SoccerHero
        title="Standings"
        subtitle="League tables updated after every completed match"
      />

      <section className="py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {leaguesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900" />
            </div>
          ) : !leagues || leagues.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-sm">No leagues have been created yet.</p>
            </div>
          ) : (
            <>
              {/* League selector */}
              <div className="flex flex-wrap gap-2 mb-8">
                {leagues.map((league) => {
                  const active = (activeLeague?.id ?? leagues[0]?.id) === league.id;
                  return (
                    <button
                      key={league.id}
                      onClick={() => setSelectedLeagueId(league.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                        active
                          ? "bg-gray-900 border-gray-900 text-white shadow-md"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {league.name}
                      {league.division && (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                          {league.division}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Table area */}
              {standingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900" />
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLeague?.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Table header row */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                          {activeLeague?.name}
                        </h2>
                        {activeLeague?.division && (
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {activeLeague.division}
                          </span>
                        )}
                      </div>
                      {lastUpdated && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Updated {lastUpdated}
                        </span>
                      )}
                    </div>

                    <StandingsTable rows={standings ?? []} />

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex flex-wrap gap-3">
                        {COLS.map(({ label, title }) => (
                          <span key={label} className="text-xs text-gray-400">
                            <strong className="text-gray-500 font-semibold">{label}</strong> {title}
                          </span>
                        ))}
                      </div>
                      <span className="ml-auto text-xs text-gray-400">W = 3 pts · D = 1 pt · L = 0 pts</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
