use crate::api::{
    graph::NodeType,
    mixing::{send_mixer_command, MixerCommand, MixerResult},
    AppState,
};
use knodiq_audio_shader::AudioShaderNode;
use knodiq_engine::{graph::built_in::EmptyNode, NodeId};
use std::sync::Mutex;
use tauri::{command, State};

#[command]
pub fn connect_graph(
    track_id: u32,
    from: NodeId,
    from_param: String,
    to: NodeId,
    to_param: String,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::ConnectGraph(track_id, from, from_param, to, to_param),
        &state,
    );
}

#[command]
pub fn get_input_nodes(track_id: u32, state: State<'_, Mutex<AppState>>) -> Option<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetInputNode(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::InputNode(input_node) = mixer_result_receiver.recv().unwrap() {
            return Some(input_node);
        }
    }
    None
}

#[command]
pub fn get_output_node(track_id: u32, state: State<'_, Mutex<AppState>>) -> Option<NodeId> {
    let state = state.lock().unwrap();
    if let Some(mixer_command_sender) = state.mixer_command_sender.as_ref() {
        mixer_command_sender
            .send(MixerCommand::GetOutputNode(track_id))
            .unwrap();
        let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
        if let MixerResult::OutputNode(output_node) = mixer_result_receiver.recv().unwrap() {
            Some(output_node)
        } else {
            None
        }
    } else {
        None
    }
}

#[command]
pub fn disconnect_graph(
    track_id: u32,
    from: NodeId,
    from_param: String,
    to: NodeId,
    to_param: String,
    state: State<'_, Mutex<AppState>>,
) {
    send_mixer_command(
        MixerCommand::DisconnectGraph(track_id, from, from_param, to, to_param),
        &state,
    );
}

#[command]
pub fn add_node(
    track_id: u32,
    node_type: NodeType,
    position: (f32, f32),
    state: State<'_, Mutex<AppState>>,
) -> Option<NodeId> {
    let node = match node_type {
        NodeType::EmptyNode => Box::new(EmptyNode::new()) as Box<dyn knodiq_engine::Node + Send>,
        NodeType::AudioSourceNode => Box::new(AudioShaderNode::new()),
    };
    send_mixer_command(MixerCommand::AddNode(track_id, node, position), &state);

    let state = state.lock().unwrap();

    let mixer_result_receiver = state.mixer_result_receiver.as_ref().unwrap();
    match mixer_result_receiver.recv() {
        Ok(MixerResult::NodeId(node_id)) => Some(node_id),
        _ => None,
    }
}
