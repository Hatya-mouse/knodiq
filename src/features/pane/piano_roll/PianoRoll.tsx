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
import { TrackState } from "@/lib/audio_api/track_state";
import { PaneContentType } from "@/lib/type/PaneNode";
import { useState } from "react";

export default function PianoRoll({
    trackState,
    onPaneSelect = () => { },
}: {
    trackState: TrackState
    onPaneSelect?: (pane: PaneContentType) => void
}) {
    const [beatWidth, _] = useState(10);
    // const [contentWidth, setContentWidth] = useState(0);

    let regions = trackState.regions;

    return (
        <div>
            {/* Header */}
            <PaneHeader
                selectedPane={PaneContentType.PianoRoll}
                onPaneSelect={onPaneSelect}
            />
            {regions.map((region) => (
                <div key={region.id} style={{
                    position: 'relative',
                    border: 'var(--border)',
                    marginBottom: '10px',
                    backgroundColor: trackState.color,
                    left: `${region.start_time * beatWidth}px`,
                }}>
                    {region.data.NoteRegion.map((note) => (
                        <div key={note.id} style={{
                            left: `${(note.start_time - region.start_time) * beatWidth}px`,
                            width: `${note.duration * beatWidth}px`
                        }} />
                    ))}
                </div>
            ))}
        </div>
    );
}
