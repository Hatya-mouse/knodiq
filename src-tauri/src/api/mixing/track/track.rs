use crate::api::mixing::{emit_mixer_state, MixerCommand};
use crate::api::AppState;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, AppHandle, State};

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
pub fn add_track(track_data: TrackData, state: State<'_, Mutex<AppState>>, app: AppHandle) {
    let locked_state = state.lock().unwrap();
    if let Some(mixer_command_sender) = locked_state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::AddTrack(track_data))
            .ok();
        emit_mixer_state(locked_state, app);
    } else {
        eprintln!("Audio player not initialized.");
    }
}
