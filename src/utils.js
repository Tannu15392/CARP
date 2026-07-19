import { API } from "./constants";

export function ago(ts) {
  const d = Date.now() - new Date(ts).getTime();
  const m = 60000, h = 3600000, day = 86400000;
  if (d < m) return "Just now";
  if (d < h) return `${Math.floor(d / m)}m ago`;
  if (d < day) return `${Math.floor(d / h)}h ago`;
  return `${Math.floor(d / day)}d ago`;
}

export function getMatches(item, all) {
  return all
    .filter(i => i._id !== item._id && i.type !== item.type && i.status === "active")
    .map(i => ({
      ...i,
      score:
        (i.category === item.category ? 50 : 0) +
        (i.location === item.location ? 30 : 0) +
        (i.title.split(" ").some(w => item.title.toLowerCase().includes(w.toLowerCase())) ? 20 : 0),
    }))
    .filter(i => i.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function callAI(messages) {
  const r = await fetch(`${API}/items/ai-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const data = await r.json();
  return data.reply;
}