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

mod api;

use api::AppState;
use api::graph::graph;
use api::mixing::{region, track};
use api::{playback, setup};

use std::sync::Mutex;
use tauri_plugin_log;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(Mutex::new(AppState::new()))
        .setup(setup::setup)
        .invoke_handler(tauri::generate_handler![
            playback::pause_audio,
            playback::play_audio,
            graph::connect_graph,
            graph::disconnect_graph,
            graph::add_node,
            graph::remove_node,
            graph::move_node,
            graph::set_input_properties,
            graph::get_input_nodes,
            graph::get_output_node,
            track::track::add_track,
            track::track::remove_track,
            region::region::add_region,
            region::region::remove_region,
            region::region::move_region,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
