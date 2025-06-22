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

use crate::api::TrackState;
use knodiq_engine::{audio_utils::Beats, Mixer, NodeId};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct MixerState {
    pub tracks: Vec<TrackState>,
    pub bpm: f32,
    pub samples_per_beat: f32,
    pub duration: Beats,
    pub node_positions: Vec<(u32, Vec<(NodeId, (f32, f32))>)>,
}

impl MixerState {
    pub fn from_mixer(
        mixer: &mut Mixer,
        node_positions: &HashMap<u32, HashMap<NodeId, (f32, f32)>>,
    ) -> Self {
        let tracks = mixer
            .tracks
            .iter_mut()
            .map(|track| {
                let track_node_positions =
                    node_positions.get(&track.id()).cloned().unwrap_or_default();
                TrackState::from_track(track, &track_node_positions)
            })
            .collect::<Vec<_>>();
        let bpm = mixer.tempo;
        let samples_per_beat = mixer.samples_per_beat();
        let duration = mixer.duration();

        let node_positions = node_positions
            .iter()
            .map(|(id, positions)| {
                (
                    *id,
                    positions
                        .iter()
                        .map(|(node_id, pos)| (*node_id, *pos))
                        .collect::<Vec<_>>(),
                )
            })
            .collect::<Vec<_>>();

        MixerState {
            tracks,
            bpm,
            samples_per_beat,
            duration,
            node_positions,
        }
    }
}

impl Clone for MixerState {
    fn clone(&self) -> Self {
        MixerState {
            tracks: self.tracks.clone(),
            bpm: self.bpm,
            samples_per_beat: self.samples_per_beat,
            duration: self.duration,
            node_positions: self.node_positions.clone(),
        }
    }
}
