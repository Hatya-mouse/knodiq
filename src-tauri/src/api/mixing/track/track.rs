use crate::api::mixing::MixerCommand;
use crate::api::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Serialize, Deserialize)]
pub enum TrackType {
    BufferTrack,
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
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::AddTrack(track_data))
            .ok();
    } else {
        eprintln!("Audio player not initialized.");
    }
}
