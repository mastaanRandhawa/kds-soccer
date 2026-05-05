import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { teamsApi, matchesApi, mediaApi } from "@/lib/api";
import { Users, Calendar, Image, Trophy } from "lucide-react";
import { AdminHeader } from "@/components/ui/admin-header";

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
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 sm:px-8 py-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(22px, 5vw, 32px)",
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
              marginBottom: "24px",
            }}
          >
            Manage your tournament from here
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 sm:mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={stat.href}
                className="block bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "#718096",
                        marginBottom: "6px",
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: "clamp(22px, 5vw, 32px)",
                        color: "#1a1a1a",
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className="p-2 sm:p-3 rounded-lg shrink-0"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
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
              fontSize: "18px",
              color: "#1a1a1a",
              marginBottom: "16px",
            }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                style={{ border: "1px solid #e2e8f0" }}
              >
                <div
                  className="p-2.5 rounded-lg shrink-0"
                  style={{ backgroundColor: "#E8F0FF" }}
                >
                  <link.icon size={20} style={{ color: "#3B82F6" }} />
                </div>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "15px",
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
            className="mt-8 sm:mt-12"
          >
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "18px",
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
              {/* Scrollable table on small screens */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr style={{ backgroundColor: "#F9FAFB" }}>
                      <th
                        className="px-4 sm:px-6 py-3 text-left"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#718096",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Match
                      </th>
                      <th
                        className="px-4 sm:px-6 py-3 text-center"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#718096",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Score
                      </th>
                      <th
                        className="px-4 sm:px-6 py-3 text-center"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#718096",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Round
                      </th>
                      <th
                        className="px-4 sm:px-6 py-3 text-center"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#718096",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
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
                        <td className="px-4 sm:px-6 py-4">
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
                        <td className="px-4 sm:px-6 py-4 text-center">
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
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: "13px",
                              color: "#718096",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {match.round.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-center">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
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
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
