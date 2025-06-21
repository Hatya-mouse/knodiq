import { MixerState } from "@/lib/audio_api/mixer_state";

export default function NodeEditor({
    mixerState,
    selectedTrackId,
    onAddNode,
    onRemoveNode,
    onConnectNodes,
    onDisconnectNodes,
    onMoveNode
}: {
    mixerState?: MixerState,
    selectedTrackId?: number,
    onAddNode?: () => void,
    onRemoveNode?: (nodeId: string) => void,
    onConnectNodes?: (sourceId: string, targetId: string) => void,
    onDisconnectNodes?: (sourceId: string, targetId: string) => void,
    onMoveNode?: (nodeId: string, newPosition: { x: number, y: number }) => void,
}) {
    const selectedTrack = mixerState?.tracks.find(track => track.id === selectedTrackId);

    return (
        <div className="">
            {selectedTrack && selectedTrack.graph.nodes.map(node => (
                <div key={node.id} className="node">
                    <h3>{node.node_type}</h3>
                </div>
            ))}
        </div>
    );
}