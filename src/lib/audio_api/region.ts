export class Region {
    id: number;
    name: string;
    start: number;
    length: number;

    constructor(id: number, name: string, start: number, length: number) {
        this.id = id;
        this.name = name;
        this.start = start;
        this.length = length;
    }
}

export class BufferRegion extends Region {
    bufferId: number;
    volume: number;

    constructor(id: number, name: string, start: number, length: number, bufferId: number, volume: number) {
        super(id, name, start, length);
        this.bufferId = bufferId;
        this.volume = volume;
    }
}
