use crate::api::{mixing::TrackType, state::GraphState, RegionState};
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
    pub graph: GraphState,
}

impl TrackState {
    pub fn from_track(
        track: &mut Box<dyn Track>,
        node_positions: &HashMap<NodeId, (f32, f32)>,
    ) -> Self {
        let id = track.id();
        let name = track.name().to_string();
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
            graph: self.graph.clone(),
        }
    }
}
