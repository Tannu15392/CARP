import Card from "../components/Card";

const STEPS = [
  { i: "📸", t: "Snap & Post", d: "Take a photo of the item and post with full description." },
  { i: "📍", t: "Tag Location", d: "Mark exactly where you lost it or where you found it." },
  { i: "🤖", t: "AI Matching", d: "Our AI auto-matches lost reports with found items on campus." },
  { i: "🤝", t: "Connect & Claim", d: "Contact the finder and claim your item back." },
];

export default function Home({ items, loading, user, onReport, onAI, onBrowse, onItemClick }) {
  return (
    <>
      <section className="hero">
        <div className="glow g1" /><div className="glow g2" /><div className="glow g3" />
        <div className="hero-inner">
          <div className="chip">🎓 Campus Lost &amp; Found Platform</div>
          <h1>Lost something on<br /><span className="gr">campus?</span><br />We've got you.</h1>
          <p>Snap a photo, drop the location, and let FindIt connect you with your belongings — with AI-powered matching for your college community.</p>
          <div className="hero-btns">
            <button className="btn-g" style={{ padding: ".75rem 2rem", fontSize: "1rem" }} onClick={onReport}>Report an Item</button>
            <button className="btn-o" onClick={onBrowse}>Browse Listings</button>
            <button className="btn-o" onClick={onAI}>🤖 Ask AI</button>
          </div>
          <div className="stats">
            <div>
              <div className="stat-n" style={{ color: "var(--pink)" }}>{items.filter(i => i.type === "lost" && i.status === "active").length}</div>
              <div className="stat-l">Lost Items</div>
            </div>
            <div>
              <div className="stat-n" style={{ color: "var(--green)" }}>{items.filter(i => i.type === "found" && i.status === "active").length}</div>
              <div className="stat-l">Found Items</div>
            </div>
            <div>
              <div className="stat-n" style={{ color: "var(--amber)" }}>{items.filter(i => i.status === "claimed").length}</div>
              <div className="stat-l">Reunited</div>
            </div>
          </div>
        </div>
      </section>

      <section className="how">
        <h2 className="sec-t">How it works</h2>
        <p className="sec-s">Four simple steps to recover your belongings</p>
        <div className="steps">
          {STEPS.map((s, n) => (
            <div className="step" key={n}>
              <div className="step-n">{n + 1}</div>
              <div style={{ fontSize: "1.8rem" }}>{s.i}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 2rem 5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.4rem" }}>Recent Listings</h2>
          <button className="btn-o" style={{ fontSize: ".85rem", padding: ".4rem 1rem" }} onClick={onBrowse}>View all →</button>
        </div>
        {loading
          ? <div className="loading">Loading...</div>
          : <div className="grid">{items.slice(0, 4).map(i => <Card key={i._id} item={i} onClick={() => onItemClick(i)} />)}</div>
        }
      </div>
    </>
  );
}