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

use crate::api::mixing::region::RegionOperation;
use crate::api::mixing::{MixerCommand, send_mixer_command};
use crate::api::{AppState, NoteData, RegionData};
use knodiq_engine::audio_utils::Beats;
use std::sync::Mutex;
use tauri::{State, command};

#[command]
pub fn add_region(region_data: RegionData, track_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::AddRegion(track_id, region_data), &state);
}

#[command]
pub fn remove_region(track_id: u32, region_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::RemoveRegion(track_id, region_id), &state);
}

#[command]
pub fn move_region(
    track_id: u32,
    region_id: u32,
    new_beats: Beats,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::SetStartTime(new_beats);
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn set_duration(
    track_id: u32,
    region_id: u32,
    new_duration: Beats,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::SetDuration(new_duration);
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn set_region_name(
    track_id: u32,
    region_id: u32,
    new_name: String,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::SetName(new_name);
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn scale_region(
    track_id: u32,
    region_id: u32,
    scale_factor: f32,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::Scale(scale_factor);
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn add_note_to_region(
    track_id: u32,
    region_id: u32,
    note_data: NoteData,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::AddNote {
        pitch: note_data.pitch,
        velocity: note_data.velocity,
        start_beat: note_data.start_beat,
        duration: note_data.duration,
    };
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn remove_note_from_region(
    track_id: u32,
    region_id: u32,
    note_id: u32,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::RemoveNote { id: note_id };
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}

#[command]
pub fn modify_note_in_region(
    track_id: u32,
    region_id: u32,
    note_id: u32,
    note_data: NoteData,
    state: State<'_, Mutex<AppState>>,
) {
    let op = RegionOperation::ModifyNote {
        id: note_id,
        pitch: note_data.pitch,
        velocity: note_data.velocity,
        start_beat: note_data.start_beat,
        duration: note_data.duration,
    };
    send_mixer_command(MixerCommand::ApplyRegionOp(track_id, region_id, op), &state);
}
