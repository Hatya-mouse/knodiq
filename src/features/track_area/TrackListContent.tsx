import { TrackState } from "@/lib/audio_api/track_state";
import RegionView from "@/features/track_area/RegionView";

export default function TrackListContent({
    track,
    className = "",
    height = 50
}: {
    track: TrackState,
    className?: string,
    height?: number
}) {
    return (
        <div className={`bottom-border pr-16 py-2 min-w-full w-fit ${className}`} style={{ height: height }}>
            {track.regions.map((region, i) =>
                <RegionView region={region} className="" key={i} />
            )}
        </div>
    );
}