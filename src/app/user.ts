export interface User {
  username: string;
  name: string;
  email: string;
  roles: string[];
  groups: string[];
  password?: string; // <-- This is optional, as we don't store this often. But it's good to associate it with the user objects.
  loggedIn?: boolean;
}
