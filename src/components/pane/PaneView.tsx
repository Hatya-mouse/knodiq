import { useCallback, useEffect, useRef, useState } from "react";
import PaneHeader from "./PaneHeader";
import TrackArea from "@/features/track_area/TrackArea";
import { PaneData, PaneContentType } from "./PaneData";
import HSplitView from "./HSplitView";
import VSplitView from "./VSplitView";
import PaneDragZone from "./PaneDragZone";

export type PaneNode = {
    id: string,
    type: 'leaf',
    contentType: PaneContentType,
} | {
    id: string,
    type: 'split',
    direction: 'horizontal' | 'vertical',
    children: [PaneNode, PaneNode],
    size: number,
}

export default function PaneView({
    paneNode,
    onSetPaneNode,
    paneData = {},
}: {
    paneNode: PaneNode,
    onSetPaneNode: (node: PaneNode) => void,
    paneData?: PaneData,
}) {
    const [hoveringEdge, setHoveringEdge] = useState<'top' | 'bottom' | 'left' | 'right' | undefined>(undefined);
    const [originalContentType, setOriginalContentType] = useState<PaneContentType>(paneNode.type === 'leaf' ? paneNode.contentType : PaneContentType.TrackView);

    const paneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log(`Rendering pane node ${paneNode.id}:`, paneNode);
    }, [paneNode]);

    const handlePaneSelect = useCallback((pane: PaneContentType) => {
        if (paneNode.type === 'leaf') {
            onSetPaneNode({ ...paneNode, contentType: pane });
        }
    }, [paneNode, onSetPaneNode]);

    const handleSetPaneNode = useCallback((newNode: PaneNode) => {
        if (paneNode.type === 'split') {
            const newChildren = paneNode.children.map(child =>
                child.id === newNode.id ? newNode : child
            ) as [PaneNode, PaneNode];
            onSetPaneNode({ ...paneNode, children: newChildren });
        }
    }, [paneNode, onSetPaneNode]);

    const splitPane = useCallback((direction: 'top' | 'bottom' | 'left' | 'right', amount: number) => {
        let residualAmount = 0;
        if (direction === 'top' || direction === 'bottom') {
            residualAmount = (paneRef.current?.clientHeight || 0) - amount;
        } else {
            residualAmount = (paneRef.current?.clientWidth || 0) - amount;
        }
        if (amount > 50 && residualAmount > 50) {
            const splitDirection = hoveringEdge === 'top' || hoveringEdge === 'bottom' ? 'vertical' : 'horizontal';

            const newPaneNode: PaneNode = {
                id: paneNode.id,
                type: 'split',
                direction: splitDirection,
                children: [
                    { id: `${Date.now()}-1`, type: 'leaf', contentType: originalContentType },
                    { id: `${Date.now()}-2`, type: 'leaf', contentType: originalContentType }
                ],
                size: amount,
            };

            setHoveringEdge(direction);
            onSetPaneNode(newPaneNode);
            setOriginalContentType(paneNode.type === 'leaf' ? paneNode.contentType : PaneContentType.TrackView);
        } else {
            const newPaneNode: PaneNode = {
                id: paneNode.id,
                type: 'leaf',
                contentType: originalContentType,
            }

            setHoveringEdge(undefined);
            onSetPaneNode(newPaneNode);
            setOriginalContentType(paneNode.type === 'leaf' ? paneNode.contentType : PaneContentType.TrackView);
        }
    }, [hoveringEdge, paneNode, onSetPaneNode]);

    return (
        <div
            ref={paneRef}
            className="flex flex-col h-full w-full relative overflow-hidden"
            style={{
                cursor: hoveringEdge === 'top' ? 's-resize' :
                    hoveringEdge === 'bottom' ? 'n-resize' :
                        hoveringEdge === 'left' ? 'e-resize' :
                            hoveringEdge === 'right' ? 'w-resize' :
                                'default',
            }}
        >
            <div className="h-full w-full">
                {paneNode.type === 'leaf' &&
                    <div className="h-full w-full">
                        <PaneHeader selectedPane={paneNode.contentType} onPaneSelect={handlePaneSelect} />
                        {paneNode.contentType === PaneContentType.TrackView && paneData.trackViewData &&
                            <TrackArea
                                mixerState={paneData.trackViewData.mixerState}
                                currentTime={paneData.trackViewData.currentTime}
                                onAddTrack={paneData.trackViewData.onAddTrack}
                                onRemoveTrack={paneData.trackViewData.onRemoveTrack}
                                onMoveRegion={paneData.trackViewData.onMoveRegion}
                                seek={paneData.trackViewData.seek}
                            />
                        }
                    </div>
                }
                {paneNode.type === 'split' && (paneNode.direction === 'horizontal' ? (
                    <HSplitView
                        className="h-full w-full"
                        left={<PaneView paneNode={paneNode.children[0]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                        right={<PaneView paneNode={paneNode.children[1]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                        leftWidth={paneNode.size}
                        setLeftWidth={(newLeftWidth) => {
                            onSetPaneNode({ ...paneNode, size: newLeftWidth });
                        }}
                    />
                ) : (
                    <VSplitView
                        className="h-full w-full"
                        top={<PaneView paneNode={paneNode.children[0]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                        bottom={<PaneView paneNode={paneNode.children[1]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                        topHeight={paneNode.size}
                        setTopHeight={(newTopHeight) => {
                            onSetPaneNode({ ...paneNode, size: newTopHeight });
                        }}
                    />
                ))}
            </div>

            {paneNode.type === 'leaf' && (
                <>
                    <PaneDragZone className="w-full h-1 top-1.5" direction="top" onMouseEnter={() => setHoveringEdge('top')} onMouseLeave={() => setHoveringEdge(undefined)} onDragMove={(amount) => splitPane("top", amount)} />
                    <PaneDragZone className="w-full h-1 bottom-1.5" direction="bottom" onMouseEnter={() => setHoveringEdge('bottom')} onMouseLeave={() => setHoveringEdge(undefined)} onDragMove={(amount) => splitPane("bottom", amount)} />
                    <PaneDragZone className="w-1 h-full left-1.5" direction="left" onMouseEnter={() => setHoveringEdge('left')} onMouseLeave={() => setHoveringEdge(undefined)} onDragMove={(amount) => splitPane("left", amount)} />
                    <PaneDragZone className="w-1 h-full right-1.5" direction="right" onMouseEnter={() => setHoveringEdge('right')} onMouseLeave={() => setHoveringEdge(undefined)} onDragMove={(amount) => splitPane("right", amount)} />
                </>
            )}
        </div>
    );
}
