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
                    maxWidth: 1200,
                    padding: "clamp(24px, 4vw, 48px)",
                    boxSizing: "border-box",
                    margin: "0 auto",   // critical
                }}
            >
                {children}
            </div>

        </div>
    );
}
