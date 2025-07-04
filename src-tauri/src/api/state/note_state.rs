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

use knodiq_note::Note;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NoteState {
    pub id: u32,
    pub pitch: u8,    // MIDI pitch
    pub velocity: u8, // MIDI velocity
    pub start_time: f32,
    pub duration: f32,
}

impl NoteState {
    pub fn from_note(note: &Note) -> Self {
        NoteState {
            id: note.id,
            pitch: note.pitch,
            velocity: note.velocity,
            start_time: note.start_beat,
            duration: note.duration,
        }
    }
}

impl Clone for NoteState {
    fn clone(&self) -> Self {
        NoteState {
            id: self.id,
            pitch: self.pitch,
            velocity: self.velocity,
            start_time: self.start_time,
            duration: self.duration,
        }
    }
}
