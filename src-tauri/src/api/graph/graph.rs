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
    AppState,
    graph::NodeType,
    mixing::{MixerCommand, MixerResult, send_mixer_command},
};
use knodiq_engine::{NodeId, Value};
use std::sync::Mutex;
use tauri::{State, command};

#[command]
pub fn connect_graph(
    track_id: u32,
    from: NodeId,
    from_param: String,
    to: NodeId,
    to_param: String,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::ConnectGraph(track_id, from, from_param, to, to_param),
        &state,
    );
}

#[command]
pub fn disconnect_graph(
    track_id: u32,
    from: NodeId,
    from_param: String,
    to: NodeId,
    to_param: String,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::DisconnectGraph(track_id, from, from_param, to, to_param),
        &state,
    );
}

#[command]
pub fn add_node(
    track_id: u32,
    node_data: NodeType,
    position: (f32, f32),
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(MixerCommand::AddNode(track_id, node_data, position), &state);
}

#[command]
pub fn remove_node(track_id: u32, node_id: NodeId, state: State<'_, Mutex<AppState>>) {
    send_mixer_command(MixerCommand::RemoveNode(track_id, node_id), &state);
}

#[command]
pub fn move_node(
    track_id: u32,
    node_id: NodeId,
    position: (f32, f32),
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(MixerCommand::MoveNode(track_id, node_id, position), &state);
}

#[command]
pub fn set_input_properties(
    track_id: u32,
    node_id: NodeId,
    key: String,
    value: Value,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::SetInputProperties(track_id, node_id, key, value),
        &state,
    );
}

#[command]
pub fn get_input_nodes(track_id: u32, state: State<'_, Mutex<AppState>>) -> Option<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetInputNode(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::InputNode(input_node) = mixer_result_receiver.recv().unwrap() {
            return Some(input_node);
        }
    }
    None
}

#[command]
pub fn get_output_node(track_id: u32, state: State<'_, Mutex<AppState>>) -> Option<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetOutputNode(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::OutputNode(output_node) = mixer_result_receiver.recv().unwrap() {
            Some(output_node)
        } else {
            None
        }
    } else {
        None
    }
}
