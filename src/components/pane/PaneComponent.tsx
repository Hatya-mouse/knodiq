import { useCallback, useEffect, useRef, useState, useContext } from "react";

import PaneHeader from "./PaneHeader";
import TrackArea from "@/features/track_area/TrackArea";
import { PaneContentType, PaneNode } from "./type/PaneNode";
import { EditorData } from "./type/EditorData";
import HSplitView from "../split_view/HSplitView";
import VSplitView from "../split_view/VSplitView";
import PaneDragZone from "./PaneDragZone";
import { PaneContext } from "./type/PaneContext";

export default function PaneComponent({
    paneNode,
    editorData = {},
}: {
    paneNode: PaneNode,
    editorData?: EditorData,
}) {
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitDirection, setSplitDirection] = useState<"top" | "bottom" | "left" | "right" | undefined>(undefined);
    const [splitAmount, setSplitAmount] = useState<number | undefined>(undefined);

    const paneRef = useRef<HTMLDivElement>(null);
    const context = useContext(PaneContext);

    if (!context) {
        throw new Error("PaneComponent must be used within a PaneContext.Provider");
    }

    useEffect(() => {

    }, [paneNode]);

    const handlePaneSelect = useCallback((pane: PaneContentType) => {
        if (paneNode.type === 'leaf') {
            context.callSetPaneType(paneNode.id, pane);
        }
    }, [paneNode, context]);

    const splitPane = useCallback((direction: "top" | "bottom" | "left" | "right", amount: number) => {
        if (paneNode.type === 'leaf') {
            setIsSplitting(true);
            setSplitDirection(direction);
            setSplitAmount(amount);
        }
    }, [paneNode, context]);

    const confirmDrag = useCallback(() => {
        if (splitAmount === undefined || paneNode.type !== 'leaf') return;

        if (splitDirection === "top" || splitDirection === "bottom") {
            context.callSplitPane(paneNode.id, 'horizontal', splitAmount);
        } else if (splitDirection === "left" || splitDirection === "right") {
            context.callSplitPane(paneNode.id, 'vertical', splitAmount);
        }

        setSplitDirection(undefined);
        setSplitAmount(undefined);
    }, [paneNode]);

    return (
        <div
            ref={paneRef}
            className="flex flex-col h-full w-full relative overflow-hidden"
            style={{
                cursor: splitDirection === 'top' ? 's-resize' :
                    splitDirection === 'bottom' ? 'n-resize' :
                        splitDirection === 'left' ? 'e-resize' :
                            splitDirection === 'right' ? 'w-resize' :
                                'default',
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
                        left={<PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />}
                        right={<PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />}
                        leftWidth={paneNode.size}
                        setLeftWidth={(newLeftWidth) => {
                            context.callSetPaneSize(paneNode.id, newLeftWidth);
                        }}
                    />
                ) : (
                    <VSplitView
                        className="h-full w-full"
                        top={<PaneComponent key={paneNode.children[0].id} paneNode={paneNode.children[0]} editorData={editorData} />}
                        bottom={<PaneComponent key={paneNode.children[1].id} paneNode={paneNode.children[1]} editorData={editorData} />}
                        topHeight={paneNode.size}
                        setTopHeight={(newTopHeight) => {
                            context.callSetPaneSize(paneNode.id, newTopHeight);
                        }}
                    />
                ))}
            </div>

            {paneNode.type === 'leaf' && (
                <>
                    <PaneDragZone className="w-full h-1 top-1.5" direction="top" onDragMove={(amount) => splitPane('top', amount)} onDragEnd={confirmDrag} />
                    <PaneDragZone className="w-full h-1 bottom-1.5" direction="bottom" onDragMove={(amount) => splitPane('bottom', paneRef.current?.clientHeight ?? 0 - amount)} onDragEnd={confirmDrag} />
                    <PaneDragZone className="w-1 h-full left-1.5" direction="left" onDragMove={(amount) => splitPane('left', amount)} onDragEnd={confirmDrag} />
                    <PaneDragZone className="w-1 h-full right-1.5" direction="right" onDragMove={(amount) => splitPane('right', paneRef.current?.clientWidth ?? 0 - amount)} onDragEnd={confirmDrag} />
                </>
            )}
        </div>
    );
}
