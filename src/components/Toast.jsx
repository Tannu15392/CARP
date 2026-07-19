export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast${toast.err ? " err" : ""}`}>
      {toast.msg}
    </div>
  );
}