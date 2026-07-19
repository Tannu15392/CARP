import Card from "../components/Card";
import { CATS } from "../constants";

export default function Browse({ items, loading, tab, setTab, cat, setCat, q, setQ, user, onReport, onItemClick }) {
  return (
    <div className="browse">
      <div className="browse-top">
        <h1 className="b-title">All Listings</h1>
        <div className="s-wrap">
          <span className="s-ico">🔍</span>
          <input placeholder="Search items, locations…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <button className="btn-g" onClick={onReport}>+ Report</button>
      </div>

      <div className="frow">
        <div className="ftabs">
          {["All", "Lost", "Found", "Claimed"].map(t => (
            <button key={t} className={`ftab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {CATS.filter(c => c !== "All").map(c => (
          <button key={c} className={`fcat${cat === c ? " on" : ""}`} onClick={() => setCat(cat === c ? "All" : c)}>{c}</button>
        ))}
      </div>

      {loading
        ? <div className="loading">Loading...</div>
        : items.length === 0
          ? <div className="empty"><div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div><p>No items found.</p></div>
          : <div className="grid">{items.map(i => <Card key={i._id} item={i} onClick={() => onItemClick(i)} />)}</div>
      }
    </div>
  );
}