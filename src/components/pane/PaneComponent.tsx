import { useCallback, useEffect, useRef, useState, useContext } from "react";

import PaneHeader from "./PaneHeader";
import TrackArea from "@/features/track_area/TrackArea";
import { PaneContentType, PaneNode, PaneNodeId } from "./type/PaneNode";
import { EditorData } from "./type/EditorData";
import HSplitView from "../split_view/HSplitView";
import VSplitView from "../split_view/VSplitView";
import PaneDragZone from "./PaneDragZone";
import { PaneContext } from "./type/PaneContext";

const MIN_SIZE = 150; // Minimum size for a pane to allow splitting
const CLOSE_SIZE = 50; // Size below which panes will merge

export default function PaneComponent({
    paneNode,
    editorData = {},
}: {
    paneNode: PaneNode,
    editorData?: EditorData,
}) {
    const [hoveredEdge, setHoveredEdge] = useState<"top" | "bottom" | "left" | "right" | undefined>(undefined);
    const [mergingChild, setMergingChild] = useState<PaneNodeId | undefined>(undefined);

    const paneRef = useRef<HTMLDivElement>(null);
    const context = useContext(PaneContext);

    const paneWidth = paneRef.current?.clientWidth ?? 0;
    const paneHeight = paneRef.current?.clientHeight ?? 0;

    if (!context) {
        throw new Error("PaneComponent must be used within a PaneContext.Provider");
    }

    const handlePaneSelect = useCallback((pane: PaneContentType) => {
        if (paneNode.type === 'leaf') {
            context.callSetPaneType(paneNode.id, pane);
        }
    }, [paneNode, context]);

    const splitPane = useCallback((edge: "top" | "bottom" | "left" | "right", amount: number) => {
        let residualAmount = 0;
        if (paneRef.current) {
            if (edge === "top" || edge === "bottom") {
                residualAmount = paneRef.current.clientHeight - amount;
            } else if (edge === "left" || edge === "right") {
                residualAmount = paneRef.current.clientWidth - amount;
            }
        }

        if (amount > MIN_SIZE && residualAmount > MIN_SIZE) {
            if (paneNode.type === 'leaf') {
                context.callSplitPane(paneNode.id, edge === 'right' || edge === 'left' ? 'horizontal' : 'vertical', amount);
            } else {
                context.callSetPaneSize(paneNode.id, amount);
            }
        } else if (paneNode.type === 'split') {
            context.callMergePanes(paneNode.id, paneNode.children[1].id);
        }
    }, [paneNode, context]);

    return (
        <div
            ref={paneRef}
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
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[0].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />
                        </>}
                        right={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[1].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />
                        </>}
                        leftWidth={paneNode.size}
                        onDragMove={(newLeftWidth) => {
                            if (newLeftWidth < CLOSE_SIZE) {
                                console.log("Merging left pane");
                                setMergingChild(paneNode.children[0].id);
                            } else if (paneWidth - newLeftWidth < CLOSE_SIZE) {
                                console.log("Merging right pane");
                                setMergingChild(paneNode.children[1].id);
                            } else {
                                console.log("Merge cancelled");
                                setMergingChild(undefined);
                            }
                            context.callSetPaneSize(paneNode.id, Math.min(Math.max(newLeftWidth, MIN_SIZE), paneWidth - MIN_SIZE));
                        }}
                        onDragEnd={() => {
                            setMergingChild(prev => {
                                if (prev) context.callMergePanes(paneNode.id, prev);
                                return undefined;
                            });
                        }}
                    />
                ) : (
                    <VSplitView
                        className="h-full w-full"
                        top={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[0].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />
                        </>}
                        bottom={<>
                            <div className="absolute w-full h-full z-10 pointer-events-none transition-colors duration-150" style={{ backgroundColor: mergingChild === paneNode.children[1].id ? 'var(--destructive-color)' : 'transparent' }} />
                            <PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />
                        </>}
                        topHeight={paneNode.size}
                        onDragMove={(newTopHeight) => {
                            if (newTopHeight < CLOSE_SIZE) {
                                console.log("Merging top pane");
                                setMergingChild(paneNode.children[0].id);
                            } else if (paneHeight - newTopHeight < CLOSE_SIZE) {
                                console.log("Merging bottom pane");
                                setMergingChild(paneNode.children[1].id);
                            } else {
                                console.log("Merge cancelled");
                                setMergingChild(undefined);
                            }
                            context.callSetPaneSize(paneNode.id, Math.min(Math.max(newTopHeight, MIN_SIZE), paneHeight - MIN_SIZE));
                        }}
                        onDragEnd={() => {
                            setMergingChild(prev => {
                                if (prev) context.callMergePanes(paneNode.id, prev);
                                return undefined;
                            });
                        }}
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
