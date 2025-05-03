import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

import EditorHeader from "@/features/editor_header/EditorHeader";
import TracksArea from "@features/tracks_area/TracksArea";
import { MixerState } from "@/lib/audio_api/mixer_state";

export default function App() {
    const [filePath, setFilePath] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mixerState, setMixerState] = useState<MixerState | null>(null);

    useEffect(() => {
        listen<MixerState>("mixer_state", (event) => {
            let state = event.payload;
            setMixerState(state);
        });
    }, []);

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
            setFilePath(selected);

            console.log("Selected file: ", selected);

            await invoke("add_track", {
                trackData: {
                    id: 0,
                    name: selected,
                    channels: 2,
                    track_type: "BufferTrack"
                }
            });

            let source = await invoke("source_from_path", { path: selected, trackNumber: 0 }) as { Some: any };
            console.log("Source: ", source);

            invoke("add_region", {
                regionData: {
                    id: 0,
                    name: "New Region",
                    start_time: 0,
                    duration: 10,
                    samples_per_beat: 22550,
                    region_type: {
                        BufferRegion: source,
                    },
                },
                trackId: 0,
            });

            let input_nodes = await invoke("get_input_nodes", { trackId: 0 }) as any[];
            let output_node = await invoke("get_output_node", { trackId: 0 }) as String;
            console.log("Output node: ", output_node);
            invoke("connect_graph", {
                trackId: 0,
                from: input_nodes[0],
                fromParam: "output",
                to: output_node,
                toParam: "input",
            });

            console.log("Track added successfully.");
        }
    }

    const handlePlayAudio = async () => {
        // Check if a file is selected
        if (!filePath) {
            console.error("No file selected");
            return;
        }

        // Call the Rust function to play the audio file
        await invoke("play_audio");

        setIsPlaying(true);
    }

    const handleRemoveTrack = (index: number) => {
        // Remove the track at the specified index
        invoke("remove_track", { trackId: index });
    }

    return <>
        <div className="App w-screen h-screen flex flex-col">
            {/*
                <h1>Audio File Selector</h1>
                <button className="text-button" onClick={handleFileSelect}>Select Audio File</button>
                {filePath && <p>Selected file: {filePath}</p>}
                <button className="text-button" onClick={handlePlayAudio}>Play</button>
            */}
            <EditorHeader isPlaying={isPlaying} onPlay={handlePlayAudio} />
            <TracksArea tracks={mixerState?.tracks || []} onAddTrack={handleFileSelect} onRemoveTrack={handleRemoveTrack} />
        </div>
    </>;
}
