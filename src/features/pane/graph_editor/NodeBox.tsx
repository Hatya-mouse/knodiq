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

import React, { useRef } from "react";
import { NodeState } from "@/lib/audio_api/graph_state";
import CircleButton from "./CircleButton";
import { LucideX } from "lucide-react";

export default function NodeBox({
    nodeState,
    isSelected = false,
    onClick,
    onMove,
    onMoveEnded,
    onRemove,
    onClickParameter,
    onMouseDownParameter,
    onMouseEnterParameter,
    onMouseLeaveParameter,
}: {
    nodeState: NodeState,
    isSelected?: boolean,
    onClick?: (nodeId: string) => void,
    onMove?: (newPosition: [number, number]) => void,
    onMoveEnded?: (newPosition: [number, number]) => void,
    onRemove?: () => void,
    onClickParameter?: (nodeId: string, key: string, isInput: boolean) => void,
    onMouseDownParameter?: (nodeId: string, key: string, isInput: boolean) => void,
    onMouseEnterParameter?: (nodeId: string, key: string, isInput: boolean) => void,
    onMouseLeaveParameter?: (nodeId: string, key: string, isInput: boolean) => void,
}) {
    const dragging = useRef(false);
    const offset = useRef([0, 0]);

    function onMouseDown(e: React.MouseEvent) {
        dragging.current = true;
        offset.current = [
            e.clientX - nodeState.position[0],
            e.clientY - nodeState.position[1],
        ];
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function onMouseMove(e: MouseEvent) {
        if (!dragging.current) return;
        onMove?.([
            e.clientX - offset.current[0],
            e.clientY - offset.current[1],
        ]);
    }

    function onMouseUp(e: MouseEvent) {
        dragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        onMoveEnded?.([
            e.clientX - offset.current[0],
            e.clientY - offset.current[1],
        ]);
    }

    const handleBoxClick = () => {
        if (onClick) {
            onClick(nodeState.id);
        }
    };

    return (
        <div
            className="absolute rounded-[var(--border-radius)] bg-[var(--bg-primary)] overflow-hidden select-none"
            style={{
                borderColor: isSelected ? "var(--accent-color)" : "var(--border-color)",
                borderWidth: "1px",
                outlineColor: isSelected ? "var(--accent-color)" : "transparent",
                outlineStyle: "solid",
                outlineWidth: "1px",
                left: nodeState.position[0],
                top: nodeState.position[1]
            }}
            onClick={handleBoxClick}
        >
            {/* Header */}
            <div
                className="bg-[var(--bg-secondary)] flex flex-row justify-between px-1.5 py-1 text-sm font-medium cursor-move"
                style={{
                    borderBottomColor: "var(--border-color)",
                    borderBottomWidth: "1px",
                    borderBottomStyle: "solid",
                }}
                onMouseDown={onMouseDown}
            >
                {nodeState.name}

                <div className="flex items-center">
                    <button className="flex justify-center items-center rounded h-5 w-5 hover:bg-[var(--bg-tertiary)] transition cursor-pointer" onClick={onRemove}>
                        <LucideX size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-row gap-2 px-2 py-1">
                <div className="flex-1 gap-1 text-sm">
                    {!nodeState.is_input_node && nodeState.inputs.map((input, index) => (
                        <div key={index} className="flex items-center justify-start gap-1">
                            <CircleButton
                                id={`conn-${nodeState.id}-input-${input}`}
                                className="bg-[var(--button-default)] hover:bg-[var(--button-hover)] active:bg-[var(--button-active)]"
                                onClick={onClickParameter ? () => onClickParameter(nodeState.id, input, true) : undefined}
                                onMouseDown={onMouseDownParameter ? () => onMouseDownParameter(nodeState.id, input, true) : undefined}
                                onMouseEnter={onMouseEnterParameter ? () => onMouseEnterParameter(nodeState.id, input, true) : undefined}
                                onMouseLeave={onMouseLeaveParameter ? () => onMouseLeaveParameter(nodeState.id, input, true) : undefined}
                            />
                            {input}
                        </div>
                    ))}
                </div>

                <div className="flex-1 gap-1 text-sm">
                    {!nodeState.is_output_node && nodeState.outputs.map((output, index) => (
                        <div key={index} className="text-right flex items-center justify-end gap-1">
                            {output}
                            <CircleButton
                                id={`conn-${nodeState.id}-output-${output}`}
                                className="bg-[var(--button-default)] hover:bg-[var(--button-hover)] active:bg-[var(--button-active)]"
                                onClick={onClickParameter ? () => onClickParameter(nodeState.id, output, false) : undefined}
                                onMouseDown={onMouseDownParameter ? () => onMouseDownParameter(nodeState.id, output, false) : undefined}
                                onMouseEnter={onMouseEnterParameter ? () => onMouseEnterParameter(nodeState.id, output, false) : undefined}
                                onMouseLeave={onMouseLeaveParameter ? () => onMouseLeaveParameter(nodeState.id, output, false) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
