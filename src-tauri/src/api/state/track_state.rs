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

use crate::api::{RegionState, mixing::TrackType, state::GraphState};
use knodiq_engine::{NodeId, Track};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct TrackState {
    pub id: u32,
    pub name: String,
    pub channels: usize,
    pub track_type: TrackType,
    pub regions: Vec<RegionState>,
    pub color: String,
    pub graph: GraphState,
}

impl TrackState {
    pub fn from_track(
        track: &mut Box<dyn Track>,
        node_positions: &HashMap<NodeId, (f32, f32)>,
        color: String,
    ) -> Self {
        let id = track.get_id();
        let name = track.get_name().to_string();
        let channels = track.channels();
        let track_type = match track.track_type().as_str() {
            "BufferTrack" => TrackType::BufferTrack,
            _ => panic!("Unexpected track type"),
        };
        let regions = track
            .regions()
            .iter()
            .map(|&region| RegionState::from_region(Box::new(region)))
            .collect::<Vec<_>>();
        let graph = GraphState::from_graph(track.graph(), node_positions);

        TrackState {
            id,
            name,
            channels,
            track_type,
            regions,
            color,
            graph,
        }
    }
}

impl Clone for TrackState {
    fn clone(&self) -> Self {
        TrackState {
            id: self.id,
            name: self.name.clone(),
            channels: self.channels,
            track_type: self.track_type.clone(),
            regions: self.regions.clone(),
            color: self.color.clone(),
            graph: self.graph.clone(),
        }
    }
}
