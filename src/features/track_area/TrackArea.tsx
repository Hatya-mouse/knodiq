import { useState, useRef, useEffect } from "react";

import { TrackState } from "@/lib/audio_api/track_state";
import TrackListItem from "@/features/track_area/TrackListItem";
import TrackListContent from "@/features/track_area/TrackListContent";
import SplitView from "@components/pane/SplitView";

export default function TrackArea({
    tracks,
    onAddTrack,
    onRemoveTrack,
}: {
    tracks?: TrackState[],
    onAddTrack?: () => void,
    onRemoveTrack?: (index: number) => void,
}) {
    const [trackHeight, setTrackHeight] = useState(60);
    const rightPaneRef = useRef<HTMLDivElement>(null);
    const [gridWidth, setGridWidth] = useState(0);

    useEffect(() => {
        const updateGridWidth = () => {
            if (rightPaneRef.current) {
                setGridWidth(rightPaneRef.current.scrollWidth);
            }
        };
        updateGridWidth();
        window.addEventListener("resize", updateGridWidth);
        return () => window.removeEventListener("resize", updateGridWidth);
    }, [tracks]);

    return (
        <div className="h-full flex-1 overflow-x-hidden overflow-y-scroll scrollbar-hidden">
            <SplitView className="w-full min-h-full" doesStrech={true} left={(
                <div>
                    {(tracks ?? []).map((track, index) => (
                        <TrackListItem key={index} height={trackHeight} track={track} index={index} onRemoveTrack={onRemoveTrack} />
                    ))}
                    <button className="text-[var(--fg)] bottom-border w-full cursor-pointer track-list-item" style={{ height: trackHeight }} onClick={onAddTrack}>Add Track</button>
                </div>
            )} right={(
                <div
                    ref={rightPaneRef}
                    className="bg-[var(--bg-tertiary)] h-full overflow-x-scroll overflow-y-hidden relative"
                    style={{ position: "relative" }}
                >
                    {/* Track contents */}
                    {(tracks ?? []).map((track, index) => (
                        <TrackListContent key={index} height={trackHeight} track={track} />
                    ))}
                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute top-0 left-0 h-full"
                        style={{
                            width: gridWidth || "100%",
                            zIndex: 10,
                            backgroundImage:
                                "repeating-linear-gradient(to right, rgba(128,128,128,0.2) 0px, rgba(128,128,128,0.2) 1px, transparent 1px, transparent 64px)",
                        }}
                    />
                </div>
            )} initialLeftWidth={300} minLeftWidth={250} minRightWidth={250} />
        </div>
    );
}
