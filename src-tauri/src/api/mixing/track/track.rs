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

use crate::api::mixing::{MixerCommand, send_mixer_command};
use crate::api::{AppState, TrackData};
use std::sync::Mutex;
use tauri::{State, command};

#[command]
pub fn add_track(track_data: TrackData, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::AddTrack(track_data), &state);
}

#[command]
pub fn remove_track(track_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::RemoveTrack(track_id), &state);
}

#[command]
pub fn set_track_color(track_id: u32, color: String, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::SetTrackColor(track_id, color), &state);
}
