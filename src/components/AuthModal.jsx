import { useState } from "react";
import { API } from "../constants";

export default function AuthModal({ onClose, onSuccess, toast_ }) {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", college: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/${authMode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) { toast_(data.message || "Error", true); setSubmitting(false); return; }
      localStorage.setItem("findit_user", JSON.stringify(data));
      onSuccess(data);
      setAuthForm({ name: "", email: "", password: "", college: "" });
      toast_(`Welcome ${data.name}! 🎉`);
    } catch {
      toast_("Connection error", true);
    }
    setSubmitting(false);
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mcls" onClick={onClose}>×</button>
        <h2>{authMode === "login" ? "Welcome Back 👋" : "Join FindIt 🎓"}</h2>

        {authMode === "signup" && (
          <div className="fg">
            <label>Full Name *</label>
            <input type="text" placeholder="Your name" value={authForm.name}
              onChange={e => setAuthForm({ ...authForm, name: e.target.value })} />
          </div>
        )}
        <div className="fg">
          <label>Email *</label>
          <input type="email" placeholder="your@email.com" value={authForm.email}
            onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
        </div>
        <div className="fg">
          <label>Password *</label>
          <input type="password" placeholder="••••••••" value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
        </div>
        {authMode === "signup" && (
          <div className="fg">
            <label>College Name</label>
            <input type="text" placeholder="e.g. IIT Delhi" value={authForm.college}
              onChange={e => setAuthForm({ ...authForm, college: e.target.value })} />
          </div>
        )}

        <button
          className="btn-g"
          style={{ width: "100%", padding: ".85rem", fontSize: "1rem", borderRadius: "var(--r)" }}
          onClick={handleAuth}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : authMode === "login" ? "Login" : "Sign Up"}
        </button>

        <div className="auth-switch">
          {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "Sign Up" : "Login"}
          </span>
        </div>
      </div>
    </div>
  );
}