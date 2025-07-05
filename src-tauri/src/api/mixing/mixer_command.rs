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

use crate::api::AppState;
use crate::api::graph::node::node_type::NodeData;
use crate::api::mixing::region::RegionOperation;
use crate::api::mixing::{RegionData, TrackData};
use knodiq_engine::audio_utils::Beats;
use knodiq_engine::{NodeId, Sample, Value};
use std::sync::{Mutex, MutexGuard};
use tauri::State;

pub enum MixerCommand {
    /// Command to set the sample callback function for the mixer.
    /// - callback: `Box<dyn Fn(Sample, Beats) -> bool + Send>`
    Mix(Beats, Box<dyn Fn(Sample, Beats) -> bool + Send>),

    /// Add a track to the mixer.
    /// - track_data: `TrackData`
    AddTrack(TrackData),

    /// Remove a track from the mixer.
    /// - track_id: `u32`
    RemoveTrack(u32),

    /// Set a track color.
    /// - track_id: `u32`
    /// - color: `String`
    SetTrackColor(u32, String),

    /// Add a region to the specified track.
    /// - track_id: `u32`
    /// - region_data: `RegionData`
    AddRegion(u32, RegionData),

    /// Remove a region from the specified track.
    /// - track_id: `u32`
    /// - region_id: `u32`
    RemoveRegion(u32, u32),

    /// Apply the operations to the specified region in the track.
    /// - track_id: `u32`
    /// - region_id: `u32`
    /// - operation: `RegionOperation`
    ApplyRegionOp(u32, u32, RegionOperation),

    /// Connect two nodes in the graph.
    /// - track_id: `u32`
    /// - from: `knodiq_engine::NodeId`
    /// - from_param: `String`
    /// - to: `knodiq_engine::NodeId`
    /// - to_param: `String`
    ConnectGraph(
        u32,
        knodiq_engine::NodeId,
        String,
        knodiq_engine::NodeId,
        String,
    ),

    /// Disconnect two nodes in the graph.
    /// - track_id: `u32`
    /// - from: `knodiq_engine::NodeId`
    /// - from_param: `String`
    /// - to: `knodiq_engine::NodeId`
    /// - to_param: `String`
    DisconnectGraph(
        u32,
        knodiq_engine::NodeId,
        String,
        knodiq_engine::NodeId,
        String,
    ),

    /// Add a node to a track.
    /// - track_id: `u32`
    /// - node_data: `NodeData`
    /// - position: `(f32, f32)` (x, y)
    AddNode(u32, NodeData, (f32, f32)),

    /// Remove a node from a track.
    /// - track_id: `u32`
    /// - node_id: `NodeId`
    RemoveNode(u32, NodeId),

    /// Update the position of a node in the graph.
    /// - track_id: `u32`
    /// - node_id: `NodeId`
    /// - position: `(f32, f32)` (x, y)
    MoveNode(u32, NodeId, (f32, f32)),

    /// Set the input properties of a node.
    /// - track_id: `u32`
    /// - node_id: `NodeId`
    /// - key: `String`
    /// - value: `Value`
    SetInputProperties(u32, NodeId, String, Value),

    /// Get the input node of a track.
    GetInputNode(u32),

    /// Get the output node of a track.
    GetOutputNode(u32),

    /// Set the shader of an audio shader node.
    /// - track_id: `u32`
    /// - node_id: `NodeId`
    /// - shader: `String`
    SetAudioShader(u32, NodeId, String),

    /// Check if the mixer needs to mix.
    DoesNeedMix,
}

pub enum MixerResult {
    /// Result of the `GetInputNodes` command.
    InputNode(NodeId),
    /// Result of the `GetOutputNode` command.
    OutputNode(NodeId),
    /// Result of the `DoesNeedMix` command.
    NeedsMix(bool),
    /// Result of the `SetAudioShader` command.
    AudioShaderErrors(Vec<String>),
}

pub fn send_mixer_command(command: MixerCommand, state: &State<'_, Mutex<AppState>>) {
    match state.lock().map_err(|e| e.to_string()) {
        Ok(locked_state) => {
            send_mixer_command_locked(command, &locked_state);
        }
        Err(err) => {
            eprintln!("Failed to lock state: {}", err);
        }
    }
}

pub fn send_mixer_command_locked(command: MixerCommand, locked_state: &MutexGuard<AppState>) {
    if let Some(mixer_command_sender) = locked_state.mixer_command_sender.as_ref() {
        if let Some(err) = mixer_command_sender.send(command).err() {
            eprintln!("Failed to send mixer command: {}", err);
        }
    } else {
        eprintln!("Mixer command sender not initialized.");
    }
}
