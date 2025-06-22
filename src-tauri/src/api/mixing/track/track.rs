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

use crate::api::mixing::{send_mixer_command, MixerCommand};
use crate::api::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Serialize, Deserialize)]
pub enum TrackType {
    BufferTrack,
}

impl Clone for TrackType {
    fn clone(&self) -> Self {
        match self {
            TrackType::BufferTrack => TrackType::BufferTrack,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct TrackData {
    pub id: u32,
    pub name: String,
    pub channels: usize,
    pub track_type: TrackType,
}

#[command]
pub fn add_track(track_data: TrackData, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::AddTrack(track_data), &state);
}

#[command]
pub fn remove_track(track_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::RemoveTrack(track_id), &state);
}
