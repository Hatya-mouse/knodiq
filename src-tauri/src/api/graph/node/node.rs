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

use crate::api::{
    mixing::{send_mixer_command, MixerCommand},
    AppState,
};
use knodiq_engine::NodeId;
use std::sync::Mutex;
use tauri::{command, State};

#[command]
pub fn move_node(
    track_id: u32,
    node_id: NodeId,
    position: (f32, f32),
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(MixerCommand::MoveNode(track_id, node_id, position), &state);
}
