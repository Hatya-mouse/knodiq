import { TrackState } from "@/lib/audio_api/track_state";
import RegionView from "@/features/track_area/RegionView";

export default function TrackListContent({
    track,
    beatWidth,
    width = 0,
    height = 50,
    className = "",
}: {
    track: TrackState,
    beatWidth: number,
    width?: number,
    height?: number,
    className?: string,
}) {
    return (
        <div className={`bottom-border pr-16 py-2 min-w-full w-fit ${className}`} style={{ height: height, width: width }}>
            {track.regions.map((region, i) =>
                <RegionView region={region} className="" key={i} beatWidth={beatWidth} />
            )}
        </div>
    );
}