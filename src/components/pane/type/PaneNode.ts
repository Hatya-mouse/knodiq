export enum PaneContentType {
    TrackView = "Track View",
    NodeEditor = "Node Editor",
}

export type PaneNodeId = string;

export type PaneNode = {
    id: PaneNodeId,
    type: 'leaf',
    contentType: PaneContentType,
} | {
    id: PaneNodeId,
    type: 'split',
    direction: 'horizontal' | 'vertical',
    children: [PaneNode, PaneNode],
    size: number,
}