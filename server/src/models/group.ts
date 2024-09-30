export default class Group {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public users: string[],
    public admins: string[],
    public channels: number[],
    public _id?: string
  ) {}
}
