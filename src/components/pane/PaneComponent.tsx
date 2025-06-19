import { useCallback, useRef, useEffect, useState, useContext } from "react";

import PaneHeader from "./PaneHeader";
import TrackArea from "@/features/track_area/TrackArea";
import { PaneContentType, PaneNode, PaneNodeId } from "./type/PaneNode";
import { EditorData } from "./type/EditorData";
import HSplitView from "../split_view/HSplitView";
import VSplitView from "../split_view/VSplitView";
import PaneDragZone from "./PaneDragZone";
import { PaneContext } from "./type/PaneContext";

const MIN_SIZE = 150; // Minimum size for a pane to allow splitting
const MERGE_SIZE = 50; // Size below which panes will merge

/**
 * In the left (or top) child of a split pane, we use `mergingChild === paneNode.children[1].id`
 * to determine whether to show the red overlay, rather than `mergingChild === paneNode.children[0].id`.
 *
 * This is because when resizing the split, if the user drags the divider far enough to "close" the left (or top) pane,
 * the right (or bottom) child is the one that will remain, and the left (or top) child will be merged (removed).
 * 
 * Therefore, when `mergingChild` is set to the right (or bottom) child's ID, it means the left (or top) child is about to be merged,
 * so we show the destructive (red) overlay on the left (or top) child to indicate it will be removed if the drag is completed.
 * 
 * Conversely, in the right (or bottom) child, we check if `mergingChild === paneNode.children[0].id` to show the overlay,
 * since in that case, the right (or bottom) child is about to be merged.
 */
export default function PaneComponent({
    paneNode,
    editorData = {},
}: {
    paneNode: PaneNode,
    editorData?: EditorData,
}) {
    const [hoveredEdge, setHoveredEdge] = useState<"top" | "bottom" | "left" | "right" | undefined>(undefined);
    const [mergingChild, setMergingChild] = useState<PaneNodeId | undefined>(undefined);

    const mergingChildRef = useRef<PaneNodeId | undefined>(undefined);

    const context = useContext(PaneContext);

    // Pane width and height in pixels
    const [paneWidth, setCurrentPaneWidth] = useState<number>(0);
    const [paneHeight, setCurrentPaneHeight] = useState<number>(0);

    if (!context) {
        throw new Error("PaneComponent must be used within a PaneContext.Provider");
    }

    useEffect(() => {
        mergingChildRef.current = mergingChild;
    }, [mergingChild]);

    const handlePaneRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setCurrentPaneWidth(entry.contentRect.width);
                setCurrentPaneHeight(entry.contentRect.height);
            }
        });

        observer.observe(node);
    }, [setCurrentPaneWidth, setCurrentPaneHeight]);

    const handlePaneSelect = useCallback((pane: PaneContentType) => {
        if (paneNode.type === 'leaf') {
            context.callSetPaneType(paneNode.id, pane);
        }
    }, [paneNode, context]);

    const splitPane = useCallback((edge: "top" | "bottom" | "left" | "right", amount: number) => {
        let residualAmount = 0;
        if (edge === "top" || edge === "bottom") {
            residualAmount = paneHeight - amount;
        } else if (edge === "left" || edge === "right") {
            residualAmount = paneWidth - amount;
        }

        const isHorizontal = edge === 'right' || edge === 'left';

        if (amount > MIN_SIZE && residualAmount > MIN_SIZE) {
            if (paneNode.type === 'leaf') {
                context.callSplitPane(paneNode.id, isHorizontal ? 'horizontal' : 'vertical', amount / (isHorizontal ? paneWidth : paneHeight));
            } else {
                context.callSetPaneSize(paneNode.id, amount / (isHorizontal ? paneWidth : paneHeight));
            }
        } else if (paneNode.type === 'split') {
            context.callMergePanes(paneNode.id, paneNode.children[1].id);
        }
    }, [paneNode, context, paneWidth, paneHeight]);

    const handleDragSplit = useCallback((newSize: number, direction: 'horizontal' | 'vertical') => {
        if (paneNode.type !== 'split') return;

        let paneSize = direction === 'horizontal' ? paneWidth : paneHeight;

        if (newSize < MERGE_SIZE) {
            setMergingChild(paneNode.children[1].id);
        } else if (paneSize - newSize < MERGE_SIZE) {
            setMergingChild(paneNode.children[0].id);
        } else {
            setMergingChild(undefined);
            context.callSetPaneSize(paneNode.id, Math.min(
                Math.max(newSize, MIN_SIZE),
                paneWidth - MIN_SIZE
            ) / (
                    direction === 'horizontal' ? paneWidth : paneHeight
                ));
        }
    }, [paneNode, mergingChild, paneWidth, paneHeight, context]);

    const handleDragEnd = useCallback(() => {
        const finalMergingChild = mergingChildRef.current;
        setTimeout(() => {
            if (finalMergingChild && paneNode.type === 'split') {
                context.callMergePanes(paneNode.id, finalMergingChild);
            }
            setMergingChild(undefined);
        }, 0);
    }, [paneNode, mergingChild, context]);

    return (
        <div
            ref={handlePaneRef}
            className="flex flex-col h-full w-full relative overflow-hidden"
            style={{
                cursor: hoveredEdge ? (
                    hoveredEdge === 'top' ? 'n-resize' :
                        hoveredEdge === 'bottom' ? 's-resize' :
                            hoveredEdge === 'left' ? 'w-resize' :
                                hoveredEdge === 'right' ? 'e-resize' :
                                    'default'
                ) : 'default',
            }}
        >
            <div className="h-full w-full">
                {paneNode.type === 'leaf' &&
                    <div className="h-full w-full">
                        <PaneHeader selectedPane={paneNode.contentType} onPaneSelect={handlePaneSelect} />
                        {paneNode.contentType === PaneContentType.TrackView && editorData.trackViewData &&
                            <TrackArea
                                mixerState={editorData.trackViewData.mixerState}
                                currentTime={editorData.trackViewData.currentTime}
                                onAddTrack={editorData.trackViewData.onAddTrack}
                                onRemoveTrack={editorData.trackViewData.onRemoveTrack}
                                onMoveRegion={editorData.trackViewData.onMoveRegion}
                                seek={editorData.trackViewData.seek}
                            />
                        }
                    </div>
                }
                {paneNode.type === 'split' && (paneNode.direction === 'horizontal' ? (
                    <HSplitView
                        className="h-full w-full"
                        left={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[1].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />
                        </>}
                        right={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[0].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />
                        </>}
                        leftWidth={paneNode.size * paneWidth}
                        onDragMove={size => handleDragSplit(size, 'horizontal')}
                        onDragEnd={handleDragEnd}
                    />
                ) : (
                    <VSplitView
                        className="h-full w-full"
                        top={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[1].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />
                        </>}
                        bottom={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[0].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />
                        </>}
                        topHeight={paneNode.size * paneHeight}
                        onDragMove={size => handleDragSplit(size, 'vertical')}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>

            {paneNode.type === 'leaf' && (
                <>
                    <PaneDragZone className="w-full h-1 top-1.5" direction="top" onMouseEnter={() => setHoveredEdge('top')} onMouseLeave={() => setHoveredEdge(undefined)} onDragMove={(amount) => splitPane('top', amount)} />
                    <PaneDragZone className="w-full h-1 bottom-1.5" direction="bottom" onMouseEnter={() => setHoveredEdge('bottom')} onMouseLeave={() => setHoveredEdge(undefined)} onDragMove={(amount) => splitPane('bottom', amount)} />
                    <PaneDragZone className="w-1 h-full left-1.5" direction="left" onMouseEnter={() => setHoveredEdge('left')} onMouseLeave={() => setHoveredEdge(undefined)} onDragMove={(amount) => splitPane('left', amount)} />
                    <PaneDragZone className="w-1 h-full right-1.5" direction="right" onMouseEnter={() => setHoveredEdge('right')} onMouseLeave={() => setHoveredEdge(undefined)} onDragMove={(amount) => splitPane('right', amount)} />
                </>
            )}
        </div>
    );
}
