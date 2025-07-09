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

import SectionGroup from "@/components/elements/SectionGroup";
import { useState } from "react";
import TrackTypeButton from "./TrackTypeButton";
import { TrackType } from "@/lib/audio_api/track_state";
import { invoke } from "@tauri-apps/api/core";
import BasicButton, { ButtonType } from "@/components/controls/BasicButton";
import "@/App.css";
import HSplitView from "@/components/split_view/HSplitView";
import { getCurrentWindow } from "@tauri-apps/api/window";
import TextField from "@/components/controls/TextField";
import WindowHeader from "@/features/window_header/WindowHeader";

export default function TrackCreationWindow() {
    const [trackType, setTrackType] = useState<TrackType>(TrackType.BufferTrack);
    const [trackName, setTrackName] = useState<string>("");
    const [trackChannels, setTrackChannels] = useState<number>(2);

    const [textFieldValue, setTextFieldValue] = useState<string>("2");

    const [leftWidth, setLeftWidth] = useState<number>(200);

    const handleTrackTypeSelection = (trackType: TrackType) => {
        setTrackType(trackType);
    };

    const handleSetTrackChannels = (value: string) => {
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue) || parsedValue <= 0) {
            setTrackChannels(2);
            setTextFieldValue("2");
        } else {
            setTrackChannels(parsedValue);
            setTextFieldValue(parsedValue.toString());
        }
    };

    const handleCreateTrackButtonClick = () => {
        invoke("add_track", {
            trackData: {
                name: trackName,
                channels: trackChannels,
                track_type: trackType,
            },
        });
        closeWindow();
    };

    const closeWindow = () => {
        const appWindow = getCurrentWindow();
        appWindow.close();
    };

    const canCreateTrack = trackName.trim() !== "" && trackChannels > 0 && !isNaN(trackChannels);

    return (
        <div className="w-screen h-screen flex flex-col font-(family-name:--base-font)">
            <WindowHeader className="items-center pl-3 font-medium text-sm select-none">
                Add Track
            </WindowHeader>

            <HSplitView
                className="w-dvw h-dvh flex flex-row justify-strech"
                leftWidth={leftWidth}
                left={
                    <div className="h-full flex flex-col justify-strech bg-[var(--bg-primary)]">
                        {(Object.values(TrackType) as TrackType[]).map((type) => (
                            <TrackTypeButton
                                key={type}
                                trackType={type}
                                description={""}
                                isSelected={trackType === type}
                                onClick={handleTrackTypeSelection}
                            />
                        ))}
                    </div>
                }
                right={
                    <div className="relative h-full flex flex-col justify-stretch overflow-x-hidden overflow-y-auto">
                        <SectionGroup
                            title="Track Name"
                        >
                            <TextField
                                className="w-full"
                                value={trackName}
                                onChange={setTrackName}
                                placeholder="Track Name"
                            />
                        </SectionGroup>

                        <SectionGroup
                            title="# of Channels"
                        >
                            <TextField
                                className="w-full"
                                value={textFieldValue}
                                onChange={(value) => setTextFieldValue(value)}
                                onBlur={(value) => handleSetTrackChannels(value)}
                                placeholder="Channels"
                            />
                        </SectionGroup>

                        <div className="w-full h-full bg-[var(--bg-secondary)]" />

                        <div
                            className="sticky left-0 right-0 bottom-0 px-2 py-1 flex gap-1 justify-end bg-[var(--bg-secondary)]"
                            style={{
                                borderTopColor: "var(--border-color)",
                                borderTopWidth: "1px",
                                borderTopStyle: "solid",
                            }}
                        >
                            <BasicButton type={ButtonType.Default} onClick={closeWindow}>
                                Cancel
                            </BasicButton>
                            <BasicButton
                                type={ButtonType.Primary}
                                onClick={handleCreateTrackButtonClick}
                                disabled={!canCreateTrack}
                            >
                                Create Track
                            </BasicButton>
                        </div>
                    </div>
                }
                onDragMove={(newWidth) => setLeftWidth(newWidth)}
            />
        </div>
    );
}
