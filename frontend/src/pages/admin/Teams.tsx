import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { teamsApi, Team } from "@/lib/api";
import { ArrowLeft, Plus, Edit2, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/ui/admin-header";

export default function AdminTeams() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    location: "",
    coachName: "",
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Team>) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Team> }) =>
      teamsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const openModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        logoUrl: team.logoUrl || "",
        location: team.location || "",
        coachName: team.coachName || "",
      });
    } else {
      setEditingTeam(null);
      setFormData({ name: "", logoUrl: "", location: "", coachName: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: "", logoUrl: "", location: "", coachName: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Page title row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
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
                Team Management
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#718096",
                }}
              >
                Add, edit, or remove teams from the tournament
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
            Add Team
          </button>
        </motion.div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teams?.map((team, idx) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#E8F0FF" }}
                  >
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          fontSize: "22px",
                          color: "#1a1a1a",
                        }}
                      >
                        {team.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal(team)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Edit team"
                    >
                      <Edit2 size={16} style={{ color: "#4a5568" }} />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Delete team"
                    >
                      <Trash2 size={16} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>

                <h3
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "17px",
                    color: "#1a1a1a",
                    marginBottom: "6px",
                  }}
                >
                  {team.name}
                </h3>

                {team.location && (
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      color: "#718096",
                      marginBottom: "3px",
                    }}
                  >
                    📍 {team.location}
                  </p>
                )}

                {team.coachName && (
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      color: "#718096",
                    }}
                  >
                    Coach: {team.coachName}
                  </p>
                )}
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
              className="bg-white rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
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
                {editingTeam ? "Edit Team" : "Add New Team"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
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
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, logoUrl: e.target.value })
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
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
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
                    Coach Name
                  </label>
                  <input
                    type="text"
                    value={formData.coachName}
                    onChange={(e) =>
                      setFormData({ ...formData, coachName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  />
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
                    {editingTeam ? "Save Changes" : "Add Team"}
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
