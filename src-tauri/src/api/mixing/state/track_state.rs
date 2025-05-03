use crate::api::mixing::{RegionState, TrackType};
use segment_engine::Track;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TrackState {
    pub id: u32,
    pub name: String,
    pub channels: usize,
    pub track_type: TrackType,
    pub regions: Vec<RegionState>,
}

impl TrackState {
    pub fn from_track(track: &Box<dyn Track>) -> Self {
        let id = track.id();
        let name = track.name().to_string();
        let channels = track.channels();
        let track_type = track.track_type().clone();
        let regions = track
            .regions()
            .iter()
            .map(|region| RegionState::from_region(region))
            .collect::<Vec<_>>();

        TrackState {
            id,
            name,
            channels,
            track_type,
            regions,
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
        }
    }
}
