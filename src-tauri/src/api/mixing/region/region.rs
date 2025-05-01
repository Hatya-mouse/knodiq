use crate::api::mixing::MixerCommand;
use crate::api::AppState;
use segment_engine::{audio_utils::Beats, AudioSource};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{command, State};

#[derive(Serialize, Deserialize)]
pub enum RegionType {
    BufferRegion(AudioSource),
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
    println!("add_region invoked");
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::AddRegion(track_id, region_data))
            .unwrap();
    } else {
        eprintln!("Mixer thread not initialized.");
    }
}
