import { Injectable, signal } from "@angular/core";
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
  loggedIn$ = signal<boolean>(false);

  refreshLoginState() {
    this.loggedIn$.set(!!sessionStorage.getItem("authToken"));
  }

  constructor(private httpClient: HttpClient) {}

  // Get all users
  getUsers() {
    return this.httpClient.get<User[]>(`${this.apiURL}/api/user/`);
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
    sessionStorage.removeItem("authToken");
    this.refreshLoginState();
  }
}
