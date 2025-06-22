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

import { RegionState } from './region_state';
import { GraphState } from './graph_state';

export type TrackState = {
    /** The ID of the track. */
    id: number;
    /** The name of the track, specified by the user. */
    name: string;
    /** Number of channels in the track. */
    channels: number;
    /** The type of the track. This is used to determine how to process the track. */
    track_type: string;
    /** The regions in the track. */
    regions: RegionState[];
    /** The graph structure of the track. */
    graph: GraphState;
}