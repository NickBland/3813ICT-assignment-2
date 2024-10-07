export default class Channel {
  constructor(
    public name: string,
    public description: string,
    public group?: number,
    public users?: string[],
    public messages?: [],
    public id?: number,
    public _id?: string
  ) {}
}
