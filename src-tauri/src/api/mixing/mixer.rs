use crate::api::mixing::{MixerCommand, MixerResult, MixerState, RegionData, RegionType};
use crate::api::AppState;
use crate::track::TrackType;
use knodiq_audio_shader::AudioShaderNode;
use knodiq_engine::mixing::region::BufferRegion;
use knodiq_engine::mixing::track::BufferTrack;
use knodiq_engine::{AudioSource, Mixer, Track};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    mpsc, Arc, Mutex,
};
use std::thread;
use tauri::{AppHandle, Emitter, State};

pub fn start_mixer_thread(state: State<Mutex<AppState>>, app: AppHandle) {
    // Create a channel to communicate with the mixer
    let (command_sender, command_receiver) = mpsc::channel();
    let (result_sender, result_receiver) = mpsc::channel();
    let running = Arc::new(AtomicBool::new(true));

    // Set the sender in the app state
    let mut state = state.lock().unwrap();
    state.mixer_command_sender = Some(command_sender);
    state.mixer_result_receiver = Some(result_receiver);

    // Create a new thread for the mixer
    let running_clone = Arc::clone(&running);
    let app_handle = app.clone();

    std::thread::spawn(move || {
        let tempo = 120.0;
        let sample_rate = 48000;
        let channels = 2;
        let mut mixer = Mixer::new(tempo, sample_rate, channels);

        while running_clone.load(Ordering::SeqCst) {
            process_mixer(&mut mixer, &command_receiver, &result_sender, &app_handle);
        }
    });

    // Quitting the app will stop the mixer thread
    std::thread::spawn(move || {
        running.store(false, Ordering::SeqCst);
    });
}

fn process_mixer(
    mixer: &mut Mixer,
    receiver: &mpsc::Receiver<MixerCommand>,
    result_sender: &mpsc::Sender<MixerResult>,
    app: &AppHandle,
) {
    println!("Mixer thread started.");

    // Check if the mixer needs to mix
    // Mixing is needed if any changes have been made to the mixer)
    let mut needs_mix = false;

    while let Ok(command) = receiver.recv() {
        match command {
            MixerCommand::Mix(at, callback) => {
                let mut mixer_clone = mixer.clone();
                thread::spawn(move || {
                    mixer_clone.prepare();
                    println!("Mixing starting at: {}", at);
                    mixer_clone.mix(at, callback);
                });
            }

            MixerCommand::AddTrack(track_data) => {
                let mut track = match track_data.track_type {
                    TrackType::BufferTrack => BufferTrack::new(
                        track_data.id,
                        track_data.name.as_str(),
                        track_data.channels,
                    ),
                };

                // Connect the input and output nodes of the track
                let input_node = track.graph.input_nodes[0];
                let output_node = track.graph.output_node;

                let mut shader_node = AudioShaderNode::new();
                match shader_node.set_shader(
                    "input buffer in_buffer
                    output buffer out_buffer
                    out_buffer = sin(time() * 440.0 * pi() + time() * 10.0)
                "
                    .to_string(),
                ) {
                    Ok(_) => (),
                    Err(e) => {
                        eprintln!("Error setting shader: {}", e.join(", "));
                        continue; // Skip adding this track if shader fails
                    }
                };
                let shader_node_id = track.graph.add_node(Box::new(shader_node));

                track.graph.connect(
                    input_node,
                    "output".to_string(),
                    shader_node_id,
                    "in_buffer".to_string(),
                );

                track.graph.connect(
                    shader_node_id,
                    "out_buffer".to_string(),
                    output_node,
                    "input".to_string(),
                );

                // Add the track to the mixer
                mixer.add_track(Box::new(track));

                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::AddRegion(track_id, region_data) => {
                handle_add_region(mixer, track_id, region_data, app);
            }

            MixerCommand::RemoveTrack(track_id) => {
                // Remove the track from the mixer
                mixer.remove_track(track_id);
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::RemoveRegion(track_id, region_id) => {
                // Remove the region from the specified track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    track.remove_region(region_id);
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::MoveRegion(track_id, region_id, new_beats) => {
                // Move the region to the new beats position
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    if let Some(region) = track.get_region_mut(region_id) {
                        region.set_start_time(new_beats);
                    } else {
                        eprintln!(
                            "Region with ID {} not found in track {}.",
                            region_id, track_id
                        );
                    }
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::ConnectGraph(track_id, from, from_param, to, to_param) => {
                // Connect the two nodes in the graph
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    track.graph().connect(from, from_param, to, to_param);
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::DisconnectGraph(track_id, from, from_param, to, to_param) => {
                // Disconnect the two nodes in the graph
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    track.graph().disconnect(from, from_param, to, to_param);
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::GetInputNodes(track_id) => {
                // Get the input nodes of the track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    let input_nodes = &track.graph().input_nodes;
                    let _ = result_sender.send(MixerResult::InputNodes(input_nodes.clone()));
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
            }

            MixerCommand::GetOutputNode(track_id) => {
                // Get the output node of the track
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    let output_node = track.graph().output_node;
                    let _ = result_sender.send(MixerResult::OutputNode(output_node));
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                }
            }

            MixerCommand::AddNode(track_id, node) => {
                // Add a node to the track's graph
                if let Some(track) = mixer.get_track_by_id_mut(track_id) {
                    let _ = result_sender.send(MixerResult::NodeId(track.graph().add_node(node)));
                } else {
                    eprintln!("Track with ID {} not found.", track_id);
                    let _ = result_sender.send(MixerResult::Error("Track not found".to_string()));
                }
                emit_state(mixer, app);
                needs_mix = true;
            }

            MixerCommand::DoesNeedMix => {
                // Check if the mixer needs to mix again
                let _ = result_sender.send(MixerResult::NeedsMix(needs_mix));
            }
        }
    }
}

fn emit_state(mixer: &Mixer, app: &AppHandle) {
    let state = MixerState::from_mixer(mixer);
    app.emit("mixer_state", state).ok();
}

fn handle_add_region(mixer: &mut Mixer, track_id: u32, region_data: RegionData, app: &AppHandle) {
    let RegionType::BufferRegion(path, track_index) = &region_data.region_type;
    let duration_secs = match AudioSource::get_duration_from_path(path, *track_index) {
        Ok(duration) => duration,
        Err(e) => {
            eprintln!("Error getting duration from path: {}", e);
            return;
        }
    };

    let duration = duration_secs / (60.0 / mixer.tempo);

    // Add region
    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
        if let Some(buffer_track) = track.as_any_mut().downcast_mut::<BufferTrack>() {
            let region = BufferRegion::empty(
                region_data.id,
                region_data.name.clone(),
                region_data.samples_per_beat,
                duration,
            );
            buffer_track.add_region(region.clone(), region_data.start_time, region_data.duration);
            println!("Region added: {:?}", region_data.name);
        }
    }
    emit_state(mixer, app);

    // Set audio source
    let source = match AudioSource::from_path(path, *track_index) {
        Ok(source) => Some(source),
        Err(e) => {
            eprintln!("Error loading audio source: {}", e);
            None
        }
    };
    if let Some(track) = mixer.get_track_by_id_mut(track_id) {
        if let Some(buffer_track) = track.as_any_mut().downcast_mut::<BufferTrack>() {
            if let Some(region) = buffer_track.get_region_mut(region_data.id) {
                if let Some(region) = region.as_any_mut().downcast_mut::<BufferRegion>() {
                    region.set_audio_source(source);
                }
            }
        }
    }
    println!("Audio source set for region: {:?}", region_data.name);
    emit_state(mixer, app);
}
