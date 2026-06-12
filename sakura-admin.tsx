import { useState, useEffect } from "react";

const STATUS_OPTIONS = [
  {
    id: "open",
    label: "受付中",
    message: "通常どおり診療しています",
    color: "#2d7a4f",
    bg: "#e8f5ee",
    border: "#2d7a4f",
    dot: "#2d7a4f",
  },
  {
    id: "break",
    label: "休憩中",
    message: "昼休み中です。午後の診療は16:00からです",
    color: "#b45309",
    bg: "#fef3c7",
    border: "#b45309",
    dot: "#b45309",
  },
  {
    id: "morning-off",
    label: "午前休診",
    message: "本日は午前の診療はお休みです。午後は16:00より受付しています",
    color: "#6366f1",
    bg: "#ede9fe",
    border: "#6366f1",
    dot: "#6366f1",
  },
  {
    id: "afternoon-off",
    label: "午後休診",
    message: "本日は午後の診療はお休みです",
    color: "#0284c7",
    bg: "#e0f2fe",
    border: "#0284c7",
    dot: "#0284c7",
  },
  {
    id: "closed",
    label: "本日休診",
    message: "本日は休診です。次回の診療日にお越しください",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#dc2626",
    dot: "#dc2626",
  },
];

const STORAGE_KEY = "sakura_clinic_status";

export default function App() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const result = await window.storage.get(STORAGE_KEY, true);
      if (result) {
        const data = JSON.parse(result.value);
        setCurrentStatus(data.statusId || "open");
        setCustomMessage(data.customMessage || "");
        setUseCustomMessage(data.useCustomMessage || false);
        setLastUpdated(data.updatedAt || null);
      } else {
        setCurrentStatus("open");
      }
    } catch {
      setCurrentStatus("open");
    }
    setLoading(false);
  }

  async function saveStatus(statusId) {
    setSaving(true);
    setSaved(false);
    const option = STATUS_OPTIONS.find((o) => o.id === statusId);
    const message = useCustomMessage && customMessage.trim()
      ? customMessage.trim()
      : option.message;

    const data = {
      statusId,
      message,
      customMessage,
      useCustomMessage,
      updatedAt: new Date().toISOString(),
    };

    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(data), true);
      setCurrentStatus(statusId);
      setLastUpdated(data.updatedAt);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("保存に失敗しました。もう一度お試しください。");
    }
    setSaving(false);
  }

  const activeOption = STATUS_OPTIONS.find((o) => o.id === currentStatus);

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingDot} />
        <p style={styles.loadingText}>読み込み中...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoMark}>🌸</div>
          <div>
            <div style={styles.headerTitle}>さくら眼科</div>
            <div style={styles.headerSub}>診療状況 管理画面</div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Current status preview */}
        {activeOption && (
          <div style={{ ...styles.previewCard, borderColor: activeOption.border, background: activeOption.bg }}>
            <div style={styles.previewLabel}>現在の表示状態</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ ...styles.dot, background: activeOption.dot }} />
              <span style={{ ...styles.previewStatus, color: activeOption.color }}>{activeOption.label}</span>
            </div>
            <div style={{ ...styles.previewMessage, color: activeOption.color }}>
              {useCustomMessage && customMessage.trim() ? customMessage : activeOption.message}
            </div>
            {lastUpdated && (
              <div style={styles.lastUpdated}>
                最終更新：{new Date(lastUpdated).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              </div>
            )}
          </div>
        )}

        {/* Status buttons */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>診療状況を選択</div>
          <div style={styles.grid}>
            {STATUS_OPTIONS.map((option) => {
              const isActive = currentStatus === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => saveStatus(option.id)}
                  disabled={saving}
                  style={{
                    ...styles.statusBtn,
                    borderColor: isActive ? option.border : "#e2e8f0",
                    background: isActive ? option.bg : "#fff",
                    boxShadow: isActive ? `0 0 0 2px ${option.border}` : "0 1px 3px rgba(0,0,0,0.06)",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <span style={{ ...styles.btnDot, background: option.dot }} />
                  <span style={{ ...styles.btnLabel, color: isActive ? option.color : "#374151" }}>
                    {option.label}
                  </span>
                  {isActive && (
                    <span style={{ ...styles.activeBadge, background: option.color }}>選択中</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom message */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>メッセージのカスタマイズ</div>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={useCustomMessage}
              onChange={(e) => setUseCustomMessage(e.target.checked)}
              style={styles.checkbox}
            />
            独自のメッセージを使用する
          </label>
          {useCustomMessage && (
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="例：本日は臨時休診です。ご迷惑をおかけします。"
              rows={3}
              style={styles.textarea}
            />
          )}
          {useCustomMessage && (
            <button
              onClick={() => saveStatus(currentStatus)}
              disabled={saving}
              style={styles.saveBtn}
            >
              {saving ? "保存中..." : saved ? "✓ 保存しました" : "メッセージを更新"}
            </button>
          )}
        </div>

        {/* Info */}
        <div style={styles.infoBox}>
          <div style={styles.infoTitle}>📋 使い方</div>
          <ul style={styles.infoList}>
            <li>ボタンをタップすると即座に反映されます</li>
            <li>サイトの「本日の診療」欄に表示されます</li>
            <li>スマートフォンからも操作できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#1e293b",
  },
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 12,
  },
  loadingDot: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#e2adb8",
    animation: "pulse 1s infinite",
  },
  loadingText: { color: "#94a3b8", fontSize: 14 },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "16px 20px",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    maxWidth: 480,
    margin: "0 auto",
  },
  logoMark: { fontSize: 28 },
  headerTitle: { fontWeight: 700, fontSize: 18, color: "#1e293b" },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  content: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "20px 16px 40px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  previewCard: {
    border: "2px solid",
    borderRadius: 12,
    padding: "16px 18px",
  },
  previewLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
    letterSpacing: "0.05em",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    display: "inline-block",
    flexShrink: 0,
  },
  previewStatus: {
    fontWeight: 700,
    fontSize: 20,
  },
  previewMessage: {
    fontSize: 13,
    lineHeight: 1.6,
    opacity: 0.85,
  },
  lastUpdated: {
    marginTop: 10,
    fontSize: 11,
    color: "#94a3b8",
  },
  section: {
    background: "#fff",
    borderRadius: 12,
    padding: "18px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 14,
    letterSpacing: "0.03em",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  statusBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    border: "2px solid",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left",
    position: "relative",
  },
  btnDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    flexShrink: 0,
  },
  btnLabel: {
    fontWeight: 600,
    fontSize: 16,
    flex: 1,
  },
  activeBadge: {
    fontSize: 11,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 20,
    fontWeight: 600,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    cursor: "pointer",
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.6,
    color: "#1e293b",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
    marginBottom: 10,
  },
  saveBtn: {
    background: "#2d7a4f",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },
  infoBox: {
    background: "#f1f5f9",
    borderRadius: 10,
    padding: "14px 16px",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
    marginBottom: 8,
  },
  infoList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 2,
  },
};
