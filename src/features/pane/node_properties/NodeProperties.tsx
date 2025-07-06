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

import PaneHeader from "@/components/pane/PaneHeader";
import { MixerState } from "@/lib/audio_api/mixer_state";
import { PaneContentType } from "@/lib/type/PaneNode";
import { useEffect, useState } from "react";

export default function NodeProperties({
    onPaneSelect = () => { },
    mixerState,
    selectedTrackId,
    selectedNodeId,
    onSetShaderCode = () => { },
}: {
    onPaneSelect?: (pane: PaneContentType) => void,
    mixerState?: MixerState,
    selectedTrackId?: number,
    selectedNodeId?: string,
    onSetShaderCode?: (trackId: number, nodeId: string, code: string) => void,
}) {
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        if (mixerState && selectedTrackId !== undefined && selectedNodeId) {
            const track = mixerState.tracks.find(track => track.id === selectedTrackId);
            if (track !== undefined) {
                const node = track.graph.nodes.find(node => node.id === selectedNodeId);
                setCode(node?.data?.AudioShaderNode?.shader_code || "");
            }
        }
    }, [mixerState, selectedTrackId, selectedNodeId]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (mixerState && selectedTrackId !== undefined && selectedNodeId) {
            onSetShaderCode(selectedTrackId, selectedNodeId, e.target.value);
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <PaneHeader
                selectedPane={PaneContentType.NodeProperties}
                onPaneSelect={onPaneSelect}
            />

            {mixerState?.tracks.find(track => track.id === selectedTrackId)?.graph.nodes.find(node => node.id === selectedNodeId)?.data?.AudioShaderNode !== undefined &&
                <div className="h-full w-full">
                    <textarea onChange={handleCodeChange} value={code} />
                </div>
            }
        </div>
    )
}
