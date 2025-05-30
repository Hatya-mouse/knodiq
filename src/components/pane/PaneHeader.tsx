export default function PaneHeader({
    title,
}: {
    title?: string,
}) {
    return (
        <div className="flex" style={{
            borderBottom: "var(--border)",
        }}>
            <div className="text-sm font-medium flex-1 px-3 py-2 bg-[var(--bg-secondary)]">
                <h2 className="text-[var(--fg)]">
                    {title || "Untitled"}
                </h2>
            </div>
            <div className="flex-none">
                {/* Placeholder for future actions */}
            </div>
        </div>
    )
}