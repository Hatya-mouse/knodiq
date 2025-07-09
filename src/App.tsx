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
import { openWindow } from "@features/window/window";
import "./App.css";
import PlaybackControlButton from "./components/controls/PlaybackControlButton";
import { LucidePause, LucidePlay, LucideSkipBack, LucideSkipForward } from "lucide-react";
import { TrackType } from "./lib/audio_api/track_state";
import { RegionType } from "./lib/audio_api/region_state";

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [mixerState, setMixerState] = useState<MixerState | null>(null);
    const [currentBeats, setCurrentBeats] = useState<number>(0);
    const [selectedTrackId, setSelectedTrackId] = useState<number | undefined>(undefined);
    const [selectedNode, setSelectedNode] = useState<string | undefined>(undefined);
    const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        listen<MixerState>("mixer_state", (event) => {
            let state = event.payload;
            setMixerState(state);

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
    const handleAddTrack = async () => {
        openWindow({
            id: "track_config",
            url: "/window/track_config.html",
            title: "Track Configuration",
            x: 400,
            y: 200,
            width: 700,
            height: 300,
        });
    };

    const handlePlayPauseAudio = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    };

    const playAudio = () => {
        invoke("play_audio", { at: currentBeats });
        setIsPlaying(true);
    };

    const pauseAudio = () => {
        invoke("pause_audio");
        setIsPlaying(false);
    };

    const handleRemoveTrack = (index: number) => {
        invoke("remove_track", { trackId: index });

        if (selectedTrackId === index) {
            setSelectedTrackId(undefined);
        }
    };

    const handleAddRegion = async (trackId: number, name: string, startTime: number, duration: number) => {
        const track_type = mixerState?.tracks.find(track => track.id === trackId)?.track_type;

        if (track_type === TrackType.BufferTrack) {
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
                        region_type: RegionType.BufferRegion,
                        data: {
                            BufferRegion: [selected, 0],
                        },
                    },
                    trackId,
                });
            }
        } else if (track_type === TrackType.NoteTrack) {
            // For NoteTrack, we can create a new region without a file
            invoke("add_region", {
                regionData: {
                    name: name,
                    start_time: startTime,
                    duration: duration,
                    samples_per_beat: 22550,
                    region_type: RegionType.NoteRegion,
                    data: "NoteRegion",
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
            nodeType: nodeType,
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

    const handleSetShaderCode = async (trackId: number, nodeId: string, code: string) => {
        let errors = await invoke("set_audio_shader", {
            trackId: trackId,
            nodeId: nodeId,
            shader: code
        });
        console.log("Errors: ", errors);
    };

    const handleSelectNode = (_trackId: number, nodeId: string) => {
        setSelectedNode(nodeId);
    };

    const handleSelectTrack = (trackId: number) => {
        setSelectedTrackId(trackId);
        setSelectedRegionId(undefined);
        setSelectedNode(undefined);
    };

    const handleAddNote = (trackId: number, note: { pitch: number, startTime: number, duration: number }) => {
        // TODO: Implement add note functionality
        console.log("Add note:", trackId, note);
    };

    const handleRemoveNote = (trackId: number, noteId: string) => {
        // TODO: Implement remove note functionality
        console.log("Remove note:", trackId, noteId);
    };

    const handleUpdateNote = (trackId: number, noteId: string, note: { pitch: number, startTime: number, duration: number }) => {
        // TODO: Implement update note functionality
        console.log("Update note:", trackId, noteId, note);
    };

    const seek = async (beats: number) => {
        setCurrentBeats(beats);
        pauseAudio();
    };

    return <div className="App w-screen h-screen flex flex-col font-(family-name:--base-font)">
        <WindowHeader>
            <div className="flex overflow-hidden mx-2 my-1.5 bg-[var(--bg-tertiary)] rounded-[var(--border-radius)]">
                <PlaybackControlButton
                    icon={<LucideSkipBack size={16} />}
                    onClick={() => seek(0)}
                    defaultBg="bg-[var(--bg-tertiary)]"
                    hoverBg="hover:brightness-[90%]"
                    activeBg="active:brightness-[80%]"
                    className="px-2"
                />
                <PlaybackControlButton
                    icon={isPlaying ? <LucidePause size={16} /> : <LucidePlay size={16} />}
                    onClick={handlePlayPauseAudio}
                    defaultBg="bg-[var(--bg-tertiary)]"
                    hoverBg="hover:bg-[var(--accent-color)]"
                    activeBg="active:brightness-[90%]"
                    className="px-2"
                />
                <PlaybackControlButton
                    icon={<LucideSkipForward size={16} />}
                    onClick={() => seek(mixerState?.duration || 0)}
                    defaultBg="bg-[var(--bg-tertiary)]"
                    hoverBg="hover:brightness-[90%]"
                    activeBg="active:brightness-[80%]"
                    className="px-2"
                />
            </div>
        </WindowHeader>

        <PaneViewRoot editorData={{
            timelineData: {
                mixerState: mixerState || undefined,
                currentTime: currentBeats,
                selectedTrackId: selectedTrackId,
                onAddTrack: handleAddTrack,
                onRemoveTrack: handleRemoveTrack,
                onSelectTrack: handleSelectTrack,
                onAddRegion: handleAddRegion,
                onMoveRegion: handleMoveRegion,
                onSelectRegion: (_, regionId) => setSelectedRegionId(regionId),
                seek: seek,
            },

            graphEditorData: {
                mixerState: mixerState || undefined,
                selectedTrackId: selectedTrackId,
                selectedNodeId: selectedNode,
                onAddNode: handleAddNode,
                onRemoveNode: handleRemoveNode,
                onMoveNode: handleMoveNode,
                onConnectNodes: handleConnectNodes,
                onDisconnectNodes: handleDisconnectNodes,
                onSelectNode: handleSelectNode,
            },

            nodeInspectorData: {
                mixerState: mixerState || undefined,
                selectedTrackId: selectedTrackId,
                selectedNodeId: selectedNode,
                onSetShaderCode: handleSetShaderCode,
            },

            pianoRollData: {
                mixerState: mixerState || undefined,
                selectedTrackId: selectedTrackId,
                selectedRegionId: selectedRegionId,
                onAddNote: handleAddNote,
                onRemoveNote: handleRemoveNote,
                onUpdateNote: handleUpdateNote,
            },
        }} />
    </div>;
}
