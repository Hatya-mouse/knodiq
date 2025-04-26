import { Track, BufferTrack } from "@lib/audio_api/track";
import RegionView from "@features/tracks_area/RegionView";

export default function TrackListContent({
    track,
    index,
    className = "",
    height = 50
}: {
    track: Track,
    index: number,
    className?: string,
    height?: number
}) {
    return (
        <div className={`bottom-border px-2 min-w-full w-fit ${className}`} style={{ height: height }}>
            {track instanceof BufferTrack ? (<div>
                <RegionView className="" />
            </div>) : (<div>
            </div>)}
            <RegionView className="" />
        </div>
    );
}