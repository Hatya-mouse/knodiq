import { BufferRegion } from "@lib/audio_api/region";

export class Track {
    id: number;
    name: string;
    volume: number;

    constructor(id: number, name: string, volume: number) {
        this.id = id;
        this.name = name;
        this.volume = volume;
    }
}

export class BufferTrack extends Track {
    regions: BufferRegion[];

    constructor(id: number, name: string, volume: number, regions: BufferRegion[]) {
        super(id, name, volume);
        this.regions = regions;
    }
}