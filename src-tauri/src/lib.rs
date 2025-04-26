mod api_state;
mod audio_api;

use audio_api::{get_tracks, play_audio, AppState};

use std::sync::Mutex;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Mutex::new(AppState::new()))
        .invoke_handler(tauri::generate_handler![play_audio, get_tracks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
