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

use super::mixing::{MixerResult, mixer_command::send_mixer_command_locked};
use crate::api::AppState;
use crate::api::mixing::MixerCommand;
use knodiq_engine::{AudioPlayer, audio_utils::Beats};
use std::sync::Mutex;
use tauri::{AppHandle, State, command};

#[command]
pub fn play_audio(at: Beats, state: State<'_, Mutex<AppState>>, app: AppHandle) {
    let mut locked_state = state.lock().unwrap();

    // Clear the old audio player if it exists
    locked_state.clear_audio_player();

    let sample_rate = 48000;
    let channels = 2;
    let completion_handler = || {};

    // Initialize the audio player with the given sample rate and channels
    let audio_player = AudioPlayer::new(sample_rate);
    locked_state.set_audio_player(audio_player);

    // Get the audio player mutable reference from the app state
    let audio_player_mut = locked_state.get_audio_player().unwrap();

    // Initialize the audio player and get the sender to pass samples to the audio player
    let sample_sender = match audio_player_mut.initialize_player(
        sample_rate,
        channels,
        Some(Box::new(completion_handler)),
    ) {
        Ok(sender) => sender,
        Err(e) => {
            eprintln!("Error initializing audio player: {}", e);
            return;
        }
    };

    // Start mixing the audio
    let sender = match &locked_state.mixer_command_sender {
        Some(sender) => sender,
        None => return,
    };

    // Send a command to the mixer to check if it needs to mix
    let mut needs_mix = true;
    if locked_state.mixer_result_cache.is_some() {
        send_mixer_command_locked(MixerCommand::DoesNeedMix, &locked_state);
        let mixer_receiver = match locked_state.mixer_result_receiver.as_ref() {
            Some(receiver) => receiver,
            None => {
                eprintln!("Mixer result receiver not initialized.");
                return;
            }
        };
        needs_mix = match mixer_receiver.recv().unwrap_or_else(|err| {
            eprintln!("Error receiving mix result: {}", err);
            MixerResult::NeedsMix(false)
        }) {
            MixerResult::NeedsMix(need) => need,
            _ => true,
        };
    }

    if needs_mix {
        // TODO: --- Add a cache processing here!!! ---

        // let app_handle = app.clone();

        // If mixing is needed, send the mix command to the mixer
        let mix_command = MixerCommand::Mix(
            at,
            Box::new(move |sample, _current_beats| {
                // Send the mixed sample to the audio player
                match sample_sender.send(sample) {
                    Ok(_) => true,
                    Err(_) => {
                        eprintln!("Paused.");
                        false
                    }
                }
            }),
        );

        // Send the mix command to the mixer thread
        sender.send(mix_command).unwrap_or_else(|e| {
            eprintln!("Error sending mix command to mixer: {}", e);
        });
    } else {
        // If no mixing is needed, we can directly send the samples to the audio player
        let cached_source = locked_state.mixer_result_cache.as_ref().unwrap();
        let channels_number = cached_source.channels;
        let samples_number = cached_source.samples();

        // Iterate through the cached mixed buffers and send samples to the audio player
        for sample_index in 0..samples_number {
            for channel in 0..channels_number {
                let sample = cached_source.data[channel][sample_index];
                // Send the sample to the audio player
                sample_sender.send(sample).unwrap_or_else(|e| {
                    eprintln!("Error sending sample to audio player: {}", e);
                });
            }
        }
    }
}

#[command]
pub fn pause_audio(state: State<'_, Mutex<AppState>>) {
    let mut state = state.lock().unwrap();
    if let Some(audio_player) = state.get_audio_player() {
        audio_player
            .pause()
            .unwrap_or_else(|e| eprintln!("Error pausing audio player: {}", e));
    } else {
        eprintln!("Audio player not initialized.");
    }
}
