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

use knodiq_engine::{Beats, Region};
use knodiq_note::{Note, NoteRegion};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum RegionOperation {
    /// Set the start time of the region.
    SetStartTime(Beats),
    /// Set the duration of the region.
    SetDuration(Beats),
    /// Set the name of the region.
    SetName(String),
    /// Set the samples per beat of the region.
    SetSamplesPerBeat(f32),

    /// Add a note to a `NoteRegion`.
    AddNote {
        pitch: u8,
        velocity: u8,
        start_beat: Beats,
        duration: Beats,
    },
    /// Modify a note in a `NoteRegion`.
    ModifyNote {
        id: usize,
        pitch: u8,
        velocity: u8,
        start_beat: Beats,
        duration: Beats,
    },
}

impl RegionOperation {
    pub fn apply(&self, region: &mut Box<dyn Region>) {
        match self {
            RegionOperation::SetStartTime(beats) => region.set_start_time(*beats),
            RegionOperation::SetDuration(beats) => region.set_duration(*beats),
            RegionOperation::SetName(name) => region.set_name(name.clone()),
            RegionOperation::SetSamplesPerBeat(samples_per_beat) => {
                region.set_samples_per_beat(*samples_per_beat)
            }

            RegionOperation::AddNote {
                pitch,
                velocity,
                start_beat,
                duration,
            } => {
                if let Some(note_region) = region.as_any_mut().downcast_mut::<NoteRegion>() {
                    note_region.add_note(*pitch, *velocity, *start_beat, *duration);
                } else {
                    eprintln!("Cannot add note to a non-note region");
                }
            }
            RegionOperation::ModifyNote {
                id,
                pitch,
                velocity,
                start_beat,
                duration,
            } => {
                if let Some(note_region) = region.as_any_mut().downcast_mut::<NoteRegion>() {
                    if let Some(note) = note_region.get_note_mut(*id) {
                        note.pitch = *pitch;
                        note.velocity = *velocity;
                        note.start_beat = *start_beat;
                        note.duration = *duration;
                    } else {
                        eprintln!("Note with id {} not found", id);
                    }
                } else {
                    eprintln!("Cannot modify note in a non-note region");
                }
            }
        }
    }
}

impl Clone for RegionOperation {
    fn clone(&self) -> Self {
        match self {
            RegionOperation::SetStartTime(beats) => RegionOperation::SetStartTime(*beats),
            RegionOperation::SetDuration(beats) => RegionOperation::SetDuration(*beats),
            RegionOperation::SetName(name) => RegionOperation::SetName(name.clone()),
            RegionOperation::SetSamplesPerBeat(samples_per_beat) => {
                RegionOperation::SetSamplesPerBeat(*samples_per_beat)
            }
            RegionOperation::AddNote(pitch, velocity, start_beat, duration) => {
                RegionOperation::AddNote(*pitch, *velocity, *start_beat, *duration)
            }
        }
    }
}
