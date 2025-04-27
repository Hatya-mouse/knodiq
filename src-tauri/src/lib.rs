mod app_state;
mod audio_api;

use app_state::AppState;
use audio_api::{pause_audio, play_audio, start_mixer_thread};

use std::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState::new()))
        .invoke_handler(tauri::generate_handler![
            play_audio,
            pause_audio,
            start_mixer_thread
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
