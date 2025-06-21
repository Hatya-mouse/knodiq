import React from 'react';
import { PaneContentType, PaneNodeId } from './PaneNode';

interface PaneContextType {
    callSplitPane: (id: PaneNodeId, direction: "horizontal" | "vertical", size: number) => void;
    callSetPaneSize: (id: PaneNodeId, size: number) => void;
    callMergePanes: (parentId: PaneNodeId, remainingId: PaneNodeId) => void;
    callSetPaneType: (id: PaneNodeId, type: PaneContentType) => void;
}

export const PaneContext = React.createContext<PaneContextType | undefined>(undefined);