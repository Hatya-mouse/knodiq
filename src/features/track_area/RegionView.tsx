import { RegionState } from "@lib/audio_api/region_state";

export default function RegionView({
    region,
    className = "",
}: {
    region: RegionState,
    className?: string,
}) {
    return (
        <div className={`h-full default-border bg-amber-500 ${className}`} style={{ width: region.duration * 10 }}></div>
    )
}