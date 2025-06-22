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
