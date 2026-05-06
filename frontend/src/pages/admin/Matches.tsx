import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { matchesApi, teamsApi, Match } from "@/lib/api";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/ui/admin-header";
import { leaguesApi } from "@/lib/api";

const ROUNDS = [
  "GROUP_STAGE",
  "ROUND_OF_16",
  "QUARTERFINAL",
  "SEMIFINAL",
  "THIRD_PLACE",
  "FINAL",
];

const STATUSES = ["SCHEDULED", "LIVE", "COMPLETED"];

export default function AdminMatches() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    team1Id: "",
    team2Id: "",
    score1: 0,
    score2: 0,
    round: "QUARTERFINAL",
    status: "SCHEDULED",
    matchDate: "",
    leagueId: "",
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesApi.getAll(),
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.getAll(),
  });

  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => matchesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      matchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      closeModal();
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      matchesApi.updateScore(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => matchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const openModal = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      setFormData({
        team1Id: match.team1Id ?? "",
        team2Id: match.team2Id ?? "",
        score1: match.score1,
        score2: match.score2,
        round: match.round,
        status: match.status,
        matchDate: match.matchDate
          ? new Date(match.matchDate).toISOString().slice(0, 16)
          : "",
        leagueId: match.leagueId ?? "",
      });
    } else {
      setEditingMatch(null);
      setFormData({
        team1Id: "",
        team2Id: "",
        score1: 0,
        score2: 0,
        round: "QUARTERFINAL",
        status: "SCHEDULED",
        matchDate: "",
        leagueId: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMatch(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      matchDate: formData.matchDate || undefined,
    };

    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this match?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleQuickScore = (match: Match, team: 1 | 2, increment: number) => {
    const newScore1 = team === 1 ? Math.max(0, match.score1 + increment) : match.score1;
    const newScore2 = team === 2 ? Math.max(0, match.score2 + increment) : match.score2;
    updateScoreMutation.mutate({
      id: match.id,
      data: { score1: newScore1, score2: newScore2 },
    });
  };

  const handleStatusChange = (match: Match, status: string) => {
    updateScoreMutation.mutate({
      id: match.id,
      data: { status },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Page title row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors shrink-0"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(20px, 5vw, 32px)",
                  color: "#1a1a1a",
                }}
              >
                Match Management
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#718096",
                }}
              >
                Create matches and update live scores
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-3 rounded-full transition-all hover:scale-105 self-start sm:self-auto shrink-0"
            style={{
              background: "#1a1a1a",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            <Plus size={16} />
            Add Match
          </button>
        </motion.div>

        {/* Matches List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {matches?.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm"
                style={{ border: "1px solid #e2e8f0" }}
              >
                {/* Teams + score row */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Team 1 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#E8F0FF" }}
                    >
                      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}>
                        {(match.homePlaceholder ?? match.team1?.name ?? "?").charAt(0)}
                      </span>
                    </div>
                    <span
                      className="truncate"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: match.homePlaceholder ? "#9ca3af" : "#1a1a1a",
                        fontStyle: match.homePlaceholder ? "italic" : "normal",
                      }}
                    >
                      {match.homePlaceholder ?? match.team1?.name ?? "TBD"}
                    </span>
                  </div>

                  {/* Score controls (center) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleQuickScore(match, 1, -1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm leading-none"
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#1a1a1a",
                        minWidth: "24px",
                        textAlign: "center",
                      }}
                    >
                      {match.score1}
                    </span>
                    <button
                      onClick={() => handleQuickScore(match, 1, 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm leading-none"
                    >
                      +
                    </button>

                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        color: "#718096",
                        fontSize: "12px",
                        marginInline: "2px",
                      }}
                    >
                      vs
                    </span>

                    <button
                      onClick={() => handleQuickScore(match, 2, -1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm leading-none"
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#1a1a1a",
                        minWidth: "24px",
                        textAlign: "center",
                      }}
                    >
                      {match.score2}
                    </span>
                    <button
                      onClick={() => handleQuickScore(match, 2, 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span
                      className="truncate text-right"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: "14px",
                        color: match.awayPlaceholder ? "#9ca3af" : "#1a1a1a",
                        fontStyle: match.awayPlaceholder ? "italic" : "normal",
                      }}
                    >
                      {match.awayPlaceholder ?? match.team2?.name ?? "TBD"}
                    </span>
                    <div
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#E8F0FF" }}
                    >
                      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px" }}>
                        {(match.awayPlaceholder ?? match.team2?.name ?? "?").charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status + round + actions row */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t" style={{ borderColor: "#f1f5f9" }}>
                  <select
                    value={match.status}
                    onChange={(e) => handleStatusChange(match, e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      backgroundColor:
                        match.status === "LIVE"
                          ? "#D1FAE5"
                          : match.status === "COMPLETED"
                          ? "#F3F4F6"
                          : "#DBEAFE",
                    }}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <span
                    className="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                    style={{ backgroundColor: "#F3F4F6", fontFamily: "Inter, sans-serif", color: "#4a5568" }}
                  >
                    {match.round.replace(/_/g, " ")}
                  </span>
                  {match.league && (
                    <span
                      className="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                      style={{ backgroundColor: "#EDE9FE", fontFamily: "Inter, sans-serif", color: "#7C3AED" }}
                    >
                      {match.league.name}
                    </span>
                  )}

                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => openModal(match)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit match"
                    >
                      <Edit2 size={15} style={{ color: "#4a5568" }} />
                    </button>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete match"
                    >
                      <Trash2 size={15} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "22px",
                  color: "#1a1a1a",
                  marginBottom: "20px",
                }}
              >
                {editingMatch ? "Edit Match" : "Add New Match"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Team 1 *
                    </label>
                    <select
                      value={formData.team1Id}
                      onChange={(e) =>
                        setFormData({ ...formData, team1Id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Select team</option>
                      {teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Team 2 *
                    </label>
                    <select
                      value={formData.team2Id}
                      onChange={(e) =>
                        setFormData({ ...formData, team2Id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      <option value="">Select team</option>
                      {teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Score 1
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.score1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          score1: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Score 2
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.score2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          score2: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Round *
                    </label>
                    <select
                      value={formData.round}
                      onChange={(e) =>
                        setFormData({ ...formData, round: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      {ROUNDS.map((round) => (
                        <option key={round} value={round}>
                          {round.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#1a1a1a",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        border: "1px solid #e2e8f0",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                      }}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Match Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.matchDate}
                    onChange={(e) =>
                      setFormData({ ...formData, matchDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#1a1a1a",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    League / Division
                  </label>
                  <select
                    value={formData.leagueId}
                    onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ border: "1px solid #e2e8f0", fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                  >
                    <option value="">— No league —</option>
                    {leagues?.map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name}{league.division ? ` (${league.division})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-full transition-colors hover:bg-gray-100"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#4a5568",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full transition-all hover:scale-105"
                    style={{
                      background: "#1a1a1a",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#FFFFFF",
                    }}
                  >
                    {editingMatch ? "Save Changes" : "Add Match"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
