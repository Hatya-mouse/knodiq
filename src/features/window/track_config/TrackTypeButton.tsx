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

import { getTrackTypeString, TrackType } from "@/lib/audio_api/track_state";
import clsx from "clsx";

export default function TrackTypeButton({
    className = "",
    trackType,
    description,
    isSelected = false,
    onClick,
}: {
    className?: string;
    trackType: TrackType;
    description?: string;
    isSelected?: boolean;
    onClick?: (trackType: TrackType) => void;
}) {
    return (
        <button
            className={`flex items-center justify-between px-2 py-1 text-sm font-medium ${clsx(
                isSelected ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-secondary)]"
            )} ${className}`}
            style={{
                borderBottomColor: "var(--border-color)",
                borderBottomWidth: "1px",
                borderBottomStyle: "solid",
            }}
            onClick={() => onClick?.(trackType)}
            title={description}
        >
            <span>{getTrackTypeString(trackType)}</span>
        </button>
    );
}