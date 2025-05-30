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
            id: *region.id(),
            name: region.name().to_string(),
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
