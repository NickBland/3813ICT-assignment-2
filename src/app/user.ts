export interface User {
  _id?: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  groups: string[];
  password?: string;
  authToken?: string;
  online?: boolean;
  loggedIn?: boolean;
}
