import React from "react";

interface ResolutionPanelProps {
    open: boolean;
    onClose: () => void;
}

export default function ResolutionPanel({
    open,
    onClose,
}: ResolutionPanelProps) {
    if (!open) return null;

    return (
        <div style={overlay}>
            <div style={panel}>
                {/* Header */}
                <div style={header}>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#0f172a"
                        }}>Action Resolution (Illustrative)</h2>
                        <p style={subtitle}>
                            How targeted actions translate system-level risk into local impact.
                        </p>
                    </div>

                    <button onClick={onClose} style={closeBtn}>
                        Return to system view
                    </button>
                </div>

                {/* Embedded HTML */}
                <iframe
                    src="/resolution/index.html"
                    title="Action Resolution"
                    style={iframe}
                />
            </div>
        </div>
    );
}

/* ---------- styles ---------- */

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(2,6,23,0.55)",
    zIndex: 50,
};

const panel: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: 0,
    borderLeft: "1px solid #e5e7eb",
    height: "100%",
    width: "70%",
    background: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-8px 0 16px rgba(0,0,0,0.25)",
};

const header: React.CSSProperties = {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const subtitle: React.CSSProperties = {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#64748b",
};

const closeBtn: React.CSSProperties = {
    border: "none",
    background: "transparent",
    color: "#1e40af",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
};

const iframe: React.CSSProperties = {
    flex: 1,
    border: "none",
    width: "100%",
};
