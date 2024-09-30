export default class User {
  constructor(
    public username: string,
    public name: string,
    public email: string,
    public roles: string[],
    public groups: string[],
    public password?: string,
    public authToken?: string,
    public loggedIn?: boolean,
    public _id?: string
  ) {}
}
