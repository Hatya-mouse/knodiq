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
use api::graph;
use api::mixing::{region, track};
use api::window;
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
            graph::graph::connect_graph,
            graph::graph::disconnect_graph,
            graph::graph::add_node,
            graph::graph::remove_node,
            graph::graph::move_node,
            graph::graph::set_input_properties,
            graph::graph::get_input_nodes,
            graph::graph::get_output_node,
            graph::node::audio_shader_node::set_audio_shader,
            track::track::add_track,
            track::track::remove_track,
            track::track::set_track_color,
            region::region::add_region,
            region::region::remove_region,
            region::region::move_region,
            window::open_track_config_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
