import { useState, useRef, useEffect, useCallback } from "react";

import TrackListItem from "@/features/pane/track_area/TrackListItem";
import TrackListContent from "@/features/pane/track_area/TrackListContent";
import HSplitView from "@/components/split_view/HSplitView";
import { MixerState } from "@/lib/audio_api/mixer_state";

const MIN_SPLIT_WIDTH = 150;

export default function TrackArea({
    mixerState,
    currentTime = 0,
    selectedTrackId,
    onAddTrack,
    onRemoveTrack,
    onSelectTrack,
    onMoveRegion,
    seek,
}: {
    mixerState?: MixerState,
    currentTime?: number,
    selectedTrackId?: number,
    onAddTrack?: () => void,
    onRemoveTrack?: (trackId: number) => void,
    onSelectTrack?: (trackId: number) => void,
    onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
    seek?: (beats: number) => void,
}) {
    const [trackHeight, _] = useState(60);
    const [beatWidth, setBeatWidth] = useState(10);
    const [contentWidth, setContentWidth] = useState(0);
    const [splitLeftWidth, setSplitLeftWidth] = useState(200);

    const trackAreaRef = useRef<HTMLDivElement>(null);
    const rightPaneRef = useRef<HTMLDivElement>(null);

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
            const newContentWidth = (beatWidth * mixerState.duration) + 500;
            setContentWidth(newContentWidth);
        };

        rightPaneElement?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            rightPaneElement?.removeEventListener("wheel", handleWheel);
        };
    }, [beatWidth, mixerState]);

    // Seek to the clicked time marker.
    const timeMarkerClicked = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!seek) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const clickedBeat = x / beatWidth;
        seek(clickedBeat);
    };

    const handleDragSplit = useCallback((newSize: number) => {
        if (!trackAreaRef.current) return;
        setSplitLeftWidth(Math.min(Math.max(newSize, MIN_SPLIT_WIDTH), trackAreaRef.current.clientWidth - MIN_SPLIT_WIDTH));
    }, []);

    return (
        <div
            className="h-full flex-1 overflow-x-hidden overflow-y-scroll scrollbar-hidden"
            ref={trackAreaRef}
        >
            <HSplitView className="w-full min-h-full" doesStrech={true} left={(
                <div>
                    {/* Track list */}
                    <button
                        className="text-[var(--fg)] bottom-border w-full h-8 cursor-pointer track-list-item"
                        onClick={onAddTrack}
                    >
                        Add Track
                    </button>
                    {(mixerState?.tracks ?? []).map((track) => (
                        <TrackListItem
                            key={track.id}
                            track={track}
                            isSelected={selectedTrackId === track.id}
                            height={trackHeight}
                            onRemoveTrack={onRemoveTrack}
                            onSelectTrack={onSelectTrack}
                        />
                    ))}
                </div>
            )} right={(
                <div
                    ref={rightPaneRef}
                    className="bg-[var(--bg-tertiary)] h-full overflow-x-scroll overflow-y-hidden relative"
                    style={{
                        position: "relative",
                    }}
                >
                    {/* Top time markers */}
                    <div
                        className="top-0 left-0 w-full h-8 flex select-none bottom-border"
                        style={{ width: contentWidth || "100%" }}
                        onClick={timeMarkerClicked}
                    >
                        {Array.from({ length: Math.ceil((mixerState?.duration ?? 0) / 4) }).map((_, index) => (
                            <div
                                key={index}
                                className="px-1"
                                style={{
                                    position: "absolute",
                                    left: `${index * 4 * beatWidth}px`,
                                }}
                            >
                                <div className="text-left text-[var(--fg)] text-sm">
                                    {index * 4}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Track contents */}
                    {(mixerState?.tracks ?? []).map((track, index) => (
                        <TrackListContent
                            key={index}
                            beatWidth={beatWidth}
                            width={contentWidth}
                            height={trackHeight}
                            track={track}
                            onMoveRegion={onMoveRegion}
                        />
                    ))}

                    {/* Grid overlay */}
                    <div
                        className="pointer-events-none absolute top-0 left-0 h-full"
                        style={{
                            width: contentWidth || "100%",
                            minWidth: "100%",
                            zIndex: 2,
                            backgroundImage:
                                `repeating-linear-gradient(to right, rgba(128,128,128,0.2) 0px, rgba(128,128,128,0.2) 1px, transparent 1px, transparent ${beatWidth * 4}px)`,
                        }}
                    />

                    {/* Playback head */}
                    <div className="absolute top-0 h-full bg-black" style={{
                        left: `${beatWidth * currentTime}px`,
                        width: '1px',
                        zIndex: 3,
                        pointerEvents: 'none',
                    }} />
                </div>
            )}
                leftWidth={splitLeftWidth} onDragMove={handleDragSplit} />
        </div >
    );
}
