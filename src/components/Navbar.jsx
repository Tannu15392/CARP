export default function Navbar({ page, setPage, user, onLogin, onLogout, onReport, onAI }) {
  return (
    <nav>
      <div className="logo" onClick={() => setPage("home")}>
        <div className="logo-dot" />
        FindIt
        <span style={{ fontSize: ".75rem", fontWeight: 400, opacity: .6, WebkitTextFillColor: "var(--muted)", marginLeft: 4 }}>
          College Asset Recovery Portal
        </span>
      </div>

      <div className="nav-pills">
        {["home", "browse", "profile"].map(p => (
          <button
            key={p}
            className={`npill${page === p ? " active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p === "home" ? "Home" : p === "browse" ? "Browse" : "Profile"}
          </button>
        ))}
        {user?.role === "admin" && (
          <button
            className={`npill${page === "admin" ? " active" : ""}`}
            onClick={() => setPage("admin")}
          >
            📊 Admin
          </button>
        )}
        <button className="npill" onClick={onAI}>🤖 AI Help</button>
      </div>

      <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
        {user ? (
          <>
            <div className="user-chip">👤 {user.name}</div>
            <button
              className="btn-o"
              style={{ fontSize: ".8rem", padding: ".35rem .8rem" }}
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="btn-o"
            style={{ fontSize: ".85rem", padding: ".4rem 1rem" }}
            onClick={onLogin}
          >
            Login
          </button>
        )}
        <button className="btn-g" onClick={onReport}>+ Report Item</button>
      </div>
    </nav>
  );
}