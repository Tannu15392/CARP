import { ago } from "../utils";
import { EM } from "../constants";

export default function Card({ item, onClick }) {
  const b = item.status === "claimed" ? "bc" : item.type === "lost" ? "bl" : "bf";
  return (
    <div className="card" onClick={onClick}>
      <div className="c-img">
        {item.photos?.length > 0
          ? <img src={item.photos[0]} alt="" />
          : <span>{EM[item.category] || "📦"}</span>
        }
      </div>
      <div className="c-body">
        <span className={`badge ${b}`}>
          {item.status === "claimed" ? "claimed" : item.type}
        </span>
        <div className="c-title">{item.title}</div>
        <div className="c-desc">{item.desc}</div>
        <div className="c-meta">
          <span>📍 {item.location}</span>
          <span>{ago(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}