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
import { useEffect, useState, useRef } from "react";
import InspectorGroup from "./InspectorGroup";

export default function NodeInspector({
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const node = mixerState?.tracks.find(track => track.id === selectedTrackId)?.graph.nodes.find(node => node.id === selectedNodeId);

    useEffect(() => {
        setCode(node?.data?.AudioShaderNode?.shader_code || "");
    }, [mixerState, selectedTrackId, selectedNodeId]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [code]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
        if (mixerState && selectedTrackId !== undefined && selectedNodeId) {
            onSetShaderCode(selectedTrackId, selectedNodeId, e.target.value);
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <PaneHeader
                selectedPane={PaneContentType.NodeInspector}
                onPaneSelect={onPaneSelect}
            />

            <div className="grow flex flex-col overflow-x-hidden overflow-y-auto">
                <InspectorGroup
                    title="Inputs"
                    children={!node?.is_input_node ? node?.inputs?.map((input, index) => (
                        <div key={index} className="block text-sm font-medium text-gray-700">
                            {input}
                        </div>
                    )) : null}
                />

                <InspectorGroup
                    title="Outputs"
                    children={!node?.is_output_node ? node?.outputs?.map((output, index) => (
                        <div key={index} className="block text-sm font-medium text-gray-700">
                            {output}
                        </div>
                    )) : null}
                />

                {node?.data?.AudioShaderNode !== undefined &&
                    <InspectorGroup
                        title="AudioShader"
                        children={
                            <div
                                className="my-1 px-2 py-1 flex flex-col bg-[var(--bg-primary)]"
                                style={{
                                    borderColor: "var(--border-color)",
                                    borderWidth: "1px",
                                    borderRadius: "var(--border-radius)",
                                }}
                            >
                                <textarea
                                    ref={textareaRef}
                                    className="grow font-mono resize-none w-full min-h-[100px] overflow-visible border-none outline-none focus:ring-0"
                                    onChange={handleCodeChange}
                                    value={code}
                                    rows={1}
                                />
                            </div>
                        }
                    />
                }

                <div className="bg-[var(--bg-secondary)] grow" />
            </div>
        </div>
    )
}
