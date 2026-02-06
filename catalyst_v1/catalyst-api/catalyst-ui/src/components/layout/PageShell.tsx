import type { ReactNode } from "react";

type PageShellProps = {
    children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: 1600,
                margin: "0 auto",
                padding: "32px 40px",
            }}
        >
            {children}
        </div>
    );
}
