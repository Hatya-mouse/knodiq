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
import { useState, useEffect } from "react";
import { NodeState } from "@/lib/audio_api/graph_state";

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
    onAddNode?: () => void,
    onRemoveNode?: (nodeId: string) => void,
    onConnectNodes?: (sourceId: string, targetId: string) => void,
    onDisconnectNodes?: (sourceId: string, targetId: string) => void,
    onMoveNode?: (trackId: number, nodeId: string, newPosition: [number, number]) => void,
}) {
    const selectedTrack = mixerState?.tracks.find(track => track.id === selectedTrackId);
    const [localNodes, setLocalNodes] = useState<NodeState[]>([]);

    useEffect(() => {
        setLocalNodes(selectedTrack?.graph.nodes ?? []);
    }, [selectedTrack]);

    function handleNodeMove(nodeId: string, newPosition: [number, number]) {
        setLocalNodes(currentNodes =>
            currentNodes.map(node =>
                node.id === nodeId ? { ...node, position: newPosition } : node
            )
        );
    }

    function handleNodeMoveEnd(nodeId: string, newPosition: [number, number]) {
        const node = localNodes.find(n => n.id === nodeId);
        if (node !== undefined && selectedTrackId !== undefined) {
            onMoveNode?.(selectedTrackId, node.id, newPosition);
        }
    }

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <PaneHeader
                selectedPane={PaneContentType.NodeEditor}
                onPaneSelect={onPaneSelect}
                controls={
                    <div className="flex items-center">
                        <button className="flex justify-center items-center rounded h-5 w-5 hover:bg-[var(--bg-tertiary)] transition cursor-pointer">
                            <LucidePlus size={16} />
                        </button>
                    </div>
                }
            />

            {/* Node Editor */}
            <div className="w-full h-full p-2 bg-[var(--bg-tertiary)] relative flex-1 overflow-scroll">
                {localNodes.map(node => (
                    <NodeBox
                        key={node.id}
                        nodeState={node}
                        onMove={(newPosition) => handleNodeMove(node.id, newPosition)}
                        onMoveEnded={(newPosition) => handleNodeMoveEnd(node.id, newPosition)}
                    />
                ))}
            </div>
        </div>
    );
}
