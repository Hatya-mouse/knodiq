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

use knodiq_engine::{Region, mixing::region::BufferRegion};
use knodiq_note::NoteRegion;
use serde::{Deserialize, Serialize};

use crate::api::state::NoteState;

#[derive(Serialize, Deserialize)]
pub struct RegionState {
    pub id: u32,
    pub name: String,
    pub start_time: f32,
    pub duration: f32,
    pub data: RegionDataState,
}

impl RegionState {
    pub fn from_region(region: Box<&dyn Region>) -> Self {
        RegionState {
            id: *region.get_id(),
            name: region.get_name().to_string(),
            start_time: region.start_time(),
            duration: region.duration(),
            data: if region.as_any().is::<BufferRegion>() {
                RegionDataState::BufferRegion()
            } else if let Some(note_region) = region.as_any().downcast_ref::<NoteRegion>() {
                RegionDataState::NoteRegion(
                    note_region
                        .notes()
                        .iter()
                        .map(NoteState::from_note)
                        .collect(),
                )
            } else {
                panic!("Unknown region type");
            },
        }
    }
}

impl Clone for RegionState {
    fn clone(&self) -> Self {
        RegionState {
            id: self.id,
            name: self.name.clone(),
            start_time: self.start_time,
            duration: self.duration,
            data: match &self.data {
                RegionDataState::BufferRegion() => RegionDataState::BufferRegion(),
                RegionDataState::NoteRegion(notes) => {
                    RegionDataState::NoteRegion(notes.iter().cloned().collect())
                }
            },
        }
    }
}

#[derive(Serialize, Deserialize)]
pub enum RegionDataState {
    /// A region that contains audio data.
    BufferRegion(),
    /// A region that contains midi data.
    NoteRegion(Vec<NoteState>),
}
