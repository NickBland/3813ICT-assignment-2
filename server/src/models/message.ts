export default class Message {
  constructor(
    public id: number,
    public sender: string,
    public file = false,
    public contents: string,
    public timestamp: Date,
    public channel: number,
    public _id?: string
  ) {}
}
