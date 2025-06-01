import { RegionState } from "@lib/audio_api/region_state";

export default function RegionView({
    region,
    beatWidth,
    className = "",
}: {
    region: RegionState,
    beatWidth: number,
    className?: string,
}) {
    return (
        <div className={`h-full default-border bg-amber-500 ${className}`} style={{ width: region.duration * beatWidth }}></div>
    )
}