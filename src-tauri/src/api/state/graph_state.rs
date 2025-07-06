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

use knodiq_audio_shader::AudioShaderNode;
use knodiq_engine::{Connector, Graph, Node, NodeId};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::api::state::NodeData;

#[derive(Serialize, Deserialize)]
pub struct NodeState {
    id: String,
    name: String,
    node_type: String,
    inputs: Vec<String>,
    outputs: Vec<String>,
    is_input_node: bool,
    is_output_node: bool,
    position: (f32, f32),
    data: NodeData,
}

impl NodeState {
    pub fn from_node(node: &Box<dyn Node>, position: (f32, f32)) -> Self {
        let data = match node.get_type().as_str() {
            "AudioShaderNode" => {
                let shader_node = node.as_any().downcast_ref::<AudioShaderNode>().unwrap();
                NodeData::AudioShaderNode {
                    shader_code: shader_node.get_shader().to_string(),
                }
            }
            "EmptyNode" => NodeData::EmptyNode,
            "NoteInputNode" => NodeData::NoteInputNode,
            _ => NodeData::Invalid,
        };

        NodeState {
            id: node.get_id().to_string(),
            name: node.get_name().to_string(),
            node_type: node.get_type().to_string(),
            inputs: node
                .get_input_list()
                .iter()
                .map(|name| name.clone())
                .collect(),
            outputs: node
                .get_output_list()
                .iter()
                .map(|name| name.clone())
                .collect(),
            is_input_node: node.is_input(),
            is_output_node: node.is_output(),
            position,
            data,
        }
    }
}

impl Clone for NodeState {
    fn clone(&self) -> Self {
        NodeState {
            id: self.id.clone(),
            name: self.name.clone(),
            node_type: self.node_type.clone(),
            inputs: self.inputs.clone(),
            outputs: self.outputs.clone(),
            is_input_node: self.is_input_node,
            is_output_node: self.is_output_node,
            position: self.position.clone(),
            data: self.data.clone(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct ConnectorState {
    from: String,
    from_param: String,
    to: String,
    to_param: String,
}

impl ConnectorState {
    pub fn from_connector(connector: &Connector) -> Self {
        ConnectorState {
            from: connector.from.to_string(),
            from_param: connector.from_param.clone(),
            to: connector.to.to_string(),
            to_param: connector.to_param.clone(),
        }
    }
}

impl Clone for ConnectorState {
    fn clone(&self) -> Self {
        ConnectorState {
            from: self.from.clone(),
            from_param: self.from_param.clone(),
            to: self.to.clone(),
            to_param: self.to_param.clone(),
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct GraphState {
    nodes: Vec<NodeState>,
    connections: Vec<ConnectorState>,
    input_node: String,
    output_node: String,
}

impl GraphState {
    pub fn from_graph(graph: &Graph, node_positions: &HashMap<NodeId, (f32, f32)>) -> Self {
        let nodes = graph
            .get_nodes()
            .iter()
            .map(|node| {
                let position = node_positions
                    .get(&node.get_id())
                    .cloned()
                    .unwrap_or((0.0, 0.0));
                NodeState::from_node(node, position)
            })
            .collect();

        let connections = graph
            .get_connections()
            .iter()
            .map(|connection| ConnectorState::from_connector(connection))
            .collect();

        let input_node = graph.get_input_node_id().to_string();
        let output_node = graph.get_output_node_id().to_string();

        GraphState {
            nodes,
            connections,
            input_node,
            output_node,
        }
    }
}

impl Clone for GraphState {
    fn clone(&self) -> Self {
        GraphState {
            nodes: self.nodes.iter().cloned().collect(),
            connections: self.connections.iter().cloned().collect(),
            input_node: self.input_node.clone(),
            output_node: self.output_node.clone(),
        }
    }
}
