import { useRef, useState } from "react";
import { API, CATS, LOCS } from "../constants";

export default function ReportModal({ user, onClose, onSuccess, toast_ }) {
  const [form, setForm] = useState({
    type: "lost", title: "", category: "Electronics",
    location: "Library", desc: "", contact: "", reward: ""
  });
  const [photos, setPhotos] = useState([]);
  const [drag, setDrag] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const addPhotos = (files) => {
    const n = [];
    Array.from(files).slice(0, 4 - photos.length).forEach(f => {
      if (f.type.startsWith("image/")) n.push({ file: f, url: URL.createObjectURL(f) });
    });
    setPhotos(p => [...p, ...n]);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.desc.trim() || !form.contact.trim()) {
      toast_("Fill all required fields", true); return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      photos.forEach(p => fd.append("photos", p.file));
      const res = await fetch(`${API}/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) { toast_(data.message || "Error", true); setSubmitting(false); return; }
      onSuccess();
      toast_("✅ Item reported!");
    } catch {
      toast_("Failed to submit", true);
    }
    setSubmitting(false);
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mcls" onClick={onClose}>×</button>
        <h2>Report an Item</h2>

        <div className="type-row">
          <button className={`tbtn tl${form.type === "lost" ? " on" : ""}`} onClick={() => setForm({ ...form, type: "lost" })}>🔴 I Lost Something</button>
          <button className={`tbtn tf${form.type === "found" ? " on" : ""}`} onClick={() => setForm({ ...form, type: "found" })}>🟢 I Found Something</button>
        </div>

        <div className="fg">
          <label>Photos (up to 4)</label>
          <div
            className={`photo-drop${drag ? " drag" : ""}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); addPhotos(e.dataTransfer.files); }}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={e => addPhotos(e.target.files)} />
            <div style={{ fontSize: "1.5rem", marginBottom: ".3rem" }}>📷</div>
            <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>Click or drag photos here</div>
          </div>
          {photos.length > 0 && (
            <div className="thumbs">
              {photos.map((p, i) => (
                <div className="thumb" key={i}>
                  <img src={p.url} alt="" />
                  <button className="tdel" onClick={e => { e.stopPropagation(); setPhotos(ph => ph.filter((_, j) => j !== i)); }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fg">
          <label>Item Title *</label>
          <input type="text" placeholder="e.g. Black iPhone 14" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="fg2">
          <div className="fg">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg">
            <label>Location</label>
            <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
              {LOCS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="fg">
          <label>Description *</label>
          <textarea placeholder="Describe clearly…" value={form.desc}
            onChange={e => setForm({ ...form, desc: e.target.value })} />
        </div>

        <div className="fg2">
          <div className="fg">
            <label>Your Contact *</label>
            <input type="text" placeholder="your phone number" value={form.contact}
              onChange={e => setForm({ ...form, contact: e.target.value })} />
          </div>
          {form.type === "lost" && (
            <div className="fg">
              <label>Reward (optional)</label>
              <input type="text" placeholder="e.g. ₹200" value={form.reward}
                onChange={e => setForm({ ...form, reward: e.target.value })} />
            </div>
          )}
        </div>

        <button
          className="btn-g"
          style={{ width: "100%", padding: ".85rem", fontSize: "1rem", borderRadius: "var(--r)" }}
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}