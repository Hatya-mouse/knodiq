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

use crate::api::data::region_data::RegionDataContainer;
use crate::api::mixing::mixing_thread::start_mixing_thread;
use crate::api::mixing::{MixerCommand, MixerResult, MixingThreadCommand};
use crate::api::{AppState, MixerState, NodeType, RegionData, RegionType, TrackType};
use knodiq_audio_shader::AudioShaderNode;
use knodiq_engine::graph::built_in::EmptyNode;
use knodiq_engine::mixing::region::BufferRegion;
use knodiq_engine::mixing::track::BufferTrack;
use knodiq_engine::{AudioSource, Mixer, Node, NodeId, Track};
use knodiq_note::{NoteInputNode, NoteRegion, NoteTrack};
use std::collections::HashMap;
use std::sync::{Mutex, mpsc};
use tauri::{AppHandle, Emitter, State};

pub fn start_mixer_thread(state: State<Mutex<AppState>>, app: AppHandle) {
    // Create a channel to communicate with the mixer
    let (command_sender, command_receiver) = mpsc::channel();
    let (result_sender, result_receiver) = mpsc::channel();

    // Set the sender in the app state
    let mut state = state.lock().unwrap();
    state.mixer_command_sender = Some(command_sender);
    state.mixer_result_receiver = Some(result_receiver);

    // Create a new thread for the mixer
    let app_handle = app.clone();

    std::thread::spawn(move || {
        let tempo = 120.0;
        let sample_rate = 48000;
        let channels = 2;
        let mut mixer = Mixer::new(tempo, sample_rate, channels);

        let mut node_positions: HashMap<u32, HashMap<NodeId, (f32, f32)>> = HashMap::new();
        let mut track_colors: HashMap<u32, String> = HashMap::new();

        process_mixer(
            &mut mixer,
            &mut node_positions,
            &mut track_colors,
            &command_receiver,
            &result_sender,
            &app_handle,
        );
    });
}

fn process_mixer(
    mixer: &mut Mixer,
    node_positions: &mut HashMap<u32, HashMap<NodeId, (f32, f32)>>,
    track_colors: &mut HashMap<u32, String>,
    receiver: &mpsc::Receiver<MixerCommand>,
    result_sender: &mpsc::Sender<MixerResult>,
    app: &AppHandle,
) {
    println!("Mixer thread started.");

    // Check if the mixer needs to mix
    let mut needs_mix = false;

    let (mixing_sender, mixing_receiver) = mpsc::channel();
    start_mixing_thread(mixing_receiver);

    loop {
        match receiver.recv() {
            Ok(command) => match command {
                MixerCommand::Mix(at, callback) => {
                    let mixer_clone = mixer.clone();
                    let _ = mixing_sender.send(MixingThreadCommand::StartMixing(
                        mixer_clone,
                        at,
                        Box::new(callback),
                    ));
                }

                MixerCommand::StopMixing => {
                    let _ = mixing_sender.send(MixingThreadCommand::StopMixing);
                    needs_mix = false;
                }

                MixerCommand::AddTrack(track_data) => {
                    let mut track = match track_data.track_type {
                        TrackType::BufferTrack => Box::new(BufferTrack::new(
                            track_data.name.as_str(),
                            track_data.channels,
                        )) as Box<dyn Track>,
                        TrackType::NoteTrack => Box::new(NoteTrack::new(
                            track_data.name.as_str(),
                            track_data.channels,
                        )) as Box<dyn Track>,
                    };

                    // Connect the input and output nodes of the track
                    let input_node = track.graph().get_input_node_id();
                    let output_node = track.graph().get_output_node_id();

                    track.graph_mut().connect(
                        input_node,
                        "audio".to_string(),
                        output_node,
                        "audio".to_string(),
                    );

                    // Add the track to the mixer
                    mixer.add_track(track);

                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::RemoveTrack(track_id) => {
                    // Remove the track from the mixer
                    mixer.remove_track(track_id);
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::SetTrackColor(track_id, color) => {
                    track_colors.insert(track_id, color);
                    emit_state(mixer, node_positions, track_colors, app);
                }

                MixerCommand::AddRegion(track_id, region_data) => {
                    handle_add_region(
                        mixer,
                        node_positions,
                        track_colors,
                        track_id,
                        region_data,
                        app,
                    );
                }

                MixerCommand::RemoveRegion(track_id, region_id) => {
                    // Remove the region from the specified track
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        track.remove_region(region_id);
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::ApplyRegionOp(track_id, region_id, operation) => {
                    // Apply the operation to the specified region in the track
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        if let Some(region) = track.get_region_mut(region_id) {
                            operation.apply(region);
                        } else {
                            eprintln!(
                                "Region with ID {} not found in track {}.",
                                region_id, track_id
                            );
                        }
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::ConnectGraph(track_id, from, from_param, to, to_param) => {
                    // Connect the two nodes in the graph
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        track.graph_mut().connect(from, from_param, to, to_param);
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::DisconnectGraph(track_id, from, from_param, to, to_param) => {
                    // Disconnect the two nodes in the graph
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        track.graph_mut().disconnect(from, from_param, to, to_param);
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::AddNode(track_id, node_data, position) => {
                    // Create a new node based on the provided data
                    let node: Box<dyn Node> = match node_data {
                        NodeType::EmptyNode => Box::new(EmptyNode::new()),
                        NodeType::AudioShaderNode => Box::new(AudioShaderNode::new()),
                        NodeType::NoteInputNode => Box::new(NoteInputNode::new()),
                    };

                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        node_positions
                            .entry(track_id)
                            .or_default()
                            .insert(node.get_id(), position);

                        track.graph_mut().add_node(node);
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }

                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::RemoveNode(track_id, node_id) => {
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        track.graph_mut().remove_node(node_id);
                        node_positions.entry(track_id).or_default().remove(&node_id);
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                    needs_mix = true;
                }

                MixerCommand::MoveNode(track_id, node_id, position) => {
                    node_positions
                        .entry(track_id)
                        .or_default()
                        .insert(node_id, position);
                    emit_state(mixer, node_positions, track_colors, app);
                }

                MixerCommand::SetInputProperties(track_id, node_id, key, value) => {
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        if let Some(node) = track.graph_mut().get_node_mut(node_id) {
                            node.set_input(key.as_str(), value);
                        } else {
                            eprintln!("Node with ID {} not found in track {}.", node_id, track_id);
                        }
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                    emit_state(mixer, node_positions, track_colors, app);
                }

                MixerCommand::GetInputNode(track_id) => {
                    // Get the input nodes of the track
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        let input_node = &track.graph().get_input_node_id();
                        let _ = result_sender.send(MixerResult::InputNode(input_node.clone()));
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                }

                MixerCommand::GetOutputNode(track_id) => {
                    // Get the output node of the track
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        let output_node = track.graph().get_output_node_id();
                        let _ = result_sender.send(MixerResult::OutputNode(output_node));
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }
                }

                MixerCommand::SetAudioShader(track_id, node_id, shader) => {
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        if let Some(node) = track.graph_mut().get_node_mut(node_id) {
                            if let Some(audio_shader_node) =
                                node.as_any_mut().downcast_mut::<AudioShaderNode>()
                            {
                                let errors = match audio_shader_node.set_shader(shader) {
                                    Ok(_) => vec![],
                                    Err(e) => e,
                                };
                                let _ = result_sender.send(MixerResult::AudioShaderErrors(errors));
                            } else {
                                eprintln!(
                                    "Node with ID {} is not an AudioShaderNode in track {}.",
                                    node_id, track_id
                                );
                            }
                        } else {
                            eprintln!("Node with ID {} not found in track {}.", node_id, track_id);
                        }
                    } else {
                        eprintln!("Track with ID {} not found.", track_id);
                    }

                    emit_state(mixer, node_positions, track_colors, app);
                }

                MixerCommand::DoesNeedMix => {
                    // Check if the mixer needs to mix again
                    let _ = result_sender.send(MixerResult::NeedsMix(needs_mix));
                }
            },
            Err(_) => {
                // If the receiver is disconnected, exit the loop
                println!("Mixer command receiver disconnected.");
                break;
            }
        }
    }
}

fn emit_state(
    mixer: &mut Mixer,
    node_positions: &HashMap<u32, HashMap<NodeId, (f32, f32)>>,
    track_colors: &HashMap<u32, String>,
    app: &AppHandle,
) {
    let state = MixerState::from_mixer(mixer, node_positions, track_colors);
    app.emit("mixer_state", state).ok();
}

fn handle_add_region(
    mixer: &mut Mixer,
    node_positions: &mut HashMap<u32, HashMap<NodeId, (f32, f32)>>,
    track_colors: &mut HashMap<u32, String>,
    track_id: u32,
    region_data: RegionData,
    app: &AppHandle,
) {
    match region_data.region_type {
        RegionType::BufferRegion => {
            match region_data.data {
                RegionDataContainer::BufferRegion(path, track_index) => {
                    // let duration_secs = match AudioSource::get_duration_from_path(&path, track_index) {
                    //     Ok(duration) => duration,
                    //     Err(e) => {
                    //         eprintln!("Error getting duration from path: {}", e);
                    //         return;
                    //     }
                    // };

                    // let duration = duration_secs / (60.0 / mixer.tempo);
                    let mut region_id = 0;

                    // Add region
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        if let Some(buffer_track) = track.as_any_mut().downcast_mut::<BufferTrack>()
                        {
                            let region = BufferRegion::empty(region_data.name.clone());
                            region_id = match buffer_track.add_region(
                                Box::new(region.clone()),
                                region_data.start_time,
                                region_data.duration,
                            ) {
                                Ok(id) => id,
                                Err(e) => {
                                    eprintln!("Error adding region: {}", e);
                                    return;
                                }
                            };
                        }
                    }
                    emit_state(mixer, node_positions, track_colors, app);

                    // Set audio source
                    let source = match AudioSource::from_path(&path, track_index) {
                        Ok(source) => Some(source),
                        Err(e) => {
                            eprintln!("Error loading audio source: {}", e);
                            None
                        }
                    };
                    let tempo = mixer.tempo;
                    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                        if let Some(buffer_track) = track.as_any_mut().downcast_mut::<BufferTrack>()
                        {
                            if let Some(region) = buffer_track.get_region_mut(region_id) {
                                if let Some(region) =
                                    region.as_any_mut().downcast_mut::<BufferRegion>()
                                {
                                    region.set_audio_source(source, tempo);
                                }
                            }
                        }
                    }
                }
                _ => {
                    eprintln!("Invalid data for BufferRegion.");
                    return;
                }
            }
        }

        RegionType::NoteRegion => {
            // Create a new note region
            if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                if let Some(note_track) = track.as_any_mut().downcast_mut::<NoteTrack>() {
                    let region = NoteRegion::new(
                        region_data.name.clone(),
                        region_data.start_time,
                        region_data.duration,
                    );
                    match note_track.add_region(
                        Box::new(region.clone()),
                        region_data.start_time,
                        region_data.duration,
                    ) {
                        Ok(_) => (),
                        Err(e) => {
                            eprintln!("Error adding note region: {}", e);
                            return;
                        }
                    }
                }
            }
            emit_state(mixer, node_positions, track_colors, app);
        }
    }
    emit_state(mixer, node_positions, track_colors, app);
}
