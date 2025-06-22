import React, { useRef } from "react";
import { NodeState } from "@/lib/audio_api/graph_state";

export default function NodeBox({
    nodeState,
    onMove,
    onMoveEnded,
}: {
    nodeState: NodeState,
    onMove?: (newPosition: [number, number]) => void,
    onMoveEnded?: (newPosition: [number, number]) => void,
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

    return (
        <div
            className="absolute rounded-[var(--border-radius)] bg-[var(--bg-primary)] shadow overflow-hidden select-none"
            style={{
                border: "var(--border)",
                left: nodeState.position[0],
                top: nodeState.position[1]
            }}
        >
            {/* Header */}
            <div
                className="bg-[var(--bg-secondary)] px-1.5 py-1 text-sm font-medium cursor-move"
                style={{ borderBottom: "var(--border)" }}
                onMouseDown={onMouseDown}
            >
                {nodeState.node_type}
            </div>

            {/* Content */}
            <div className="p-2">

            </div>
        </div>
    );
}