import { useState } from "react";

import { Track } from "@/lib/audio_api/track_state";
import TrackListItem from "@features/tracks_area/TrackListItem";
import TrackListContent from "@features/tracks_area/TrackListContent";
import SplitView from "@components/SplitView";

export default function TracksArea({
    tracks,
    onAddTrack,
    onRemoveTrack,
}: {
    tracks?: Track[],
    onAddTrack?: () => void,
    onRemoveTrack?: (index: number) => void,
}) {
    const [trackHeight, setTrackHeight] = useState(50);

    return (
        <div className="flex-1 overflow-x-hidden overflow-y-scroll scrollbar-hidden">
            <SplitView className="w-full min-h-full" doesStrech={true} left={(
                <div>
                    {(tracks ?? []).map((track, index) => (
                        <TrackListItem key={index} height={trackHeight} track={track} index={index} onRemoveTrack={onRemoveTrack} />
                    ))}
                    <button className="bottom-border w-full cursor-pointer track-list-item" style={{ height: trackHeight }} onClick={onAddTrack}>Add Track</button>
                </div>
            )} right={(
                <div className="h-full overflow-x-scroll overflow-y-hidden">
                    {(tracks ?? []).map((track, index) => (
                        <TrackListContent key={index} height={trackHeight} track={track} index={index} />
                    ))}
                </div>
            )} initialLeftWidth={300} minLeftWidth={250} minRightWidth={250} />
        </div>
    );
}
