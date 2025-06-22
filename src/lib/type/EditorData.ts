import { MixerState } from "@/lib/audio_api/mixer_state";

export interface EditorData {
    trackViewData?: {
        mixerState?: MixerState,
        currentTime?: number,
        selectedTrackId?: number,
        onAddTrack?: () => void,
        onRemoveTrack?: (trackId: number) => void,
        onSelectTrack?: (trackId: number) => void,
        onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
        seek?: (beats: number) => void,
    },

    nodeEditorData?: {
        mixerState?: MixerState,
        selectedTrackId?: number,
        onAddNode?: () => void,
        onRemoveNode?: (nodeId: string) => void,
        onConnectNodes?: (sourceId: string, targetId: string) => void,
        onDisconnectNodes?: (sourceId: string, targetId: string) => void,
        onMoveNode?: (trackId: number, nodeId: string, newPosition: [number, number]) => void,
    }
}