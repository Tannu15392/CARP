import { useEffect, useState } from "react";
import { API } from "../constants";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend, Cell,
} from "recharts";

const COLORS = ["#4f46e5", "#6366f1", "#a78bfa", "#22c55e", "#f59e0b"];

function authHeaders(user) {
  return { Authorization: `Bearer ${user?.token}` };
}

export default function Admin({ user, toast_ }) {
  const [stats, setStats] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byLocation, setByLocation] = useState([]);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    const headers = authHeaders(user);

    Promise.all([
      fetch(`${API}/admin/stats`, { headers }).then((r) => r.json()),
      fetch(`${API}/admin/by-category`, { headers }).then((r) => r.json()),
      fetch(`${API}/admin/by-location`, { headers }).then((r) => r.json()),
      fetch(`${API}/admin/trend`, { headers }).then((r) => r.json()),
      fetch(`${API}/admin/recent`, { headers }).then((r) => r.json()),
      fetch(`${API}/admin/users`, { headers }).then((r) => r.json()),
    ])
      .then(([s, cat, loc, tr, rec, us]) => {
        setStats(s);
        setByCategory(Array.isArray(cat) ? cat : []);
        setByLocation(Array.isArray(loc) ? loc : []);
        setTrend(Array.isArray(tr) ? tr : []);
        setRecent(Array.isArray(rec) ? rec : []);
        setUsers(Array.isArray(us) ? us : []);
      })
      .catch(() => toast_?.("Failed to load admin data", true))
      .finally(() => setLoading(false));
  }, [user]);

  const promote = async (id, role) => {
    try {
      const res = await fetch(`${API}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(user) },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      setUsers((us) => us.map((u) => (u._id === id ? { ...u, role } : u)));
      toast_?.(`Updated role to ${role}`);
    } catch {
      toast_?.("Failed to update role", true);
    }
  };

  if (!user || user.role !== "admin") {
    return <div className="empty">Admins only. Please log in with an admin account.</div>;
  }
  if (loading) return <div className="empty">Loading dashboard…</div>;

  return (
    <div className="browse" style={{ maxWidth: 1200 }}>
      <div className="browse-top">
        <div className="b-title">📊 Admin Dashboard</div>
      </div>

      {/* Top-line stats */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", marginBottom: "2rem" }}>
        <StatCard label="Total Reports" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Recovered" value={stats.claimed} accent="var(--green)" />
        <StatCard label="Recovery Rate" value={`${stats.recoveryRate}%`} accent="var(--blue)" />
        <StatCard label="Registered Users" value={stats.userCount} />
      </div>

      {/* Trend + category charts side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <ChartCard title="Reports over last 30 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} hide={trend.length > 15} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lost" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="found" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most-lost categories">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Location hotspots */}
      <ChartCard title="Hotspots — where items go missing" style={{ marginBottom: "2rem" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byLocation}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="location" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent activity + user management */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <ChartCard title="Recent activity">
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", maxHeight: 320, overflowY: "auto" }}>
            {recent.map((it) => (
              <div key={it._id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", borderBottom: "1px solid var(--border)", paddingBottom: ".5rem" }}>
                <span>{it.type === "lost" ? "🔴" : "🟢"} {it.title}</span>
                <span style={{ color: "var(--muted)" }}>{it.status}</span>
              </div>
            ))}
            {recent.length === 0 && <div style={{ color: "var(--muted)" }}>No activity yet.</div>}
          </div>
        </ChartCard>

        <ChartCard title="Manage users">
          <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", maxHeight: 320, overflowY: "auto" }}>
            {users.map((u) => (
              <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".85rem", borderBottom: "1px solid var(--border)", paddingBottom: ".5rem" }}>
                <span>{u.name} <span style={{ color: "var(--muted)" }}>({u.email})</span></span>
                <button
                  className="btn-o"
                  style={{ fontSize: ".72rem", padding: ".25rem .7rem" }}
                  onClick={() => promote(u._id, u.role === "admin" ? "student" : "admin")}
                >
                  {u.role === "admin" ? "Revoke admin" : "Make admin"}
                </button>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: "1.2rem", cursor: "default" }}>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.8rem", color: accent || "var(--txt)" }}>{value}</div>
      <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function ChartCard({ title, children, style }) {
  return (
    <div className="card" style={{ padding: "1.2rem", cursor: "default", ...style }}>
      <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: ".95rem", marginBottom: "1rem" }}>{title}</div>
      {children}
    </div>
  );
}
