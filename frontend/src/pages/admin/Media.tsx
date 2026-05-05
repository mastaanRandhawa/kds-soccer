import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { mediaApi, Media } from "@/lib/api";
import { ArrowLeft, Plus, Edit2, Trash2, LogOut } from "lucide-react";

export default function AdminMedia() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    description: "",
    category: "",
  });

  const { data: media, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Media>) => mediaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Media> }) =>
      mediaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const openModal = (mediaItem?: Media) => {
    if (mediaItem) {
      setEditingMedia(mediaItem);
      setFormData({
        imageUrl: mediaItem.imageUrl,
        description: mediaItem.description || "",
        category: mediaItem.category || "",
      });
    } else {
      setEditingMedia(null);
      setFormData({ imageUrl: "", description: "", category: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedia(null);
    setFormData({ imageUrl: "", description: "", category: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedia) {
      updateMutation.mutate({ id: editingMedia.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this media item?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm"
        style={{ borderBottom: "1px solid #e2e8f0" }}
      >
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: "#1a1a1a",
                textDecoration: "none",
              }}
            >
              KDS Soccer
            </Link>
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: "#E8F0FF",
                color: "#3B82F6",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#4a5568",
              }}
            >
              Welcome, {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                color: "#718096",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#1a1a1a",
                }}
              >
                Media Management
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: "#718096",
                }}
              >
                Manage images for the homepage gallery
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105"
            style={{
              background: "#1a1a1a",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#FFFFFF",
            }}
          >
            <Plus size={16} />
            Add Media
          </button>
        </motion.div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media?.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div className="relative aspect-video">
                  <img
                    src={item.imageUrl}
                    alt={item.description || "Media"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 rounded-lg bg-white shadow-md"
                    >
                      <Edit2 size={16} style={{ color: "#4a5568" }} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-white shadow-md"
                    >
                      <Trash2 size={16} style={{ color: "#EF4444" }} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {item.category && (
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: "#E8F0FF",
                        color: "#3B82F6",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {item.category}
                    </span>
                  )}
                  {item.description && (
                    <p
                      className="mt-2 truncate"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#1a1a1a",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  color: "#1a1a1a",
                  marginBottom: "24px",
                }}
              >
                {editingMedia ? "Edit Media" : "Add New Media"}
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
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {formData.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x200?text=Invalid+URL";
                      }}
                    />
                  </div>
                )}

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
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                    placeholder="Image description"
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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      border: "1px solid #e2e8f0",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="stadium">Stadium</option>
                    <option value="celebration">Celebration</option>
                    <option value="action">Action</option>
                    <option value="fans">Fans</option>
                    <option value="teams">Teams</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-8">
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
                    {editingMedia ? "Save Changes" : "Add Media"}
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
