export interface User {
  username: string;
  name: string;
  email: string;
  roles: string[];
  groups: string[];
  password?: string;
  authToken?: string;
  loggedIn?: boolean;
}
