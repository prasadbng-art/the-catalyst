type PageShellProps = {
    children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100vw",
                background: "#020617",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 1280,
                    marginLeft: "clamp(16px, 3vw, 48px)",
                    padding: "clamp(24px, 4vw, 48px)",
                    boxSizing: "border-box",
                }}
            >
                {children}
            </div>
        </div>
    );
}
