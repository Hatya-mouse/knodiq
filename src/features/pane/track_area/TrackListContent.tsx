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