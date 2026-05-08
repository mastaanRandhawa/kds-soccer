import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { leaguesApi, matchesApi, type League, type Match } from '@/lib/api'
import { SoccerHero } from '@/components/ui/soccer-hero'
import { Footer } from '@/components/ui/footer'
import { Layers, Calendar, MapPin, Search, CircleDot, X } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtTime(d: string) {
  const dt = new Date(d)
  return dt.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDay(d: string) {
  return new Date(d).toLocaleDateString('en-CA', { weekday: 'short' })
}
function fmtShortDate(d: string) {
  const dt = new Date(d)
  return `${dt.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`
}

function teamName(match: Match, side: 'home' | 'away') {
  if (side === 'home') return match.homePlaceholder ?? match.team1?.name ?? 'TBD'
  return match.awayPlaceholder ?? match.team2?.name ?? 'TBD'
}
function isPlaceholder(match: Match, side: 'home' | 'away') {
  return side === 'home' ? !!match.homePlaceholder : !!match.awayPlaceholder
}


const STATUS_META: Record<string, { label: string; color: string; dot: string }> = {
  SCHEDULED: { label: 'Upcoming', color: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  LIVE:       { label: 'Live',     color: 'bg-green-100 text-green-700',   dot: 'bg-green-500 animate-pulse' },
  COMPLETED:  { label: 'Final',    color: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400' },
}

// Division accent colours — understated palette
const DIV_COLORS: Record<number, { dot: string; badge: string; group: string; ring: string }> = {
  0: { dot: 'bg-blue-500',    badge: 'bg-blue-50    text-blue-700',    group: 'border-gray-100 bg-white',    ring: 'ring-gray-100' },
  1: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', group: 'border-gray-100 bg-white',    ring: 'ring-gray-100' },
  2: { dot: 'bg-amber-500',   badge: 'bg-amber-50   text-amber-700',   group: 'border-gray-100 bg-white',    ring: 'ring-gray-100' },
}
function divColor(idx: number) { return DIV_COLORS[idx % 3] }

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.SCHEDULED
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

function ScoreDisplay({ match }: { match: Match }) {
  if (match.status === 'COMPLETED' || match.status === 'LIVE') {
    return (
      <span className="font-mono font-bold text-sm text-gray-800">
        {match.score1} — {match.score2}
      </span>
    )
  }
  return <span className="text-gray-400 text-sm font-mono">vs</span>
}

// Desktop table row
function MatchRow({ match }: { match: Match }) {
  const homeIsPlaceholder = isPlaceholder(match, 'home')
  const awayIsPlaceholder = isPlaceholder(match, 'away')
  const home = teamName(match, 'home')
  const away = teamName(match, 'away')

  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70 transition-colors group">
      <td className="pl-4 pr-2 py-3 text-center w-10">
        {match.gameNumber != null && (
          <span className="text-xs font-mono text-gray-400 tabular-nums">#{match.gameNumber}</span>
        )}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        {match.matchDate ? (
          <div>
            <div className="text-xs font-semibold text-gray-700">{fmtDay(match.matchDate)}</div>
            <div className="text-xs text-gray-400">{fmtShortDate(match.matchDate)}</div>
          </div>
        ) : <span className="text-xs text-gray-300">—</span>}
      </td>
      <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap tabular-nums">
        {match.matchDate ? fmtTime(match.matchDate) : '—'}
      </td>
      <td className="px-3 py-3 text-right min-w-[120px]">
        <span className={`text-sm font-semibold tracking-tight ${homeIsPlaceholder ? 'text-gray-400 italic font-normal' : 'text-gray-900'}`}>
          {home}
        </span>
      </td>
      <td className="px-2 py-3 text-center w-20">
        <ScoreDisplay match={match} />
      </td>
      <td className="px-3 py-3 text-left min-w-[120px]">
        <span className={`text-sm font-semibold tracking-tight ${awayIsPlaceholder ? 'text-gray-400 italic font-normal' : 'text-gray-900'}`}>
          {away}
        </span>
      </td>
      <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap hidden lg:table-cell">
        {match.field ?? ''}
      </td>
      <td className="pr-4 pl-2 py-3">
        <StatusBadge status={match.status} />
      </td>
    </tr>
  )
}

// Mobile match card
function MatchCard({ match }: { match: Match }) {
  const home = teamName(match, 'home')
  const away = teamName(match, 'away')
  const homeIsPlaceholder = isPlaceholder(match, 'home')
  const awayIsPlaceholder = isPlaceholder(match, 'away')

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.gameNumber != null && (
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold inline-flex items-center justify-center">
              {match.gameNumber}
            </span>
          )}
          {match.matchDate && (
            <span className="text-xs text-gray-500">
              {fmtDate(match.matchDate)} · {fmtTime(match.matchDate)}
            </span>
          )}
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <span className={`font-semibold text-sm leading-tight ${homeIsPlaceholder ? 'text-gray-400 italic' : 'text-gray-900'}`}>
            {home}
          </span>
        </div>
        <div className="flex-shrink-0 w-14 text-center">
          <ScoreDisplay match={match} />
        </div>
        <div className="flex-1 text-left">
          <span className={`font-semibold text-sm leading-tight ${awayIsPlaceholder ? 'text-gray-400 italic' : 'text-gray-900'}`}>
            {away}
          </span>
        </div>
      </div>

      {match.field && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {match.field}
        </div>
      )}
    </div>
  )
}

// Match table with desktop/mobile switch
function MatchList({ matches, title }: { matches: Match[]; title?: string }) {
  if (matches.length === 0) return null
  return (
    <div>
      {title && (
        <div className="flex items-center gap-3 mb-3 mt-4">
          <span className="h-px flex-1 bg-gray-100" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">{title}</span>
          <span className="h-px flex-1 bg-gray-100" />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pl-4 pr-2 py-2 text-left w-10 text-[10px] font-semibold uppercase tracking-wider text-gray-400">#</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Day</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Time</th>
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Home</th>
              <th className="px-2 py-2 text-center w-20 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Score</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Away</th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">Field</th>
              <th className="pr-4 pl-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => <MatchRow key={m.id} match={m} />)}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {matches.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </div>
  )
}

// Group section card
function GroupSection({
  name,
  matches,
  colorClass,
}: {
  name: string
  matches: Match[]
  colorClass: ReturnType<typeof divColor>
}) {
  const teams = useMemo(() => {
    const seen = new Map<string, string>()
    matches.forEach((m) => {
      if (m.team1Id && m.team1) seen.set(m.team1Id, m.team1.name)
      if (m.team2Id && m.team2) seen.set(m.team2Id, m.team2.name)
    })
    return Array.from(seen.values())
  }, [matches])

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Group header */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${colorClass.dot}`} />
          <h3 className="font-bold text-gray-800 text-sm tracking-tight">{name}</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {matches.length} matches
          </span>
        </div>
      </div>

      {/* Team pills */}
      {teams.length > 0 && (
        <div className="px-5 py-2.5 flex flex-wrap gap-1.5 border-b border-gray-50 bg-gray-50/50">
          {teams.map((n) => (
            <span key={n} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-100 text-gray-600 shadow-sm">
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Matches */}
      <div className="px-1 pb-2">
        <MatchList matches={matches} />
      </div>
    </div>
  )
}

// Division section
function DivisionSection({
  league,
  allMatches,
  colorIdx,
}: {
  league: League
  allMatches: Match[]
  colorIdx: number
}) {
  const color = divColor(colorIdx)

  const leagueMatches = allMatches.filter((m) => m.leagueId === league.id)
  const groups = league.groups ?? []

  // Knockout = matches with null groupId and non-GROUP_STAGE round
  const knockoutMatches = leagueMatches.filter(
    (m) => !m.groupId && m.round !== 'GROUP_STAGE'
  )

  const semifinals = knockoutMatches.filter((m) => m.round === 'SEMIFINAL')
  const finals      = knockoutMatches.filter((m) => m.round === 'FINAL')
  const other       = knockoutMatches.filter((m) => m.round !== 'SEMIFINAL' && m.round !== 'FINAL')

  // League-level group stage matches (Over 52 has no groups)
  const ungroupedGroupStage = leagueMatches.filter(
    (m) => !m.groupId && m.round === 'GROUP_STAGE'
  )

  return (
    <section className="space-y-4">
      {/* Division header — clean dark bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-gray-900">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full shrink-0 ${color.dot}`} />
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{league.name}</h2>
          {league.division && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color.badge}`}>
              {league.division}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">{leagueMatches.length} matches</span>
          {groups.length > 0 && (
            <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">{groups.length} groups</span>
          )}
        </div>
      </div>

      {league.notes && (
        <p className="text-xs text-gray-400 leading-relaxed -mt-2 pl-6">{league.notes}</p>
      )}

      {/* Ungrouped pool play (Over 52) */}
      {ungroupedGroupStage.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${color.dot}`} />
            <h3 className="font-bold text-gray-800 text-sm tracking-tight">Pool Play</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
              {ungroupedGroupStage.length} matches
            </span>
          </div>
          <div className="px-1 pb-2">
            <MatchList matches={ungroupedGroupStage.sort((a, b) => (a.gameNumber ?? 0) - (b.gameNumber ?? 0))} />
          </div>
        </div>
      )}

      {/* Groups */}
      {groups.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {groups.map((group) => {
            const gMatches = leagueMatches
              .filter((m) => m.groupId === group.id)
              .sort((a, b) => (a.gameNumber ?? 0) - (b.gameNumber ?? 0))
            return (
              <GroupSection key={group.id} name={group.name} matches={gMatches} colorClass={color} />
            )
          })}
        </div>
      )}

      {/* Knockout rounds */}
      {knockoutMatches.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <h3 className="font-bold text-gray-800 text-sm tracking-tight">Knockout Rounds</h3>
          </div>
          <div className="px-1 pb-2">
            {other.length > 0 && (
              <MatchList matches={other.sort((a, b) => (a.gameNumber ?? 0) - (b.gameNumber ?? 0))} />
            )}
            {semifinals.length > 0 && (
              <MatchList
                matches={semifinals.sort((a, b) => (a.gameNumber ?? 0) - (b.gameNumber ?? 0))}
                title="Semi Finals"
              />
            )}
            {finals.length > 0 && (
              <MatchList
                matches={finals.sort((a, b) => (a.gameNumber ?? 0) - (b.gameNumber ?? 0))}
                title="Final"
              />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface Filters {
  division: string
  day: string
  field: string
  team: string
  status: string
}

function FilterSelect({
  icon,
  value,
  onChange,
  children,
}: {
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const active = !!value
  return (
    <div
      className="relative flex items-center shrink-0"
      style={{
        border: `1.5px solid ${active ? '#1a1a1a' : '#e5e7eb'}`,
        borderRadius: 10,
        background: active ? '#1a1a1a' : '#fff',
        height: 36,
        paddingLeft: 10,
        paddingRight: 4,
        minWidth: 130,
        maxWidth: 180,
      }}
    >
      <span className={`shrink-0 mr-1.5 ${active ? 'text-white' : 'text-gray-400'}`}>{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-sm font-medium pr-5 focus:outline-none w-full truncate [&>option]:bg-white [&>option]:text-gray-900"
        style={{ color: active ? '#fff' : '#374151', cursor: 'pointer' }}
      >
        {children}
      </select>
      <span className={`pointer-events-none absolute right-2 ${active ? 'text-white/70' : 'text-gray-400'}`}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  )
}

function FilterBar({
  leagues,
  allMatches,
  filters,
  onChange,
}: {
  leagues: League[]
  allMatches: Match[]
  filters: Filters
  onChange: (f: Filters) => void
}) {
  const fields = useMemo(() => {
    const s = new Set<string>()
    allMatches.forEach((m) => { if (m.field) s.add(m.field) })
    return Array.from(s).sort()
  }, [allMatches])

  const days = useMemo(() => {
    const s = new Set<string>()
    allMatches.forEach((m) => { if (m.matchDate) s.add(fmtDate(m.matchDate)) })
    return Array.from(s)
  }, [allMatches])

  const hasActive = !!(filters.division || filters.day || filters.field || filters.team || filters.status)
  const reset = () => onChange({ division: '', day: '', field: '', team: '', status: '' })

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">

          <FilterSelect icon={<Layers size={13} />} value={filters.division} onChange={(v) => onChange({ ...filters, division: v })}>
            <option value="">All Divisions</option>
            {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </FilterSelect>

          <FilterSelect icon={<Calendar size={13} />} value={filters.day} onChange={(v) => onChange({ ...filters, day: v })}>
            <option value="">All Days</option>
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </FilterSelect>

          <FilterSelect icon={<MapPin size={13} />} value={filters.field} onChange={(v) => onChange({ ...filters, field: v })}>
            <option value="">All Fields</option>
            {fields.map((f) => <option key={f} value={f}>{f}</option>)}
          </FilterSelect>

          <FilterSelect icon={<CircleDot size={13} />} value={filters.status} onChange={(v) => onChange({ ...filters, status: v })}>
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Upcoming</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
          </FilterSelect>

          {/* Team search */}
          <div
            className="relative flex items-center shrink-0"
            style={{
              border: `1.5px solid ${filters.team ? '#1a1a1a' : '#e5e7eb'}`,
              borderRadius: 10,
              background: filters.team ? '#1a1a1a' : '#fff',
              height: 36,
              paddingLeft: 10,
              minWidth: 150,
            }}
          >
            <Search size={13} className={`shrink-0 mr-1.5 ${filters.team ? 'text-white/70' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search team…"
              value={filters.team}
              onChange={(e) => onChange({ ...filters, team: e.target.value })}
              className="bg-transparent text-sm font-medium focus:outline-none w-full pr-3"
              style={{ color: filters.team ? '#fff' : '#374151' }}
            />
            {filters.team && (
              <button onClick={() => onChange({ ...filters, team: '' })} className="absolute right-2 text-white/60 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Reset chip */}
          {hasActive && (
            <button
              onClick={reset}
              className="flex items-center gap-1 shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              <X size={11} />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [filters, setFilters] = useState<Filters>({ division: '', day: '', field: '', team: '', status: '' })

  const { data: leagues = [], isLoading: leaguesLoading } = useQuery({
    queryKey: ['leagues-with-groups'],
    queryFn: () => leaguesApi.getAll({ includeGroups: true }),
    staleTime: 30_000,
  })

  const { data: allMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['all-matches'],
    queryFn: () => matchesApi.getAll(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const loading = leaguesLoading || matchesLoading

  // Apply filters to matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter((m) => {
      if (filters.division && m.leagueId !== filters.division) return false
      if (filters.day && m.matchDate && fmtDate(m.matchDate) !== filters.day) return false
      if (filters.field && m.field !== filters.field) return false
      if (filters.status && m.status !== filters.status) return false
      if (filters.team) {
        const q = filters.team.toLowerCase()
        const home = teamName(m, 'home').toLowerCase()
        const away = teamName(m, 'away').toLowerCase()
        if (!home.includes(q) && !away.includes(q)) return false
      }
      return true
    })
  }, [allMatches, filters])

  // Which leagues to show (hide empty after filtering)
  const visibleLeagues = useMemo(() => {
    if (filters.division) return leagues.filter((l) => l.id === filters.division)
    return leagues.filter((l) => filteredMatches.some((m) => m.leagueId === l.id))
  }, [leagues, filteredMatches, filters.division])

  const liveCount = allMatches.filter((m) => m.status === 'LIVE').length

  return (
    <div className="min-h-screen bg-gray-50">
      <SoccerHero
        title="Tournament Schedule"
        subtitle="View matches by division, group, stage, field, and time."
      />

      <FilterBar
        leagues={leagues}
        allMatches={allMatches}
        filters={filters}
        onChange={setFilters}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        {/* Summary bar */}
        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900 text-base">{filteredMatches.length}</span>
            {" "}matches
            {(filters.division || filters.team || filters.status || filters.field || filters.day) && (
              <span className="text-gray-400 ml-1">· filtered</span>
            )}
          </p>
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {liveCount} Live Now
            </span>
          )}
          <span className="ml-auto text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" /> Auto-refresh 30s
          </span>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-400">Loading schedule…</p>
          </div>
        ) : visibleLeagues.length === 0 ? (
          <div className="text-center py-24">
            <Search size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No matches found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-12">
            {visibleLeagues.map((league, idx) => (
              <DivisionSection
                key={league.id}
                league={league}
                allMatches={filteredMatches}
                colorIdx={idx}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
