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

use crate::api::mixing::MixingThreadCommand;
use std::{
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
        mpsc::Receiver,
    },
    thread,
};

pub fn start_mixing_thread(
    mixing_command_receiver: Receiver<MixingThreadCommand>,
) -> Result<(), std::io::Error> {
    thread::Builder::new()
        .name("mixing_thread".into())
        .spawn(move || {
            let should_stop_mixing = Arc::new(AtomicBool::new(false));

            loop {
                match mixing_command_receiver.recv() {
                    Ok(command) => {
                        // Handle the command from the mixer
                        match command {
                            MixingThreadCommand::StartMixing(mut mixer, start_beat, callback) => {
                                // Reset stop flag for new mixing
                                should_stop_mixing.store(false, Ordering::Release);

                                let should_stop_mixing_clone = Arc::clone(&should_stop_mixing);

                                let mix_callback = Box::new(move |sample, current_beat| {
                                    // Check stop flag
                                    if should_stop_mixing_clone.load(Ordering::Relaxed) {
                                        return false;
                                    }

                                    // Call original callback with correct parameters
                                    callback(sample, current_beat);
                                    true
                                });

                                match mixer.prepare() {
                                    Ok(()) => {
                                        mixer.mix(start_beat, mix_callback);
                                    }
                                    Err(e) => {
                                        eprintln!("Error preparing mixer: {}", e);
                                    }
                                }
                            }
                            MixingThreadCommand::StopMixing => {
                                should_stop_mixing.store(true, Ordering::Release);
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Error receiving mixing command: {}", e);
                        break;
                    }
                }
            }
        })
        .map(|_| ())
}
