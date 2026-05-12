import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { leaguesApi, matchesApi, groupsApi, teamsApi, Match, Group } from "@/lib/api";
import { toLocalInputValue, fromLocalInputValue, fmtShortDate, fmtTime } from "@/lib/utils";
import {
  ArrowLeft, Plus, Edit2, Trash2, Trophy, ChevronDown, ChevronUp,
  Layers, Calendar, Users, X, Zap, AlertCircle,
} from "lucide-react";
import { AdminHeader } from "@/components/ui/admin-header";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUNDS = [
  { value: "GROUP_STAGE",  label: "Group Stage" },
  { value: "ROUND_OF_16", label: "Round of 16" },
  { value: "QUARTERFINAL", label: "Quarter-Final" },
  { value: "SEMIFINAL",   label: "Semi-Final" },
  { value: "THIRD_PLACE", label: "3rd Place" },
  { value: "FINAL",       label: "Final" },
] as const;

const STATUSES = [
  { value: "SCHEDULED", label: "Scheduled", color: "#6B7280" },
  { value: "LIVE",      label: "Live",      color: "#EF4444" },
  { value: "COMPLETED", label: "Completed", color: "#10B981" },
] as const;

const KNOCKOUT_ROUNDS = ["ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "THIRD_PLACE", "FINAL"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchForm {
  groupId: string;
  round: string;
  team1Id: string;
  team2Id: string;
  homePlaceholder: string;
  awayPlaceholder: string;
  useHomePlaceholder: boolean;
  useAwayPlaceholder: boolean;
  gameNumber: string;
  matchDate: string;
  field: string;
  status: string;
  notes: string;
}

const emptyForm = (groupId = "", round = "GROUP_STAGE"): MatchForm => ({
  groupId,
  round,
  team1Id: "",
  team2Id: "",
  homePlaceholder: "",
  awayPlaceholder: "",
  useHomePlaceholder: false,
  useAwayPlaceholder: false,
  gameNumber: "",
  matchDate: "",
  field: "",
  status: "SCHEDULED",
  notes: "",
});

// ─── Score Editor ─────────────────────────────────────────────────────────────

function ScoreEditor({ match, onClose }: { match: Match; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [score1, setScore1] = useState(String(match.score1));
  const [score2, setScore2] = useState(String(match.score2));
  const [status, setStatus] = useState(match.status);

  const mutation = useMutation({
    mutationFn: () => matchesApi.updateScore(match.id, {
      score1: Number(score1),
      score2: Number(score2),
      status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", match.leagueId] });
      onClose();
    },
  });

  const home = match.homePlaceholder ?? match.team1?.name ?? "Home";
  const away = match.awayPlaceholder ?? match.team2?.name ?? "Away";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-base">Update Score</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500 mb-1 truncate">{home}</p>
          <input
            type="number"
            min={0}
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
            className="w-full text-3xl font-bold text-center border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-2xl font-bold text-gray-300 pb-5">–</span>
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-500 mb-1 truncate">{away}</p>
          <input
            type="number"
            min={0}
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
            className="w-full text-3xl font-bold text-center border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Match Status</label>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={
                status === s.value
                  ? { background: s.color, color: "#fff", borderColor: s.color }
                  : { background: "#fff", color: "#6B7280", borderColor: "#E5E7EB" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {mutation.error && (
        <p className="text-xs text-red-500 mb-3">
          {(mutation.error as any)?.response?.data?.error ?? "Failed to save."}
        </p>
      )}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="w-full py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "#1a1a1a" }}
      >
        {mutation.isPending ? "Saving…" : "Save Score"}
      </button>
    </motion.div>
  );
}

// ─── Match Row ────────────────────────────────────────────────────────────────

function MatchRow({
  match,
  onEdit,
  onDelete,
  onScore,
}: {
  match: Match;
  onEdit: (m: Match) => void;
  onDelete: (id: string) => void;
  onScore: (m: Match) => void;
}) {
  const home = match.homePlaceholder ?? match.team1?.name ?? "TBD";
  const away = match.awayPlaceholder ?? match.team2?.name ?? "TBD";
  const statusInfo = STATUSES.find((s) => s.value === match.status) ?? STATUSES[0];

  const dateStr = match.matchDate
    ? `${fmtShortDate(match.matchDate)} ${fmtTime(match.matchDate)}`
    : "–";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-3 px-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      {/* Game # */}
      {match.gameNumber != null && (
        <span className="text-xs font-mono text-gray-400 w-6 shrink-0 hidden sm:block">
          #{match.gameNumber}
        </span>
      )}

      {/* Teams */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Mobile game number */}
        {match.gameNumber != null && (
          <span className="text-xs font-mono text-gray-400 sm:hidden">#{match.gameNumber}</span>
        )}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <TeamBadge name={home} isPlaceholder={!match.team1Id} />
          <div className="flex items-center gap-1 shrink-0 px-1">
            {match.status === "COMPLETED" || match.status === "LIVE" ? (
              <span className="text-sm font-bold text-gray-900">
                {match.score1} – {match.score2}
              </span>
            ) : (
              <span className="text-xs text-gray-300 font-medium">vs</span>
            )}
          </div>
          <TeamBadge name={away} isPlaceholder={!match.team2Id} right />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <span className="text-xs text-gray-400">{dateStr}</span>
        {match.field && <span className="text-xs text-gray-400 hidden sm:inline">· {match.field}</span>}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            background: statusInfo.color + "18",
            color: statusInfo.color,
          }}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onScore(match)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
          title="Update score"
        >
          <Zap size={14} />
        </button>
        <button
          onClick={() => onEdit(match)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          title="Edit match"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete(match.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete match"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function TeamBadge({ name, isPlaceholder, right }: { name: string; isPlaceholder: boolean; right?: boolean }) {
  return (
    <span
      className={`text-sm font-medium truncate max-w-[110px] sm:max-w-[150px] ${right ? "text-right" : "text-left"} ${isPlaceholder ? "text-gray-400 italic" : "text-gray-900"}`}
    >
      {name}
    </span>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────

function Section({
  title,
  matches,
  onAddMatch,
  onEditMatch,
  onDeleteMatch,
  onScoreMatch,
  accent,
}: {
  title: string;
  matches: Match[];
  onAddMatch: () => void;
  onEditMatch: (m: Match) => void;
  onDeleteMatch: (id: string) => void;
  onScoreMatch: (m: Match) => void;
  accent?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2.5">
          {accent && (
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: accent }} />
          )}
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {matches.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onAddMatch(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-gray-100 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <Plus size={12} />
            Add Match
          </button>
          {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
        </div>
      </div>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {matches.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No matches yet.{" "}
                <button onClick={onAddMatch} className="text-blue-500 hover:underline">
                  Add one →
                </button>
              </div>
            ) : (
              matches.map((m) => (
                <MatchRow
                  key={m.id}
                  match={m}
                  onEdit={onEditMatch}
                  onDelete={onDeleteMatch}
                  onScore={onScoreMatch}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  // Modals
  const [matchModal, setMatchModal] = useState<{
    open: boolean;
    editing?: Match;
    defaultGroupId?: string;
    defaultRound?: string;
  }>({ open: false });
  const [form, setForm] = useState<MatchForm>(emptyForm());
  const [scoreTarget, setScoreTarget] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Group management
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");

  // ─── Data ───────────────────────────────────────────────────────────────────

  const { data: league, isLoading, error } = useQuery({
    queryKey: ["league", id],
    queryFn: () => leaguesApi.getById(id!),
    enabled: !!id,
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.getAll(),
  });

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const groups = league?.groups ?? [];
  const matches = league?.matches ?? [];

  const groupStageByGroup = useMemo(() => {
    const byGroup: Record<string, Match[]> = {};
    const ungrouped: Match[] = [];
    for (const m of matches) {
      if (m.round !== "GROUP_STAGE") continue;
      if (m.groupId) {
        byGroup[m.groupId] = [...(byGroup[m.groupId] ?? []), m];
      } else {
        ungrouped.push(m);
      }
    }
    return { byGroup, ungrouped };
  }, [matches]);

  const knockoutByRound = useMemo(() => {
    const result: Record<string, Match[]> = {};
    for (const round of KNOCKOUT_ROUNDS) {
      result[round] = matches.filter((m) => m.round === round);
    }
    return result;
  }, [matches]);

  const hasKnockout = KNOCKOUT_ROUNDS.some((r) => knockoutByRound[r]?.length > 0);

  const uniqueTeams = useMemo(() => {
    const ids = new Set<string>();
    for (const m of matches) {
      if (m.team1Id) ids.add(m.team1Id);
      if (m.team2Id) ids.add(m.team2Id);
    }
    return ids.size;
  }, [matches]);

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const createMatch = useMutation({
    mutationFn: (data: Record<string, unknown>) => matchesApi.create(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      closeMatchModal();
    },
  });

  const updateMatch = useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: Record<string, unknown> }) =>
      matchesApi.update(matchId, data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      closeMatchModal();
    },
  });

  const deleteMatch = useMutation({
    mutationFn: (matchId: string) => matchesApi.delete(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      setDeleteTarget(null);
    },
  });

  const createGroup = useMutation({
    mutationFn: (name: string) => groupsApi.create({ leagueId: id!, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      setGroupModalOpen(false);
      setGroupName("");
    },
  });

  const updateGroup = useMutation({
    mutationFn: ({ groupId, name }: { groupId: string; name: string }) =>
      groupsApi.update(groupId, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      setGroupModalOpen(false);
      setEditingGroup(null);
      setGroupName("");
    },
  });


  // ─── Handlers ────────────────────────────────────────────────────────────────

  const openAddMatch = (groupId?: string, round?: string) => {
    setForm(emptyForm(groupId ?? "", round ?? (groupId ? "GROUP_STAGE" : "SEMIFINAL")));
    setMatchModal({ open: true, defaultGroupId: groupId, defaultRound: round });
  };

  const openEditMatch = (m: Match) => {
    setForm({
      groupId: m.groupId ?? "",
      round: m.round,
      team1Id: m.team1Id ?? "",
      team2Id: m.team2Id ?? "",
      homePlaceholder: m.homePlaceholder ?? "",
      awayPlaceholder: m.awayPlaceholder ?? "",
      useHomePlaceholder: !m.team1Id,
      useAwayPlaceholder: !m.team2Id,
      gameNumber: m.gameNumber != null ? String(m.gameNumber) : "",
      matchDate: m.matchDate ? toLocalInputValue(m.matchDate) : "",
      field: m.field ?? "",
      status: m.status,
      notes: m.notes ?? "",
    });
    setMatchModal({ open: true, editing: m });
  };

  const closeMatchModal = () => {
    setMatchModal({ open: false });
    setForm(emptyForm());
  };

  const submitMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {
      leagueId: id,
      round: form.round,
      groupId: form.groupId || null,
      gameNumber: form.gameNumber ? Number(form.gameNumber) : null,
      matchDate: form.matchDate ? fromLocalInputValue(form.matchDate) : null,
      field: form.field || null,
      status: form.status,
      notes: form.notes || null,
      team1Id: form.useHomePlaceholder ? null : (form.team1Id || null),
      team2Id: form.useAwayPlaceholder ? null : (form.team2Id || null),
      homePlaceholder: form.useHomePlaceholder ? (form.homePlaceholder || null) : null,
      awayPlaceholder: form.useAwayPlaceholder ? (form.awayPlaceholder || null) : null,
    };
    if (matchModal.editing) {
      updateMatch.mutate({ matchId: matchModal.editing.id, data });
    } else {
      createMatch.mutate(data);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 text-red-500">
        <AlertCircle size={32} />
        <p className="text-sm">League not found or failed to load.</p>
        <Link to="/admin/leagues" className="text-sm text-blue-500 hover:underline">← Back to Leagues</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={() => { logout(); navigate("/admin/login"); }} />

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-10 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6"
        >
          <div className="flex items-start gap-3">
            <Link to="/admin/leagues" className="p-2 rounded-lg hover:bg-gray-200 transition-colors shrink-0 mt-0.5">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{league.name}</h1>
                {league.division && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    {league.division}
                  </span>
                )}
              </div>
              {league.notes && (
                <p className="text-sm text-gray-400 mt-0.5">{league.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => openAddMatch()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white"
              style={{ background: "#1a1a1a" }}
            >
              <Plus size={14} />
              Add Match
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Matches", value: matches.length, icon: <Calendar size={14} /> },
            { label: "Groups", value: groups.length, icon: <Layers size={14} /> },
            { label: "Teams", value: uniqueTeams, icon: <Users size={14} /> },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 sm:p-4 flex items-center gap-2.5 border border-gray-100 shadow-sm">
              <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 shrink-0">{s.icon}</div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Group management bar */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Group Stage</h2>
          <button
            onClick={() => { setEditingGroup(null); setGroupName(""); setGroupModalOpen(true); }}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus size={11} />
            Add Group
          </button>
        </div>

        {/* Groups */}
        {groups.length === 0 && groupStageByGroup.ungrouped.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-center mb-4">
            <Layers size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">No groups yet. Add a group or add matches directly.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setEditingGroup(null); setGroupName(""); setGroupModalOpen(true); }}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                + Add Group
              </button>
              <button
                onClick={() => openAddMatch("", "GROUP_STAGE")}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                + Add Match
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {groups.map((group, gi) => {
              const groupMatches = groupStageByGroup.byGroup[group.id] ?? [];
              const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];
              return (
                <Section
                  key={group.id}
                  title={group.name}
                  matches={groupMatches}
                  onAddMatch={() => openAddMatch(group.id, "GROUP_STAGE")}
                  onEditMatch={openEditMatch}
                  onDeleteMatch={setDeleteTarget}
                  onScoreMatch={setScoreTarget}
                  accent={colors[gi % colors.length]}
                />
              );
            })}
            {groupStageByGroup.ungrouped.length > 0 && (
              <Section
                title="Group Stage (ungrouped)"
                matches={groupStageByGroup.ungrouped}
                onAddMatch={() => openAddMatch("", "GROUP_STAGE")}
                onEditMatch={openEditMatch}
                onDeleteMatch={setDeleteTarget}
                onScoreMatch={setScoreTarget}
              />
            )}
          </div>
        )}

        {/* Knockout Rounds */}
        <div className="flex items-center justify-between mb-3 mt-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Knockout Rounds</h2>
          <button
            onClick={() => openAddMatch("", "SEMIFINAL")}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Plus size={11} />
            Add Knockout Match
          </button>
        </div>

        {!hasKnockout ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-center">
            <Trophy size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-3">No knockout matches yet.</p>
            <button
              onClick={() => openAddMatch("", "SEMIFINAL")}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              + Add Knockout Match
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ROUNDS.filter((r) => r.value !== "GROUP_STAGE").map((r) => {
              const roundMatches = knockoutByRound[r.value] ?? [];
              if (roundMatches.length === 0) return null;
              return (
                <Section
                  key={r.value}
                  title={r.label}
                  matches={roundMatches}
                  onAddMatch={() => openAddMatch("", r.value)}
                  onEditMatch={openEditMatch}
                  onDeleteMatch={setDeleteTarget}
                  onScoreMatch={setScoreTarget}
                  accent="#F59E0B"
                />
              );
            })}
          </div>
        )}
      </main>

      {/* ── Match Add/Edit Modal ──────────────────────────────────────────────── */}
      {matchModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {matchModal.editing ? "Edit Match" : "Add Match"}
              </h2>
              <button onClick={closeMatchModal} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={submitMatch} className="space-y-4">
              {/* Round & Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Round *</label>
                  <select
                    value={form.round}
                    onChange={(e) => setForm({ ...form, round: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROUNDS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Group</label>
                  <select
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— No group —</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Home team */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">Home Team</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.useHomePlaceholder}
                      onChange={(e) => setForm({ ...form, useHomePlaceholder: e.target.checked, team1Id: "" })}
                      className="rounded"
                    />
                    Use placeholder text
                  </label>
                </div>
                {form.useHomePlaceholder ? (
                  <input
                    type="text"
                    value={form.homePlaceholder}
                    onChange={(e) => setForm({ ...form, homePlaceholder: e.target.value })}
                    placeholder='e.g. "Winner of Game 4"'
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={form.team1Id}
                    onChange={(e) => setForm({ ...form, team1Id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select team —</option>
                    {teams?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Away team */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-gray-600">Away Team</label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.useAwayPlaceholder}
                      onChange={(e) => setForm({ ...form, useAwayPlaceholder: e.target.checked, team2Id: "" })}
                      className="rounded"
                    />
                    Use placeholder text
                  </label>
                </div>
                {form.useAwayPlaceholder ? (
                  <input
                    type="text"
                    value={form.awayPlaceholder}
                    onChange={(e) => setForm({ ...form, awayPlaceholder: e.target.value })}
                    placeholder='e.g. "Loser of Game 3"'
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={form.team2Id}
                    onChange={(e) => setForm({ ...form, team2Id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select team —</option>
                    {teams?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Game # / Date / Field */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Game #</label>
                  <input
                    type="number"
                    value={form.gameNumber}
                    onChange={(e) => setForm({ ...form, gameNumber: e.target.value })}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Field</label>
                  <input
                    type="text"
                    value={form.field}
                    onChange={(e) => setForm({ ...form, field: e.target.value })}
                    placeholder="e.g. Field 1"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={form.matchDate}
                    onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional internal note"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(createMatch.error || updateMatch.error) && (
                <p className="text-xs text-red-500">
                  {(createMatch.error as any)?.response?.data?.error ??
                    (updateMatch.error as any)?.response?.data?.error ??
                    "Something went wrong."}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeMatchModal}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMatch.isPending || updateMatch.isPending}
                  className="flex-1 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "#1a1a1a" }}
                >
                  {createMatch.isPending || updateMatch.isPending
                    ? "Saving…"
                    : matchModal.editing ? "Save Changes" : "Add Match"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── Score Modal ──────────────────────────────────────────────────────── */}
      {scoreTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ScoreEditor match={scoreTarget} onClose={() => setScoreTarget(null)} />
        </div>
      )}

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900">Delete Match?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">This match will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMatch.mutate(deleteTarget)}
                disabled={deleteMatch.isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMatch.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Add/Edit Group Modal ─────────────────────────────────────────────── */}
      {groupModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="font-bold text-gray-900 mb-4">
              {editingGroup ? "Rename Group" : "Add Group"}
            </h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Group A"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setGroupModalOpen(false); setEditingGroup(null); setGroupName(""); }}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!groupName.trim()) return;
                  if (editingGroup) {
                    updateGroup.mutate({ groupId: editingGroup.id, name: groupName.trim() });
                  } else {
                    createGroup.mutate(groupName.trim());
                  }
                }}
                disabled={!groupName.trim() || createGroup.isPending || updateGroup.isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "#1a1a1a" }}
              >
                {createGroup.isPending || updateGroup.isPending ? "Saving…" : editingGroup ? "Rename" : "Add Group"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
