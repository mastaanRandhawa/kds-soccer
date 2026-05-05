import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { teamsApi, matchesApi, mediaApi } from "@/lib/api";
import { Users, Calendar, Image, Trophy, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.getAll(),
  });

  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesApi.getAll(),
  });

  const { data: media } = useQuery({
    queryKey: ["media"],
    queryFn: () => mediaApi.getAll(),
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const stats = [
    {
      label: "Teams",
      value: teams?.length || 0,
      icon: Users,
      href: "/admin/teams",
      color: "#3B82F6",
    },
    {
      label: "Matches",
      value: matches?.length || 0,
      icon: Calendar,
      href: "/admin/matches",
      color: "#10B981",
    },
    {
      label: "Media Items",
      value: media?.length || 0,
      icon: Image,
      href: "/admin/media",
      color: "#F59E0B",
    },
    {
      label: "Live Matches",
      value: matches?.filter((m) => m.status === "LIVE").length || 0,
      icon: Trophy,
      href: "/admin/matches",
      color: "#EF4444",
    },
  ];

  const quickLinks = [
    { label: "Manage Teams", href: "/admin/teams", icon: Users },
    { label: "Manage Matches", href: "/admin/matches", icon: Calendar },
    { label: "Manage Media", href: "/admin/media", icon: Image },
  ];

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
        >
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "32px",
              color: "#1a1a1a",
              marginBottom: "8px",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              color: "#718096",
              marginBottom: "32px",
            }}
          >
            Manage your tournament from here
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={stat.href}
                className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "#718096",
                        marginBottom: "8px",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: "32px",
                        color: "#1a1a1a",
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "20px",
              color: "#1a1a1a",
              marginBottom: "16px",
            }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: "#E8F0FF" }}
                >
                  <link.icon size={24} style={{ color: "#3B82F6" }} />
                </div>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    color: "#1a1a1a",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Matches */}
        {matches && matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "20px",
                color: "#1a1a1a",
                marginBottom: "16px",
              }}
            >
              Recent Matches
            </h2>
            <div
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB" }}>
                    <th
                      className="px-6 py-3 text-left"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#718096",
                        textTransform: "uppercase",
                      }}
                    >
                      Match
                    </th>
                    <th
                      className="px-6 py-3 text-center"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#718096",
                        textTransform: "uppercase",
                      }}
                    >
                      Score
                    </th>
                    <th
                      className="px-6 py-3 text-center"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#718096",
                        textTransform: "uppercase",
                      }}
                    >
                      Round
                    </th>
                    <th
                      className="px-6 py-3 text-center"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#718096",
                        textTransform: "uppercase",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 5).map((match) => (
                    <tr
                      key={match.id}
                      className="border-t"
                      style={{ borderColor: "#e2e8f0" }}
                    >
                      <td className="px-6 py-4">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            color: "#1a1a1a",
                          }}
                        >
                          {match.team1.name} vs {match.team2.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1a1a1a",
                          }}
                        >
                          {match.score1} - {match.score2}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "14px",
                            color: "#718096",
                          }}
                        >
                          {match.round.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              match.status === "LIVE"
                                ? "#D1FAE5"
                                : match.status === "COMPLETED"
                                ? "#F3F4F6"
                                : "#DBEAFE",
                            color:
                              match.status === "LIVE"
                                ? "#059669"
                                : match.status === "COMPLETED"
                                ? "#6B7280"
                                : "#2563EB",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {match.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
