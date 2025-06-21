import { TrackState } from "@/lib/audio_api/track_state";
import RegionView from "@/features/pane/track_area/RegionView";

export default function TrackListContent({
    track,
    beatWidth,
    width = 0,
    height = 50,
    className = "",
    onMoveRegion,
}: {
    track: TrackState,
    beatWidth: number,
    width?: number,
    height?: number,
    className?: string,
    onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
}) {
    const moveRegion = (id: number, newBeats: number) => {
        if (onMoveRegion) onMoveRegion(track.id, id, newBeats);
    };

    return (
        <div
            className={`bottom-border pr-16 py-2 flex items-center relative ${className}`}
            style={{
                width: width,
                height: height,
            }}
        >
            {track.regions.map((region, i) =>
                <RegionView
                    region={region}
                    key={i}
                    beatWidth={beatWidth}
                    onMoveRegion={moveRegion}
                />
            )}
        </div>
    );
}