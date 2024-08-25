import { computed, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./user";
import { Observable } from "rxjs";

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

  // Get a user by username
  getUser(username: string) {
    return this.httpClient.get<User>(`${this.apiURL}/api/user/${username}`);
  }

  // Login a user
  loginUser(username: string, password: string): Observable<User> {
    return this.httpClient.post<User>(`${this.apiURL}/api/user/login`, {
      username,
      password,
    });
  }

  // Logout a user
  logoutUser() {
    this.user$.set({} as User);
  }
}
