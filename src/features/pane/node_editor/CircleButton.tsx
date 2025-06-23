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

export default function CircleButton({
    id,
    className = "",
    onClick = () => { },
    onMouseDown = () => { },
    onMouseEnter = () => { },
    onMouseLeave = () => { },
}: {
    id: string,
    className?: string,
    onClick?: () => void,
    onMouseDown?: () => void,
    onMouseEnter?: () => void,
    onMouseLeave?: () => void,
}) {
    return (
        <button
            id={id}
            className={`w-2.5 h-2.5 rounded-full ${className}`}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        />
    );
}