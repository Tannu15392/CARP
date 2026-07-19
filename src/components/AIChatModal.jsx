import { useState, useRef, useEffect } from "react";
import { callAI } from "../utils";

const QUICK = ["How do I describe my item?", "Where should I look first?", "What if nobody responds?"];

export default function AIChatModal({ onClose }) {
  const [msgs, setMsgs] = useState([{
    role: "assistant",
    content: "Hi! I'm FindIt AI 👋 I can help you describe your lost item, suggest where to look, or answer questions. What did you lose?"
  }]);
  const [aiIn, setAiIn] = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const chatRef = useRef();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);

  const sendAI = async (text = aiIn) => {
    if (!text.trim() || aiLoad) return;
    const nm = [...msgs, { role: "user", content: text }];
    setMsgs(nm);
    setAiIn("");
    setAiLoad(true);
    try {
      const r = await callAI(nm.map(m => ({ role: m.role, content: m.content })));
      setMsgs(p => [...p, { role: "assistant", content: r }]);
    } catch {
      setMsgs(p => [...p, { role: "assistant", content: "Connection error. Try again." }]);
    }
    setAiLoad(false);
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mcls" onClick={onClose}>×</button>
        <h2>🤖 FindIt AI Assistant</h2>

        <div className="ai-chat" ref={chatRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "mu" : "ma"}`}>{m.content}</div>
          ))}
          {aiLoad && <div className="msg ma" style={{ opacity: .6, fontStyle: "italic" }}>Thinking…</div>}
        </div>

        <div className="ai-qs">
          {QUICK.map(sq => (
            <button key={sq} className="aiq" onClick={() => sendAI(sq)}>{sq}</button>
          ))}
        </div>

        <div className="ai-row">
          <input
            type="text"
            placeholder="Ask me anything…"
            value={aiIn}
            onChange={e => setAiIn(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendAI()}
          />
          <button className="btn-g" onClick={() => sendAI()} disabled={aiLoad}>Send</button>
        </div>
      </div>
    </div>
  );
}