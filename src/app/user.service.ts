import { computed, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./user";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiURL = "http://localhost:8888";
  users$ = signal<User[]>([]);
  user$ = signal<User>({} as User);
  // Get the loggedIn property from the user object, if it exists, otherwise set it to false
  loggedIn$ = computed(() => this.user$().loggedIn || false);

  constructor(private httpClient: HttpClient) {}

  // Get all users
  getUsers() {
    this.httpClient
      .get<User[]>(`${this.apiURL}/api/user/users`)
      .subscribe((users) => {
        this.users$.set(users);
      });

    return this.users$;
  }

  // Login a user
  loginUser(username: string, password: string) {
    this.httpClient
      .post<User>(`${this.apiURL}/api/user/login`, {
        username,
        password,
      })
      .subscribe((user) => {
        this.user$.set(user);
      });

    return this.user$;
  }

  // Logout a user
  logoutUser() {
    this.user$.set({} as User);
  }
}
