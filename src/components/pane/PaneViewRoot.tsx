import { useMemo, useState } from 'react';
import { PaneContentType, PaneNode, PaneNodeId } from './type/PaneNode';
import { PaneContext } from './type/PaneContext';
import { EditorData } from './type/EditorData';
import PaneComponent from './PaneComponent';

export default function PaneViewRoot({
    editorData
}: {
    editorData: EditorData
}) {
    const [paneLayout, setPaneLayout] = useState<PaneNode>({
        id: 'root',
        type: 'leaf',
        contentType: PaneContentType.TrackView,
    });

    const splitPane = (id: PaneNodeId, direction: "horizontal" | "vertical", size: number) => {
        setPaneLayout(prev => updatePaneNode(prev, id, node => {
            if (node.type === 'leaf') {
                const newPaneNode: PaneNode = {
                    id: node.id,
                    type: 'split',
                    direction,
                    children: [
                        { id: `${Date.now()}-1`, type: 'leaf', contentType: node.contentType },
                        { id: `${Date.now()}-2`, type: 'leaf', contentType: node.contentType }
                    ],
                    size,
                };
                return newPaneNode;
            }
            return { ...node };
        }));
    };

    const setPaneSize = (id: PaneNodeId, size: number) => {
        setPaneLayout(prev => updatePaneNode(prev, id, node => {
            if (node.type === 'split') {
                return {
                    ...node,
                    size,
                };
            } else {
                return { ...node };
            }
        }));
    };

    const mergePanes = (parentId: PaneNodeId, remainingId: PaneNodeId) => {
        setPaneLayout(prev => updatePaneNode(prev, parentId, node => {
            if (node.type === 'split') {
                // Find the child that has remainingId
                const remainingChild = node.children.find(child => child.id === remainingId);
                if (remainingChild) {
                    return remainingChild;
                }
            }
            return { ...node };
        }));
    };

    const setPaneType = (id: PaneNodeId, type: PaneContentType) => {
        setPaneLayout(prev => updatePaneNode(prev, id, node => {
            if (node.type === 'leaf') {
                const newPaneNode: PaneNode = {
                    ...node,
                    contentType: type,
                };
                return newPaneNode;
            }
            return { ...node };
        }));
    };

    const contextValue = useMemo(() => ({
        callSplitPane: splitPane,
        callSetPaneSize: setPaneSize,
        callMergePanes: mergePanes,
        callSetPaneType: setPaneType,
    }), [splitPane, setPaneSize, mergePanes, setPaneType]);

    return (
        <PaneContext.Provider value={contextValue}>
            <div className="h-full w-full">
                <PaneComponent
                    paneNode={paneLayout}
                    editorData={editorData}
                />
            </div>
        </PaneContext.Provider>
    )
}

function updatePaneNode(
    currentNode: PaneNode,
    targetId: PaneNodeId,
    updateFn: (node: PaneNode) => PaneNode
): PaneNode {
    if (currentNode.id === targetId) {
        return updateFn(currentNode);
    }

    if (currentNode.type === 'split') {
        const updatedChild0 = updatePaneNode(currentNode.children[0], targetId, updateFn);
        const updatedChild1 = updatePaneNode(currentNode.children[1], targetId, updateFn);

        if (updatedChild0 !== currentNode.children[0] || updatedChild1 !== currentNode.children[1]) {
            return {
                ...currentNode,
                children: [updatedChild0, updatedChild1],
            };
        }
    }

    return { ...currentNode };
}