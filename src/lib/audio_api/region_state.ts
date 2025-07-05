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

import { RegionDataState } from "./region_data_state";

export type RegionState = {
    /** The ID of the region. */
    id: number;
    /** The name of the region. */
    name: string;
    /** The start time of the region in beats. */
    start_time: number;
    /** The duration of the region in beats. */
    duration: number;
    /** The data of the region. */
    data: RegionDataState;
}
