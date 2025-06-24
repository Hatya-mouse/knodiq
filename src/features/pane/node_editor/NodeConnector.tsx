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

export default function NodeConnector({
    x1,
    y1,
    x2,
    y2,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}) {
    const horizontalOffset = Math.abs(x1 - x2) * 0.6;
    const pathData = `M ${x1} ${y1} C ${x1 + horizontalOffset} ${y1}, ${x2 - horizontalOffset} ${y2}, ${x2} ${y2}`;

    return (
        <path
            d={pathData}
            stroke="var(--text)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
        />
    );
}