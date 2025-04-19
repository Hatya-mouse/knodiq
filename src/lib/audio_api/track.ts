export default class Track {
    id: number;
    name: string;
    volume: number;

    constructor(id: number, name: string, volume: number) {
        this.id = id;
        this.name = name;
        this.volume = volume;
    }
}