//
// Copyright 2025 Shuntaro Kasatani
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { useState, useRef, useEffect, useCallback } from "react";

import TrackListItem from "@/features/pane/timeline/TrackListItem";
import TrackListContent from "@/features/pane/timeline/TrackListContent";
import HSplitView from "@/components/split_view/HSplitView";
import { MixerState } from "@/lib/audio_api/mixer_state";
import { PaneContentType } from "@/lib/type/PaneNode";
import PaneHeader from "@/components/pane/PaneHeader";

const MIN_SPLIT_WIDTH = 150;

export default function Timeline({
    onPaneSelect = () => { },
    mixerState,
    currentTime = 0,
    selectedTrackId,
    onAddTrack,
    onRemoveTrack,
    onSelectTrack,
    onAddRegion,
    onMoveRegion,
    onSelectRegion,
    seek,
}: {
    onPaneSelect?: (pane: PaneContentType) => void,
    mixerState?: MixerState,
    currentTime?: number,
    selectedTrackId?: number,
    onAddTrack?: () => void,
    onRemoveTrack?: (trackId: number) => void,
    onSelectTrack?: (trackId: number) => void,
    onAddRegion?: (trackId: number, name: string, startTime: number, duration: number) => void,
    onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
    onSelectRegion?: (trackId: number, regionId: number) => void,
    seek?: (beats: number) => void,
}) {
    const [trackHeight, _] = useState(40);
    const [beatWidth, setBeatWidth] = useState(10);
    const [contentWidth, setContentWidth] = useState(0);
    const [splitLeftWidth, setSplitLeftWidth] = useState(200);

    const trackAreaRef = useRef<HTMLDivElement>(null);
    const rightPaneRef = useRef<HTMLDivElement>(null);

    // Update content width when beatWidth or mixerState changes
    useEffect(() => {
        if (mixerState) {
            const newContentWidth = (beatWidth * mixerState.duration) + 500;
            setContentWidth(newContentWidth);
        }
    }, [beatWidth, mixerState]);

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
        };

        rightPaneElement?.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            rightPaneElement?.removeEventListener("wheel", handleWheel);
        };
    }, [beatWidth]);

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
            className="h-full flex-1 flex flex-col overflow-hidden"
            ref={trackAreaRef}
        >
            <PaneHeader
                selectedPane={PaneContentType.Timeline}
                onPaneSelect={onPaneSelect}
            />

            <HSplitView className="w-full flex-1" doesStrech={true} left={(
                <div className="h-full bg-[var(--bg-primary)]">
                    {/* Track list */}
                    <button
                        className="text-[var(--text)] w-full h-8 cursor-pointer track-list-item"
                        style={{
                            borderBottom: "1px solid var(--border-color)",
                        }}
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
                        className="top-0 left-0 w-full h-8 flex select-none"
                        style={{
                            width: contentWidth || "100%",
                            borderBottom: "1px solid var(--border-color)",
                        }}

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
                                <div className="text-left text-[var(--text)] text-sm">
                                    {index}
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
                            onAddRegion={onAddRegion}
                            onSelectRegion={onSelectRegion}
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
