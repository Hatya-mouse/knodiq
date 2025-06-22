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

import React from 'react';
import { PaneContentType, PaneNodeId } from './PaneNode';

interface PaneContextType {
    callSplitPane: (id: PaneNodeId, direction: "horizontal" | "vertical", size: number) => void;
    callSetPaneSize: (id: PaneNodeId, size: number) => void;
    callMergePanes: (parentId: PaneNodeId, remainingId: PaneNodeId) => void;
    callSetPaneType: (id: PaneNodeId, type: PaneContentType) => void;
}

export const PaneContext = React.createContext<PaneContextType | undefined>(undefined);