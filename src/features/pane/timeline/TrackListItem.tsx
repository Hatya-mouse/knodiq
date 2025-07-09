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

import BasicButton, { ButtonType } from "@/components/controls/BasicButton";
import { TrackState } from "@/lib/audio_api/track_state";
import { Trash2 } from "lucide-react";

export default function TrackListItem({
    track,
    isSelected = false,
    height = 50,
    onRemoveTrack,
    onSelectTrack,
}: {
    track: TrackState,
    isSelected?: boolean,
    height?: number,
    onRemoveTrack?: (trackId: number) => void | undefined,
    onSelectTrack?: (trackId: number) => void | undefined,
}) {
    const handleRemoveTrack = () => {
        if (onRemoveTrack) {
            onRemoveTrack(track.id);
        }
    }

    return (
        <div
            className="text-[var(--text)] flex flex-row justify-between items-center gap-1 bottom-border px-3 py-2"
            style={{ height: height, overflow: "hidden" }}
        >
            <h3 className="text-ellipsis whitespace-nowrap overflow-hidden">{track.name}</h3>
            <div className="flex flex-row items-center gap-2">
                <button
                    className={`rounded-full outline-4 w-4 h-4 mx-1 hover:brightness-80 active:brightness-50 disabled:cursor-default disabled:opacity-50 cursor-pointer transition-all duration-100 ease-in-out ${isSelected ? "bg-[var(--accent-color)] outline-[var(--accent-color-transparent)]" : "bg-[var(--button-active)] outline-[var(--button-hover)]"}`}
                    onClick={() => {
                        if (onSelectTrack) {
                            onSelectTrack(track.id);
                        }
                    }}
                />
                <BasicButton type={ButtonType.Destructive} onClick={handleRemoveTrack}>
                    <Trash2 size={16} />
                </BasicButton>
            </div>
        </div>
    );
}
