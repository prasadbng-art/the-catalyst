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
                    maxWidth: 1440,
                    padding: "clamp(28px, 4vw, 56px)",
                    boxSizing: "border-box",
                }}
            >
                {children}
            </div>
        </div>
    );
}
