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

use knodiq_engine::Beats;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum RegionType {
    /// A region that contains audio data.
    /// String is the path to the audio file, and usize is the track index.
    BufferRegion(String, usize),
    /// A region that contains midi data.
    NoteRegion(),
}

#[derive(Serialize, Deserialize)]
pub struct RegionData {
    pub name: String,
    pub start_time: Beats,
    pub duration: Beats,
    pub samples_per_beat: f32,
    pub region_type: RegionType,
}
