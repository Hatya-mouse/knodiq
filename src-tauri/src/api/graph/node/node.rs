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

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum NodeType {
    EmptyNode,
    BufferInputNode,
    BufferOutputNode,
    AudioShaderNode,
}

impl Clone for NodeType {
    fn clone(&self) -> Self {
        match self {
            NodeType::EmptyNode => NodeType::EmptyNode,
            NodeType::BufferInputNode => NodeType::BufferInputNode,
            NodeType::BufferOutputNode => NodeType::BufferOutputNode,
            NodeType::AudioShaderNode => NodeType::AudioShaderNode,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct NodeData {
    pub node_type: NodeType,
}
