import { useState, useRef, useEffect } from "react";

import TrackListItem from "@/features/track_area/TrackListItem";
import TrackListContent from "@/features/track_area/TrackListContent";
import SplitView from "@components/pane/SplitView";
import { MixerState } from "@/lib/audio_api/mixer_state";

export default function TrackArea({
    mixerState,
    onAddTrack,
    onRemoveTrack,
}: {
    mixerState?: MixerState,
    onAddTrack?: () => void,
    onRemoveTrack?: (index: number) => void,
}) {
    const [trackHeight, _] = useState(60);
    const [beatWidth, setBeatWidth] = useState(10);
    const rightPaneRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);

    useEffect(() => {
        const rightPaneElement = rightPaneRef.current;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            if (!rightPaneElement) return;

            if (event.ctrlKey || event.metaKey) {
                const zoomFactor = 0.001;
                const newScale = beatWidth * (1 - event.deltaY * zoomFactor);
                setBeatWidth(Math.max(0.1, Math.min(newScale, 50)));
            } else {
                // Horizontal scroll
                rightPaneElement.scrollLeft += event.deltaX;
                rightPaneElement.scrollTop += event.deltaY;
            }

            // Calculate the new content width based on the current beat width
            if (!mixerState) return;
            const newContentWidth = beatWidth * mixerState.duration;
            setContentWidth(newContentWidth);
        };

        rightPaneElement?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            rightPaneElement?.removeEventListener("wheel", handleWheel);
        };
    }, [beatWidth, mixerState]);

    return (
        <div className="h-full flex-1 overflow-x-hidden overflow-y-scroll scrollbar-hidden">
            <SplitView className="w-full min-h-full" doesStrech={true} left={(
                <div>
                    {/* Track list */}
                    {(mixerState?.tracks ?? []).map((track, index) => (
                        <TrackListItem
                            key={index}
                            height={trackHeight}
                            track={track}
                            index={index}
                            onRemoveTrack={onRemoveTrack}
                        />
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
                    {(mixerState?.tracks ?? []).map((track, index) => (
                        <TrackListContent
                            key={index}
                            beatWidth={beatWidth}
                            width={contentWidth}
                            height={trackHeight}
                            track={track}
                        />
                    ))}
                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute top-0 left-0 h-full"
                        style={{
                            width: contentWidth || "100%",
                            zIndex: 10,
                            backgroundImage:
                                `repeating-linear-gradient(to right, rgba(128,128,128,0.2) 0px, rgba(128,128,128,0.2) 1px, transparent 1px, transparent ${beatWidth * 4}px)`,
                        }}
                    />
                </div>
            )} initialLeftWidth={300} minLeftWidth={250} minRightWidth={250} />
        </div>
    );
}
