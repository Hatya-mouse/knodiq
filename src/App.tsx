import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";

import EditorHeader from "@/features/editor_header/EditorHeader";
import TracksArea from "@features/tracks_area/TracksArea";
import { Track } from "@lib/audio_api/track";

export default function App() {
    const [filePath, setFilePath] = useState<string | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

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

            // Add the loaded file to the tracks list
            const newTrack = new Track(0, selected as string, 1.0);
            setTracks([...tracks, newTrack]);
        }
    }

    const handlePlayAudio = async () => {
        // Check if a file is selected
        if (!filePath) {
            console.error("No file selected");
            return;
        }

        // Call the Rust function to play the audio file
        await invoke("play_audio", { path: filePath });

        setIsPlaying(true);
    }

    const handleRemoveTrack = (index: number) => {
        // Remove the track at the specified index
        setTracks(tracks.filter((_, i) => i !== index));
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
            <TracksArea tracks={tracks} onAddTrack={handleFileSelect} onRemoveTrack={handleRemoveTrack} />
        </div>
    </>;
}