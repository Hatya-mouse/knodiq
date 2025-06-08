use crate::api::mixing::{send_mixer_command, MixerCommand};
use crate::api::AppState;
use knodiq_engine::audio_utils::Beats;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Serialize, Deserialize)]
pub enum RegionType {
    /// A region that contains audio data.
    /// String is the path to the audio file, and usize is the track index.
    BufferRegion(String, usize),
}

#[derive(Serialize, Deserialize)]
pub struct RegionData {
    pub id: u32,
    pub name: String,
    pub start_time: Beats,
    pub duration: Beats,
    pub samples_per_beat: f32,
    pub region_type: RegionType,
}

#[command]
pub fn add_region(region_data: RegionData, track_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::AddRegion(track_id, region_data), state);
}

#[command]
pub fn remove_region(track_id: u32, region_id: u32, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::RemoveRegion(track_id, region_id), state);
}

#[command]
pub fn move_region(
    track_id: u32,
    region_id: u32,
    new_beats: Beats,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::MoveRegion(track_id, region_id, new_beats),
        state,
    );
}
