import { MixerState } from "@/lib/audio_api/mixer_state";

export enum PaneContentType {
    TrackView = "Track View",
    NodeEditor = "Node Editor",
}

export interface PaneData {
    trackViewData?: {
        mixerState?: MixerState,
        currentTime?: number,
        onAddTrack?: () => void,
        onRemoveTrack?: (index: number) => void,
        onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
        seek?: (beats: number) => void,
    },
}