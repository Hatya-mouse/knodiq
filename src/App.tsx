import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

import WindowHeader from "@/features/window_header/WindowHeader";
import { MixerState } from "@lib/audio_api/mixer_state";
import PaneView from "@components/pane/PaneView";
import { PaneNode } from "@components/pane/PaneView";
import { PaneContentType } from "./components/pane/PaneData";

export default function App() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [mixerState, setMixerState] = useState<MixerState | null>(null);
    const [trackId, setTrackId] = useState<number>(0);
    const [currentBeats, setCurrentBeats] = useState<number>(0);
    const [paneNode, setPaneNode] = useState<PaneNode>({
        id: "0",
        type: 'leaf',
        contentType: PaneContentType.TrackView,
    });
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        listen<MixerState>("mixer_state", (event) => {
            let state = event.payload;
            setMixerState(state);

            console.log(`Received mixer state: ${state}`);

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
    const handleFileSelect = async () => {
        // Open a file dialog to select an audio file
        const selected = await open({
            filters: [{
                name: "audio",
                extensions: ["wav", "mp3", "ogg"],
            }]
        });

        // Get the opened file path
        if (typeof selected == "string") {
            console.log("Selected file & Track ID: ", selected, trackId);
            setTrackId(prev => prev + 1);

            // Get the file name from the path
            // Windows paths may contain backslashes, so we use split("/") to ensure we get the last part of the path
            var fileName = selected.split("/").pop() || "Unknown File";
            fileName = fileName.split("\\").pop() || "Unknown File";

            invoke("add_track", {
                trackData: {
                    id: trackId,
                    name: fileName,
                    channels: 2,
                    track_type: "BufferTrack"
                }
            });

            invoke("add_region", {
                regionData: {
                    id: 0,
                    name: fileName,
                    start_time: 0,
                    duration: 10,
                    samples_per_beat: 22550,
                    region_type: {
                        BufferRegion: [selected, 0],
                    },
                },
                trackId: trackId,
            });

        }
    }

    const handlePlayAudio = async () => {
        await invoke("play_audio", { at: currentBeats });
        setIsPlaying(true);
    }

    const handlePauseAudio = async () => {
        await invoke("pause_audio");
        setIsPlaying(false);
    }

    const handleRemoveTrack = (index: number) => {
        invoke("remove_track", { trackId: index });
    }

    const handleMoveRegion = (trackId: number, regionId: number, newBeats: number) => {
        invoke("move_region", {
            trackId: trackId,
            regionId: regionId,
            newBeats: newBeats
        });
    }

    const seek = async (beats: number) => {
        setCurrentBeats(beats);
        handlePauseAudio();
    }

    const handleSetPaneNode = (newNode: PaneNode) => {
        setPaneNode(newNode);
    }

    return <div className="App w-screen h-screen flex flex-col font-(family-name:--base-font)">
        <WindowHeader
            isPlaying={isPlaying}
            onPlay={handlePlayAudio}
            onPause={handlePauseAudio}
            onSkipBack={() => seek(0)}
            onSkipForward={() => seek(mixerState?.duration || 0)}
        />
        <PaneView
            paneNode={paneNode}
            onSetPaneNode={handleSetPaneNode}
            paneData={{
                trackViewData: {
                    mixerState: mixerState || undefined,
                    currentTime: currentBeats,
                    onAddTrack: handleFileSelect,
                    onRemoveTrack: handleRemoveTrack,
                    onMoveRegion: handleMoveRegion,
                    seek: seek,
                }
            }}
        />
    </div>;
}
