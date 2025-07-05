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

import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import { MixerState } from "@lib/audio_api/mixer_state";
import WindowHeader from "@/features/window_header/WindowHeader";
import PaneViewRoot from "./components/pane/PaneViewRoot";
import "./App.css";

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [mixerState, setMixerState] = useState<MixerState | null>(null);
    const [currentBeats, setCurrentBeats] = useState<number>(0);
    const [selectedTrackId, setSelectedTrackId] = useState<number | undefined>(undefined);

    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        listen<MixerState>("mixer_state", (event) => {
            let state = event.payload;
            setMixerState(state);
            console.log("Received mixer state:", state);

            if (currentBeats > state.duration) {
                setCurrentBeats(state.duration);
            }
        });

        document.addEventListener('contextmenu', event => event.preventDefault());
    }, []);

    useEffect(() => {
        if (isPlaying && mixerState) {
            // Calculate interval in ms for each beat
            const msPerBeat = 60000 / mixerState.bpm;

            intervalRef.current = setInterval(() => {
                setCurrentBeats(prev => prev + 1);
            }, msPerBeat);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [isPlaying, mixerState?.bpm]);

    /// Called when the file selection button is pressed.
    const handleFileSelect = () => {
        invoke("add_track", {
            trackData: {
                name: "TRACK!!!!!",
                channels: 2,
                track_type: "BufferTrack"
            }
        });
    }

    const handlePlayAudio = () => {
        invoke("play_audio", { at: currentBeats });
        setIsPlaying(true);
    }

    const handlePauseAudio = () => {
        invoke("pause_audio");
        setIsPlaying(false);
    }

    const handleRemoveTrack = (index: number) => {
        invoke("remove_track", { trackId: index });

        if (selectedTrackId === index) {
            setSelectedTrackId(undefined);
        }
    }

    const handleAddRegion = async (trackId: number, name: string, startTime: number, duration: number) => {
        // Open a file dialog to select an audio file
        const selected = await open({
            filters: [{
                name: "audio",
                extensions: ["wav", "mp3", "ogg"],
            }]
        });

        // Get the opened file path
        if (typeof selected == "string") {
            // Get the file name from the path
            // Windows paths may contain backslashes, so we use split("/") to ensure we get the last part of the path
            var fileName = selected.split("/").pop() || "Unknown File";
            fileName = fileName.split("\\").pop() || "Unknown File";

            invoke("add_region", {
                regionData: {
                    name: name,
                    start_time: startTime,
                    duration: duration,
                    samples_per_beat: 22550,
                    region_type: {
                        BufferRegion: [selected, 0],
                    },
                },
                trackId,
            });
        }
    };

    const handleMoveRegion = (trackId: number, regionId: number, newBeats: number) => {
        invoke("move_region", {
            trackId: trackId,
            regionId: regionId,
            newBeats: newBeats
        });
    };

    const handleAddNode = (trackId: number, nodeType: string, position: [number, number]) => {
        invoke("add_node", {
            trackId: trackId,
            nodeData: {
                node_type: nodeType,
            },
            position: position
        });
    };

    const handleRemoveNode = (trackId: number, nodeId: string) => {
        invoke("remove_node", {
            trackId: trackId,
            nodeId: nodeId
        });
    };

    const handleMoveNode = (trackId: number, nodeId: string, newPosition: [number, number]) => {
        invoke("move_node", {
            trackId: trackId,
            nodeId: nodeId,
            position: newPosition
        });
    };

    const handleConnectNodes = (trackId: number, from: string, fromParam: string, to: string, toParam: string) => {
        invoke("connect_graph", {
            trackId: trackId,
            from: from,
            fromParam: fromParam,
            to: to,
            toParam: toParam
        });
    };

    const handleDisconnectNodes = (trackId: number, from: string, fromParam: string, to: string, toParam: string) => {
        invoke("disconnect_graph", {
            trackId: trackId,
            from: from,
            fromParam: fromParam,
            to: to,
            toParam: toParam
        });
    };

    const seek = async (beats: number) => {
        setCurrentBeats(beats);
        handlePauseAudio();
    };

    return <div className="App w-screen h-screen flex flex-col font-(family-name:--base-font)">
        <WindowHeader
            isPlaying={isPlaying}
            onPlay={handlePlayAudio}
            onPause={handlePauseAudio}
            onSkipBack={() => seek(0)}
            onSkipForward={() => seek(mixerState?.duration || 0)}
        />

        <PaneViewRoot editorData={{
            trackViewData: {
                mixerState: mixerState || undefined,
                currentTime: currentBeats,
                selectedTrackId: selectedTrackId,
                onAddTrack: handleFileSelect,
                onRemoveTrack: handleRemoveTrack,
                onSelectTrack: (id: number) => setSelectedTrackId(id),
                onAddRegion: handleAddRegion,
                onMoveRegion: handleMoveRegion,
                seek: seek,
            },

            nodeEditorData: {
                mixerState: mixerState || undefined,
                selectedTrackId: selectedTrackId,
                onAddNode: handleAddNode,
                onRemoveNode: handleRemoveNode,
                onMoveNode: handleMoveNode,
                onConnectNodes: handleConnectNodes,
                onDisconnectNodes: handleDisconnectNodes,
            }
        }} />
    </div>;
}
