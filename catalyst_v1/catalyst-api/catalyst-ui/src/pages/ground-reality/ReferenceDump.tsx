import type { ReactNode } from "react";

export default function ReferenceDump({
    children,
}: {
    children?: ReactNode;
}) {
    return <div style={{ padding: 24 }}>{children}</div>;
}
