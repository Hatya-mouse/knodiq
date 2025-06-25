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

use knodiq_engine::Region;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct RegionState {
    pub id: u32,
    pub name: String,
    pub start_time: f32,
    pub duration: f32,
}

impl RegionState {
    pub fn from_region(region: Box<&dyn Region>) -> Self {
        RegionState {
            id: *region.get_id(),
            name: region.get_name().to_string(),
            start_time: region.start_time(),
            duration: region.duration(),
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
        }
    }
}
