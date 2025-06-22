export type NodeState = {
    /** The ID of the node. */
    id: string;
    /** The type of the node, e.g., "oscillator", "filter", etc. */
    node_type: string;
    /** The inputs of the node, which can vary based on the node type. */
    inputs: Array<string>;
    /** The outputs of the node, which can vary based on the node type. */
    outputs: Array<string>;
    /** The position of the node in the editor, for UI purposes. */
    position: [number, number];
}

export type ConnectorState = {
    /** The source node ID of the connector. */
    from: string;
    /** The source property name of the connector. */
    from_param: string;
    /** The target node ID of the connector. */
    to: string;
    /** The target property name of the connector. */
    to_param: string;
}

export type GraphState = {
    /** The nodes in the graph. */
    nodes: Array<NodeState>;
    /** The connections in the graph. */
    connections: Array<ConnectorState>;
    /** The ID of the input node. */
    input_node: string;
    /** The ID of the output node. */
    output_node: string;
}