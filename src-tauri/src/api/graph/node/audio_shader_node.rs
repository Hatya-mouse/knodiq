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

use crate::api::mixing::{MixerCommand, MixerResult, send_mixer_command};
use knodiq_engine::NodeId;
use tauri::command;

#[command]
pub fn set_audio_shader(
    track_id: u32,
    node_id: NodeId,
    shader: String,
    state: tauri::State<'_, std::sync::Mutex<crate::api::AppState>>,
) -> Vec<String> {
    send_mixer_command(
        MixerCommand::SetAudioShader(track_id, node_id, shader),
        &state,
    );

    let locked_state = state.lock().unwrap();
    let mixer_receiver = match locked_state.mixer_result_receiver.as_ref() {
        Some(receiver) => receiver,
        None => {
            eprintln!("Mixer result receiver not initialized.");
            return vec!["Mixer result receiver is not set.".to_string()];
        }
    };

    match mixer_receiver.recv() {
        Ok(result) => match result {
            MixerResult::AudioShaderErrors(errors) => errors,
            _ => vec!["Unexpected result type received.".to_string()],
        },
        Err(e) => vec![format!("Error receiving from mixer: {}", e)],
    }
}
