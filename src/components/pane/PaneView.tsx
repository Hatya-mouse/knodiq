import { useEffect, useRef, useState } from "react";
import PaneHeader from "./PaneHeader";
import TrackArea from "@/features/track_area/TrackArea";
import { PaneData, PaneContentType } from "./PaneData";
import HSplitView from "./HSplitView";
import VSplitView from "./VSplitView";

export type PaneNode = {
    id: string,
    type: 'leaf',
    contentType: PaneContentType,
} | {
    id: string,
    type: 'split',
    direction: 'horizontal' | 'vertical',
    children: PaneNode[],
    sizes: [number, number],
}

export default function PaneView({
    paneNode,
    onSetPaneNode,
    paneData = {},
}: {
    paneNode: PaneNode,
    onSetPaneNode: (id: string, node: PaneNode) => void,
    paneData?: PaneData,
}) {
    const [paneType, setPaneType] = useState<PaneContentType | undefined>(PaneContentType.TrackView);

    const handlePaneSelect = (pane: PaneContentType) => {
        setPaneType(pane);
    };

    const handleSetPaneNode = (id: string, newNode: PaneNode) => {
        onSetPaneNode(id, paneNode.type === 'split' ? {
            ...paneNode,
            children: paneNode.children.map(child => child.id === id ? newNode : child),
        } : paneNode);
    };

    const content = (
        <div className="h-full">
            {paneNode.type === 'leaf' &&
                <div className="h-full">
                    <PaneHeader selectedPane={paneType} onPaneSelect={handlePaneSelect} />
                    {paneType === PaneContentType.TrackView && paneData.trackViewData &&
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
                    leftWidth={paneNode.sizes[0]}
                    setLeftWidth={(newLeftWidth) => {
                        if (paneNode.type === 'split' && paneNode.direction === 'horizontal') {
                            // Assuming sizes are percentages
                            const newSizes: [number, number] = [newLeftWidth, 100 - newLeftWidth];
                            const updatedNode: PaneNode = { ...paneNode, sizes: newSizes };
                            onSetPaneNode(paneNode.id, updatedNode);
                        }
                    }}
                />
            ) : (
                <VSplitView
                    className="h-full w-full"
                    top={<PaneView paneNode={paneNode.children[0]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                    bottom={<PaneView paneNode={paneNode.children[1]} onSetPaneNode={handleSetPaneNode} paneData={paneData} />}
                    topHeight={paneNode.sizes[0]}
                    setTopHeight={(newTopHeight) => {
                        if (paneNode.type === 'split' && paneNode.direction === 'vertical') {
                            // Assuming sizes are percentages
                            const newSizes: [number, number] = [newTopHeight, 100 - newTopHeight];
                            const updatedNode: PaneNode = { ...paneNode, sizes: newSizes };
                            onSetPaneNode(paneNode.id, updatedNode);
                        }
                    }}
                />
            ))}
        </div>
    );

    return (
        <div
            className="flex flex-col h-full relative overflow-hidden"
        // style={{
        //     cursor: hoveringEdge === 'top' ? 's-resize' :
        //         hoveringEdge === 'bottom' ? 'n-resize' :
        //             hoveringEdge === 'left' ? 'e-resize' :
        //                 hoveringEdge === 'right' ? 'w-resize' :
        //                     'default',
        // }}
        >
            {content}

            {/* <div
                className={`absolute pointer-events-none left-0 w-full h-[4px]
                            transform transition duration-200 ease-out`}
                style={{
                    background: 'var(--accent-color)',
                    zIndex: 100,
                    top: 0,
                    transform: hoveringEdge === 'top' ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: 'top',
                    opacity: hoveringEdge === 'top' ? 1 : 0,
                }}
            ></div>

            <div
                className={`absolute pointer-events-none left-0 w-full h-[4px]
                            transform transition duration-200 ease-out`}
                style={{
                    background: 'var(--accent-color)',
                    zIndex: 100,
                    bottom: 0,
                    transform: hoveringEdge === 'bottom' ? 'scaleY(1)' : 'scaleY(0)',
                    transformOrigin: 'bottom',
                    opacity: hoveringEdge === 'bottom' ? 1 : 0,
                }}
            ></div>

            <div
                className={`absolute pointer-events-none top-0 h-full w-[4px]
                            transform transition duration-200 ease-out`}
                style={{
                    background: 'var(--accent-color)',
                    zIndex: 100,
                    left: 0,
                    transform: hoveringEdge === 'left' ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    opacity: hoveringEdge === 'left' ? 1 : 0,
                }}
            ></div>

            <div
                className={`absolute pointer-events-none top-0 h-full w-[4px]
                            transform transition duration-200 ease-out`}
                style={{
                    background: 'var(--accent-color)',
                    zIndex: 100,
                    right: 0,
                    transform: hoveringEdge === 'right' ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'right',
                    opacity: hoveringEdge === 'right' ? 1 : 0,
                }}
            ></div> */}
        </div>
    );
}
