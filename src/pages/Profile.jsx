import { ago } from "../utils";
import { EM } from "../constants";

export default function Profile({ user, items, onLogin, onItemClick }) {
  return (
    <div className="prof-wrap">
      {user ? (
        <>
          <div className="pcard">
            <div className="avatar">👤</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.3rem" }}>{user.name}</div>
            <div style={{ color: "var(--muted)", fontSize: ".88rem", marginTop: ".2rem" }}>
              {user.email} · {user.college || "College Campus"}
            </div>
          </div>

          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: "1rem" }}>Recent Listings</h3>
          {items.slice(0, 4).map(i => (
            <div key={i._id} className="pcard" style={{ cursor: "pointer", marginBottom: ".8rem" }} onClick={() => onItemClick(i)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className={`badge ${i.status === "claimed" ? "bc" : i.type === "lost" ? "bl" : "bf"}`}>
                    {i.status === "claimed" ? "claimed" : i.type}
                  </span>
                  <div style={{ fontWeight: 500, marginTop: ".2rem" }}>{i.title}</div>
                  <div style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: ".2rem" }}>📍 {i.location} · {ago(i.createdAt)}</div>
                </div>
                <div style={{ fontSize: "2rem" }}>{EM[i.category] || "📦"}</div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="empty">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
          <p>Please login to view your profile</p>
          <button className="btn-g" style={{ marginTop: "1rem" }} onClick={onLogin}>Login / Signup</button>
        </div>
      )}
    </div>
  );
}