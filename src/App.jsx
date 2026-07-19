import { useState, useEffect } from "react";
import { API } from "./constants";
import { } from "./utils";
import "./styles/main.css";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import Card from "./components/Card";
import AuthModal from "./components/AuthModal";
import ReportModal from "./components/ReportModal";
import DetailModal from "./components/DetailModal";
import AIChatModal from "./components/AIChatModal";

import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState("home");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("All");
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const [showRep, setShowRep] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [detail, setDetail] = useState(null);

  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("findit_user") || "null"));

  const toast_ = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === "Lost") params.append("type", "lost");
      if (tab === "Found") params.append("type", "found");
      if (tab === "Claimed") params.append("status", "claimed");
      if (cat !== "All") params.append("category", cat);
      if (q) params.append("search", q);
      const res = await fetch(`${API}/items?${params}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast_("Failed to load items", true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [tab, cat, q]);

  const logout = () => {
    localStorage.removeItem("findit_user");
    setUser(null);
    toast_("Logged out!");
  };

  const handleReport = () => user ? setShowRep(true) : setShowAuth(true);

  return (
    <>
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        onLogin={() => setShowAuth(true)}
        onLogout={logout}
        onReport={handleReport}
        onAI={() => setShowAI(true)}
      />

      {page === "home" && (
        <Home
          items={items}
          loading={loading}
          user={user}
          onReport={handleReport}
          onAI={() => setShowAI(true)}
          onBrowse={() => setPage("browse")}
          onItemClick={setDetail}
        />
      )}

      {page === "browse" && (
        <Browse
          items={items}
          loading={loading}
          tab={tab} setTab={setTab}
          cat={cat} setCat={setCat}
          q={q} setQ={setQ}
          user={user}
          onReport={handleReport}
          onItemClick={setDetail}
        />
      )}

      {page === "profile" && (
        <Profile
          user={user}
          items={items}
          onLogin={() => setShowAuth(true)}
          onItemClick={setDetail}
        />
      )}

      {page === "admin" && (
        <Admin user={user} toast_={toast_} />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={(data) => { setUser(data); setShowAuth(false); }}
          toast_={toast_}
        />
      )}

      {showRep && (
        <ReportModal
          user={user}
          onClose={() => setShowRep(false)}
          onSuccess={() => { setShowRep(false); fetchItems(); setPage("browse"); }}
          toast_={toast_}
        />
      )}

      {detail && (
        <DetailModal
          detail={detail}
          allItems={items}
          user={user}
          onClose={() => { setDetail(null); fetchItems(); }}
          onMatchClick={setDetail}
          toast_={toast_}
        />
      )}

      {showAI && <AIChatModal onClose={() => setShowAI(false)} />}

      <Toast toast={toast} />
    </>
  );
}