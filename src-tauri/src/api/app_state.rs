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

use super::mixing::{MixerCommand, MixerResult};
use knodiq_engine::{AudioPlayer, AudioSource};
use std::sync::mpsc;

pub struct AppState {
    /// Mixer mspc sender to communicate with the mixer.
    pub mixer_command_sender: Option<mpsc::Sender<MixerCommand>>,
    /// Mixer mspc receiver to receive results from the mixer.
    pub mixer_result_receiver: Option<mpsc::Receiver<MixerResult>>,
    /// Audio player to handle audio playback.
    pub audio_player: Option<AudioPlayer>,
    /// Cached mixed buffers to avoid unnecessary mixing.
    pub mixer_result_cache: Option<AudioSource>,
}

impl AppState {
    pub fn new() -> Self {
        AppState {
            mixer_command_sender: None,
            mixer_result_receiver: None,
            audio_player: None,
            mixer_result_cache: None,
        }
    }

    pub fn set_audio_player(&mut self, player: AudioPlayer) {
        self.audio_player = Some(player);
    }

    pub fn get_audio_player(&mut self) -> Option<&mut AudioPlayer> {
        self.audio_player.as_mut()
    }

    pub fn clear_audio_player(&mut self) {
        self.audio_player = None;
    }

    // pub fn set_mixer_result_cache(&mut self, cache: AudioSource) {
    //     self.mixer_result_cache = Some(cache);
    // }
}
