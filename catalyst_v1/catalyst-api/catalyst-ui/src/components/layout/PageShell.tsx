import type { ReactNode } from "react";

type PageShellProps = {
    children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden", // system boundary
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 1280,
                    height: "100%",
                    paddingLeft: "clamp(24px, 4vw, 48px)",
                    paddingRight: "clamp(24px, 4vw, 48px)",
                    paddingBottom: "clamp(24px, 4vw, 48px)",
                    paddingTop: "clamp(32px, 5vh, 48px)",
                    boxSizing: "border-box",
                    marginRight: "auto",
                    overflowY: "auto", // page-level vertical scroll
                }}
            >
                {children}
            </div>
        </div>
    );
}
