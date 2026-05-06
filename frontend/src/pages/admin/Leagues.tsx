import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { leaguesApi, League } from "@/lib/api";
import {
  ArrowLeft, Plus, Edit2, Trash2, Trophy, ChevronRight,
  Layers, Calendar, AlertCircle,
} from "lucide-react";
import { AdminHeader } from "@/components/ui/admin-header";

const DIVISION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Div 1": { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  "Div 2": { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  default: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
};

function divColor(division?: string) {
  if (!division) return DIVISION_COLORS.default;
  return DIVISION_COLORS[division] ?? DIVISION_COLORS.default;
}

export default function AdminLeagues() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [formData, setFormData] = useState({ name: "", division: "", notes: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: leagues, isLoading, error } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => leaguesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<League>) => leaguesApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leagues"] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<League> }) => leaguesApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leagues"] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leaguesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leagues"] }); setDeleteConfirm(null); },
  });

  const openModal = (league?: League) => {
    if (league) {
      setEditingLeague(league);
      setFormData({ name: league.name, division: league.division ?? "", notes: league.notes ?? "" });
    } else {
      setEditingLeague(null);
      setFormData({ name: "", division: "", notes: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLeague(null);
    setFormData({ name: "", division: "", notes: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<League> = {
      name: formData.name,
      division: formData.division || undefined,
      notes: formData.notes || undefined,
    };
    if (editingLeague) updateMutation.mutate({ id: editingLeague.id, data });
    else createMutation.mutate(data);
  };

  const totalMatches = leagues?.reduce((s, l) => s + (l._count?.matches ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={() => { logout(); navigate("/admin/login"); }} />

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-10 max-w-6xl">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-200 transition-colors shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leagues</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Each league holds its own matches, groups, standings, and bracket.
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:scale-105 self-start sm:self-auto shrink-0"
            style={{ background: "#1a1a1a" }}
          >
            <Plus size={15} />
            New League
          </button>
        </motion.div>

        {/* Summary bar */}
        {!isLoading && leagues && leagues.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
          >
            {[
              { label: "Leagues", value: leagues.length, icon: <Trophy size={16} /> },
              { label: "Total Matches", value: totalMatches, icon: <Calendar size={16} /> },
              { label: "Groups", value: leagues.reduce((s, l) => s + (l._count?.groups ?? 0), 0), icon: <Layers size={16} /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-500 shrink-0">{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm">Failed to load leagues. Is the backend running?</p>
          </div>
        ) : !leagues || leagues.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-2xl"
          >
            <Trophy size={40} className="text-gray-300 mb-4" />
            <p className="text-gray-400 text-base font-medium mb-2">No leagues yet</p>
            <p className="text-gray-400 text-sm mb-6">Create your first league to start adding matches.</p>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white"
              style={{ background: "#1a1a1a" }}
            >
              <Plus size={15} />
              Create First League
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league, idx) => {
              const dc = divColor(league.division);
              const matchCount = league._count?.matches ?? 0;
              const groupCount = league._count?.groups ?? 0;

              return (
                <motion.div
                  key={league.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  {/* Card top */}
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      {league.division ? (
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}
                        >
                          {league.division}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          No division
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          onClick={() => openModal(league)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                          title="Edit league"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(league.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
                          title="Delete league"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{league.name}</h3>

                    {league.notes && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{league.notes}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {matchCount} match{matchCount !== 1 ? "es" : ""}
                      </span>
                      {groupCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Layers size={12} />
                          {groupCount} group{groupCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card footer – Open button */}
                  <Link
                    to={`/admin/leagues/${league.id}`}
                    className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors group"
                  >
                    <span>Open League</span>
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              {editingLeague ? "Edit League" : "New League"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Mens' 1"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Division / Label</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="e.g. Div 1, Over 52, U-19"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this league…"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {(createMutation.error || updateMutation.error) && (
                <p className="text-sm text-red-500">
                  {(createMutation.error as any)?.response?.data?.error ?? "Something went wrong."}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#1a1a1a" }}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving…"
                    : editingLeague ? "Save Changes" : "Create League"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
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
              <h3 className="font-bold text-gray-900">Delete League?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the league and <strong>all its matches</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete League"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
