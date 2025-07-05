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

export type NoteState = {
    /** The unique identifier for the note. */
    id: number;
    /** The pitch of the note, represented as a MIDI note number. */
    pitch: number;
    /** The velocity of the note, typically ranging from 0 to 127. */
    velocity: number;
    /** The start time of the note in beats. */
    start_time: number;
    /** The duration of the note in beats. */
    duration: number;
}