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

import PaneHeader from "@/components/pane/PaneHeader";
import { MixerState } from "@/lib/audio_api/mixer_state";
import { PaneContentType } from "@/lib/type/PaneNode";
import { useState } from "react";

export default function PianoRoll({
    onPaneSelect = () => { },
    mixerState,
    selectedTrackId,
    selectedRegionId,
    onAddNote = () => { },
    onRemoveNote = () => { },
    onUpdateNote = () => { },
}: {
    onPaneSelect?: (pane: PaneContentType) => void
    mixerState?: MixerState,
    selectedTrackId?: number,
    selectedRegionId?: number,
    onAddNote?: (trackId: number, note: { pitch: number, startTime: number, duration: number }) => void,
    onRemoveNote?: (trackId: number, noteId: string) => void,
    onUpdateNote?: (trackId: number, noteId: string, note: { pitch: number, startTime: number, duration: number }) => void,
}) {
    const [beatWidth, _] = useState(10);
    // const [contentWidth, setContentWidth] = useState(0);

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!mixerState || selectedTrackId === undefined || selectedRegionId === undefined) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const beats = Math.floor(x / beatWidth);
        const startTime = beats * 0.25; // Assuming each beat is 0.25 seconds
        const duration = 1; // Default duration of 1 second

        onAddNote(selectedTrackId, { pitch: 60, startTime, duration }); // Default pitch of 60 (Middle C)
    }

    const selectedTrack = mixerState?.tracks.find(track => track.id === selectedTrackId);
    const selectedRegion = selectedTrack?.regions.find(region => region.id === selectedRegionId);

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            {/* Header */}
            <PaneHeader
                selectedPane={PaneContentType.PianoRoll}
                onPaneSelect={onPaneSelect}
            />

            {/* Piano Roll Content */}
            <div
                className="bg-[var(--bg-tertiary)] h-full w-full overflow-x-scroll overflow-y-auto"
                onDoubleClick={handleDoubleClick}
            >
                {selectedRegion?.data.NoteRegion.map(note => (
                    <div
                        key={note.id}
                        className="absoulute"
                        style={{
                            backgroundColor: `hsl(${note.pitch * 2}, 100%, 50%)`,
                            left: `${(note.start_time - selectedRegion.start_time) * beatWidth}px`,
                            top: `${(127 - note.pitch) * 10}px`,
                            width: `${note.duration * beatWidth}px`,
                            height: '10px',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
