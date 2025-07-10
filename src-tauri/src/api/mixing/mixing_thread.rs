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
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
    mpsc::Receiver,
};

pub fn start_mixing_thread(mixing_command_receiver: Receiver<MixingThreadCommand>) {
    std::thread::spawn(move || {
        let should_stop_mixing = Arc::new(AtomicBool::new(false));

        loop {
            match mixing_command_receiver.recv() {
                Ok(command) => {
                    // Handle the command from the mixer
                    match command {
                        MixingThreadCommand::StartMixing(mut mixer, start_beat, callback) => {
                            if should_stop_mixing.load(Ordering::Acquire) {
                                should_stop_mixing.store(true, Ordering::Release);
                            }

                            let should_stop_mixing_clone = Arc::clone(&should_stop_mixing);
                            let callback = Box::new(move |sample, _playhead_time| {
                                // Call the provided callback with the sample and start_beat
                                callback(sample, start_beat);

                                !should_stop_mixing_clone.load(Ordering::Relaxed)
                            });

                            mixer.mix(start_beat, callback);
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
    });
}
