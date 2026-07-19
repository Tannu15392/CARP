import { useEffect, useState } from "react";
import { ago, getMatches } from "../utils";
import { EM, API } from "../constants";

export default function DetailModal({ detail, allItems, user, onClose, onMatchClick, toast_ }) {
  const matches = getMatches(detail, allItems);
  const [visualMatches, setVisualMatches] = useState([]);

  useEffect(() => {
    if (!detail?.photos?.length) return;
    fetch(`${API}/match/${detail._id}`)
      .then((r) => r.json())
      .then((data) => setVisualMatches(data.matches || []))
      .catch(() => setVisualMatches([]));
  }, [detail?._id]);

  const markClaimed = async () => {
    try {
      await fetch(`${API}/items/${detail._id}/claim`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      onClose();
      toast_("✅ Marked as claimed!");
    } catch {
      toast_("Error", true);
    }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mcls" onClick={onClose}>×</button>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: ".5rem", marginBottom: "1.2rem" }}>
          {detail.photos?.length > 0
            ? detail.photos.map((p, i) => (
              <div key={i} style={{ borderRadius: "var(--rs)", overflow: "hidden", aspectRatio: 1 }}>
                <img src={p} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))
            : <div style={{ background: "var(--surf)", borderRadius: "var(--rs)", aspectRatio: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
              {EM[detail.category] || "📦"}
            </div>
          }
        </div>

        <span className={`badge ${detail.status === "claimed" ? "bc" : detail.type === "lost" ? "bl" : "bf"}`}>
          {detail.status === "claimed" ? "claimed" : detail.type}
        </span>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.25rem", margin: ".5rem 0 1rem" }}>{detail.title}</h2>

        <div className="info-grid">
          <div className="ibox"><div className="ilbl">Category</div><div className="ival">{EM[detail.category]} {detail.category}</div></div>
          <div className="ibox"><div className="ilbl">Location</div><div className="ival">📍 {detail.location}</div></div>
          <div className="ibox"><div className="ilbl">Posted</div><div className="ival">{ago(detail.createdAt)}</div></div>
          <div className="ibox">
            <div className="ilbl">Status</div>
            <div className="ival" style={{ color: detail.status === "claimed" ? "var(--amber)" : detail.type === "lost" ? "var(--pink)" : "var(--green)" }}>
              {detail.status === "claimed" ? "✅ Claimed" : detail.type === "lost" ? "❌ Lost" : "✅ Found"}
            </div>
          </div>
        </div>

        <p style={{ fontSize: ".9rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: "1.2rem" }}>{detail.desc}</p>

        {detail.reward && (
          <div className="ibox" style={{ marginBottom: "1rem" }}>
            <div className="ilbl">Reward</div>
            <div className="ival" style={{ color: "var(--amber)" }}>🎁 {detail.reward}</div>
          </div>
        )}

        <div className="cbox">
          <div style={{ fontSize: ".72rem", color: "var(--blue)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".3rem" }}>Contact</div>
          <div style={{ fontWeight: 500 }}>{detail.contact}</div>
        </div>

        {matches.length > 0 && (
          <>
            <div className="ai-banner">
              <span style={{ fontSize: "1.4rem" }}>🤖</span>
              <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                <strong style={{ color: "var(--purple)" }}>AI found {matches.length} potential match{matches.length > 1 ? "es" : ""}!</strong>
              </div>
            </div>
            {matches.map(m => (
              <div className="match-card" key={m._id} onClick={() => onMatchClick(m)}>
                <span style={{ fontSize: "1.4rem" }}>{EM[m.category] || "📦"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: ".88rem" }}>{m.title}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>📍 {m.location}</div>
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--green)", fontWeight: 500 }}>↑{m.score}% match</div>
              </div>
            ))}
          </>
        )}

        {visualMatches.length > 0 && (
          <>
            <div className="ai-banner">
              <span style={{ fontSize: "1.4rem" }}>🖼️</span>
              <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                <strong style={{ color: "var(--purple)" }}>AI photo match: {visualMatches.length} similar-looking item{visualMatches.length > 1 ? "s" : ""}!</strong>
              </div>
            </div>
            {visualMatches.map((m) => (
              <div className="match-card" key={m._id} onClick={() => onMatchClick(m)}>
                {m.photos?.[0]
                  ? <img src={m.photos[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                  : <span style={{ fontSize: "1.4rem" }}>{EM[m.category] || "📦"}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: ".88rem" }}>{m.title}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>📍 {m.location}</div>
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--purple)", fontWeight: 500 }}>👁️ {m.similarity}% similar</div>
              </div>
            ))}
          </>
        )}

        {detail.status !== "claimed" && user && (
          <button
            className="btn-g"
            style={{ width: "100%", marginTop: "1.2rem", padding: ".8rem", borderRadius: "var(--r)", fontSize: ".95rem" }}
            onClick={markClaimed}
          >
            ✅ Mark as Claimed
          </button>
        )}
      </div>
    </div>
  );
}