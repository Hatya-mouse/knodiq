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

export interface EditorData {
    timelineData?: {
        mixerState?: MixerState,
        currentTime?: number,
        selectedTrackId?: number,
        onAddTrack?: () => void,
        onRemoveTrack?: (trackId: number) => void,
        onSelectTrack?: (trackId: number) => void,
        onAddRegion?: (trackId: number, name: string, startTime: number, duration: number) => void,
        onMoveRegion?: (trackId: number, regionId: number, newBeats: number) => void,
        seek?: (beats: number) => void,
    },

    graphEditorData?: {
        mixerState?: MixerState,
        selectedTrackId?: number,
        selectedNodeId?: string,
        onAddNode?: (trackId: number, nodeType: string, position: [number, number]) => void,
        onRemoveNode?: (trackId: number, nodeId: string) => void,
        onConnectNodes?: (trackId: number, from: string, fromParam: string, to: string, toParam: string) => void,
        onDisconnectNodes?: (trackId: number, from: string, fromParam: string, to: string, toParam: string) => void,
        onMoveNode?: (trackId: number, nodeId: string, newPosition: [number, number]) => void,
        onSelectNode?: (trackId: number, nodeId: string) => void,
    },

    nodeInspectorData?: {
        mixerState?: MixerState,
        selectedTrackId?: number,
        selectedNodeId?: string,
        onSetShaderCode?: (trackId: number, nodeId: string, code: string) => void,
    },
}