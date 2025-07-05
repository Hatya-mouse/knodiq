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

import { MixerState } from "@/lib/audio_api/mixer_state";
import NodeBox from "./NodeBox";
import { LucidePlus } from "lucide-react";
import PaneHeader from "@/components/pane/PaneHeader";
import { PaneContentType } from "@/lib/type/PaneNode";
import { useState, useEffect, useRef, useCallback } from "react";
import { getNodeTypes, NodeState } from "@/lib/audio_api/graph_state";
import NodeConnector from "./NodeConnector";
import DropdownMenu from "@/components/button/DropdownMenu";

export default function NodeEditor({
    onPaneSelect = () => { },
    mixerState,
    selectedTrackId,
    onAddNode,
    onRemoveNode,
    onConnectNodes,
    onDisconnectNodes,
    onMoveNode
}: {
    onPaneSelect?: (pane: PaneContentType) => void,
    mixerState?: MixerState,
    selectedTrackId?: number,
    onAddNode?: (trackId: number, nodeType: string, position: [number, number]) => void,
    onRemoveNode?: (trackId: number, nodeId: string) => void,
    onConnectNodes?: (trackId: number, from: string, fromParam: string, to: string, toParam: string) => void,
    onDisconnectNodes?: (trackId: number, from: string, fromParam: string, to: string, toParam: string) => void,
    onMoveNode?: (trackId: number, nodeId: string, newPosition: [number, number]) => void,
}) {
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [localNodes, setLocalNodes] = useState<NodeState[]>([]);

    // Position of properties on the UI for drawing connectors
    const [connectorPoints, setConnectorPoints] = useState<Map<string, [number, number]>>(new Map());

    // States for dragging connectors
    const [draggingProperty, setDraggingProperty] = useState<{ nodeId: string, paramKey: string, isInput: boolean } | undefined>(undefined);
    const [hoveredProperty, setHoveredProperty] = useState<{ nodeId: string, paramKey: string, isInput: boolean } | undefined>(undefined);
    const [draggingPosition, setDraggingPosition] = useState<[number, number] | undefined>(undefined);

    const selectedTrack = mixerState?.tracks.find(track => track.id === selectedTrackId);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalNodes(selectedTrack?.graph.nodes ?? []);
    }, [selectedTrack]);

    // Get the positions of all node inputs and outputs for drawing connectors
    useEffect(() => {
        if (!selectedTrack || !editorRef.current) return;

        const newPoints = new Map<string, [number, number]>();
        const editorRect = editorRef.current.getBoundingClientRect();

        for (const node of localNodes) {
            for (const input of node.inputs) {
                const id = `conn-${node.id}-input-${input}`;
                const elem = document.getElementById(id);
                if (elem) {
                    const rect = elem.getBoundingClientRect();
                    const x = rect.left + rect.width / 2 - editorRect.left + editorRef.current.scrollLeft;
                    const y = rect.top + rect.height / 2 - editorRect.top + editorRef.current.scrollTop;
                    newPoints.set(id, [x, y]);
                }
            }
            for (const output of node.outputs) {
                const id = `conn-${node.id}-output-${output}`;
                const elem = document.getElementById(id);
                if (elem) {
                    const rect = elem.getBoundingClientRect();
                    const x = rect.left + rect.width / 2 - editorRect.left + editorRef.current.scrollLeft;
                    const y = rect.top + rect.height / 2 - editorRect.top + editorRef.current.scrollTop;
                    newPoints.set(id, [x, y]);
                }
            }
        }
        setConnectorPoints(newPoints);
    }, [localNodes, selectedTrack]);

    // Connectors dragging handlers
    const handleMouseDownParameter = useCallback((nodeId: string, paramKey: string, isInput: boolean) => {
        if (selectedTrackId !== undefined) {
            let connectedConn = selectedTrack?.graph.connections.find(conn => conn.to === nodeId && conn.to_param === paramKey);
            if (isInput && connectedConn !== undefined) {
                setHoveredProperty({ nodeId, paramKey, isInput });
                setDraggingProperty({ nodeId: connectedConn.from, paramKey: connectedConn.from_param, isInput: false });
                setDraggingPosition(connectorPoints.get(`conn-${nodeId}-input-${paramKey}`));
                onDisconnectNodes?.(selectedTrackId, connectedConn.from, connectedConn.from_param, nodeId, paramKey);
            } else {
                setDraggingProperty({ nodeId, paramKey, isInput });
                setDraggingPosition(connectorPoints.get(`conn-${nodeId}-${isInput ? 'input' : 'output'}-${paramKey}`));
            }
        }
    }, [selectedTrackId, connectorPoints]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (draggingProperty && editorRef.current) {
            // Get the relative position of the cursor within the editor rect
            const editorRect = editorRef.current.getBoundingClientRect();
            const x = e.clientX - editorRect.left + editorRef.current.scrollLeft;
            const y = e.clientY - editorRect.top + editorRef.current.scrollTop;
            setDraggingPosition([x, y]);

            e.preventDefault();
        }
    }, [draggingProperty]);

    const handleMouseUp = useCallback(() => {
        if (draggingProperty) {
            if (hoveredProperty && hoveredProperty !== draggingProperty) {
                let sourceId = draggingProperty.isInput ? hoveredProperty : draggingProperty;
                let targetId = draggingProperty.isInput ? draggingProperty : hoveredProperty;

                if (onConnectNodes) {
                    onConnectNodes(selectedTrackId ?? -1, sourceId.nodeId, sourceId.paramKey, targetId.nodeId, targetId.paramKey);
                }
            }

            setDraggingProperty(undefined);
            setHoveredProperty(undefined);
            setDraggingPosition(undefined);
        }
    }, [draggingProperty, hoveredProperty, selectedTrackId, onConnectNodes]);

    // Node movement handlers
    const handleNodeMove = (nodeId: string, newPosition: [number, number]) => {
        setLocalNodes(currentNodes =>
            currentNodes.map(node =>
                node.id === nodeId ? { ...node, position: newPosition } : node
            )
        );
    };

    const handleNodeMoveEnd = (nodeId: string, newPosition: [number, number]) => {
        const node = localNodes.find(n => n.id === nodeId);
        if (node !== undefined && selectedTrackId !== undefined) {
            onMoveNode?.(selectedTrackId, node.id, newPosition);
        }
    };

    return (
        <div className="w-full h-full flex flex-col" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            {/* Header */}
            <PaneHeader
                selectedPane={PaneContentType.NodeEditor}
                onPaneSelect={onPaneSelect}
                controls={
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center">
                            <button
                                className="flex justify-center items-center rounded h-5 w-5 hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
                                onClick={() => {
                                    setIsAddMenuOpen(!isAddMenuOpen);
                                }}
                            >
                                <LucidePlus size={16} />
                            </button>

                        </div>

                        <DropdownMenu
                            options={getNodeTypes().map((nodeType) => ({
                                label: nodeType,
                                value: nodeType,
                            }))}
                            isOpen={isAddMenuOpen}
                            onSelect={(value) => {
                                setIsAddMenuOpen(false);
                                if (selectedTrackId !== undefined) {
                                    onAddNode?.(selectedTrackId, value, [0, 0]);
                                }
                            }}
                            align="right"
                            className="mt-0"
                        />
                    </div>
                }
            />

            {/* Node Editor */}
            <div ref={editorRef} className="w-full h-full p-2 bg-[var(--bg-tertiary)] relative flex-1 overflow-scroll">
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                    {selectedTrack?.graph.connections.map((conn, index) => {
                        const fromId = `conn-${conn.from}-output-${conn.from_param}`;
                        const toId = `conn-${conn.to}-input-${conn.to_param}`;
                        const fromPoint = connectorPoints.get(fromId);
                        const toPoint = connectorPoints.get(toId);

                        if (fromPoint && toPoint) {
                            return (
                                <NodeConnector
                                    key={`${conn.from}-${conn.to}-${index}`}
                                    x1={fromPoint[0]}
                                    y1={fromPoint[1]}
                                    x2={toPoint[0]}
                                    y2={toPoint[1]}
                                />
                            );
                        }
                        return null;
                    })}

                    {draggingProperty && draggingPosition && (
                        <NodeConnector
                            x1={connectorPoints.get(`conn-${draggingProperty.nodeId}-${draggingProperty.isInput ? 'input' : 'output'}-${draggingProperty.paramKey}`)?.[0] ?? 0}
                            y1={connectorPoints.get(`conn-${draggingProperty.nodeId}-${draggingProperty.isInput ? 'input' : 'output'}-${draggingProperty.paramKey}`)?.[1] ?? 0}
                            x2={draggingPosition[0]}
                            y2={draggingPosition[1]}
                        />
                    )}
                </svg>

                {localNodes.map(node => (
                    <NodeBox
                        key={node.id}
                        nodeState={node}
                        onMove={(newPosition) => handleNodeMove(node.id, newPosition)}
                        onMoveEnded={(newPosition) => handleNodeMoveEnd(node.id, newPosition)}
                        onRemove={() => {
                            if (selectedTrackId !== undefined) {
                                onRemoveNode?.(selectedTrackId, node.id);
                            }
                        }}
                        onMouseDownParameter={handleMouseDownParameter}
                        onMouseEnterParameter={(nodeId, paramKey, isInput) => {
                            setHoveredProperty({ nodeId, paramKey, isInput });
                        }}
                        onMouseLeaveParameter={() => {
                            setHoveredProperty(undefined);
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
