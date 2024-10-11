export default class Message {
  constructor(
    public sender: string,
    public file = false,
    public contents: string,
    public timestamp: Date,
    public channel: number,
    public id?: number,
    public _id?: string
  ) {}
}
