mod api;

use api::graph::graph;
use api::mixing::{region, track};
use api::AppState;
use api::{playback, setup};

use std::sync::Mutex;
use tauri_plugin_log;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(Mutex::new(AppState::new()))
        .setup(setup::setup)
        .invoke_handler(tauri::generate_handler![
            playback::pause_audio,
            playback::play_audio,
            graph::connect_graph,
            graph::get_input_nodes,
            graph::get_output_node,
            region::region::add_region,
            track::track::add_track,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
