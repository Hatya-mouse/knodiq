use knodiq_engine::{Connector, Graph, Node};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NodeState {
    id: String,
    node_type: String,
    properties: Vec<String>,
    position: (f32, f32),
}

impl NodeState {
    pub fn from_node(node: &Box<dyn Node>) -> Self {
        NodeState {
            id: node.get_id().to_string(),
            node_type: node.get_type().to_string(),
            properties: node
                .get_input_list()
                .iter()
                .map(|name| name.clone())
                .collect(),
            position: (0.0, 0.0),
        }
    }
}

impl Clone for NodeState {
    fn clone(&self) -> Self {
        NodeState {
            id: self.id.clone(),
            node_type: self.node_type.clone(),
            properties: self.properties.clone(),
            position: self.position.clone(),
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
    pub fn from_graph(graph: &Graph) -> Self {
        let nodes = graph
            .get_nodes()
            .iter()
            .map(|node| NodeState::from_node(node))
            .collect();

        let connections = graph
            .get_connections()
            .iter()
            .map(|connection| ConnectorState::from_connector(connection))
            .collect();

        let input_node = graph.input_node.to_string();
        let output_node = graph.output_node.to_string();

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
