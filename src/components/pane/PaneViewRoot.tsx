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

import { useMemo, useState } from 'react';
import { PaneContentType, PaneNode, PaneNodeId } from '../../lib/type/PaneNode';
import { PaneContext } from '../../lib/type/PaneContext';
import { EditorData } from '../../lib/type/EditorData';
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
                    return { ...remainingChild, id: parentId };
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