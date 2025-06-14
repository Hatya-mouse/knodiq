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
