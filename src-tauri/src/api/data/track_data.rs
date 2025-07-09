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

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum TrackType {
    BufferTrack = 0,
    NoteTrack = 1,
}

impl Clone for TrackType {
    fn clone(&self) -> Self {
        match self {
            TrackType::BufferTrack => TrackType::BufferTrack,
            TrackType::NoteTrack => TrackType::NoteTrack,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct TrackData {
    pub name: String,
    pub channels: usize,
    pub track_type: TrackType,
}
