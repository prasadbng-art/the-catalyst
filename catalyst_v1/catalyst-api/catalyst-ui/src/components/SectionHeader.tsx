type SectionHeaderProps = {
    title: string
    subtitle: string
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
    return (
        <div className="mb-6 border-b border-slate-700 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
                {title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
                {subtitle}
            </p>
        </div>
    )
}
