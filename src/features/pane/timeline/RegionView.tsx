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

import { RegionState } from "@lib/audio_api/region_state";
import { useEffect, useState } from "react";

export default function RegionView({
    region,
    beatWidth,
    className = "",
    onMoveRegion,
}: {
    region: RegionState,
    beatWidth: number,
    className?: string,
    onMoveRegion?: (id: number, newBeats: number) => void,
}) {
    const [dragging, setDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState<number | undefined>(undefined);
    const [uiRegionX, setUIRegionX] = useState<number | undefined>(undefined);

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setDragStartX(e.clientX);
        document.body.style.userSelect = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging || dragStartX === undefined) return;
        const deltaX = e.clientX - dragStartX;
        setUIRegionX(Math.max(0, region.start_time * beatWidth + deltaX));
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!dragging || dragStartX === undefined) return;
        setDragging(false);
        document.body.style.userSelect = "";

        const deltaX = e.clientX - dragStartX;
        const deltaBeats = deltaX / beatWidth;
        const newBeats = Math.max(0, region.start_time + deltaBeats);

        setUIRegionX(undefined);
        if (onMoveRegion) onMoveRegion(region.id, newBeats);
    };

    useEffect(() => {
        if (dragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, dragStartX]);

    return (
        <div
            className={`flex h-full default-border bg-amber-500 cursor-grab active:cursor-grabbing ${className}`}
            style={{
                marginLeft: uiRegionX ?? region.start_time * beatWidth,
                width: region.duration * beatWidth,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="text-[var(--text)] text-xs p-1">
                {region.name}
            </div>
        </div>
    )
}
