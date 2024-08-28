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

  constructor(private httpClient: HttpClient) {}

  // Get all users
  getUsers() {
    return this.httpClient.get<User[]>(`${this.apiURL}/api/user/`);
  }

  // Get a user by username
  getUser(username: string) {
    return this.httpClient.get<User>(`${this.apiURL}/api/user/${username}`);
  }

  updateUser(username: string, user: User): Observable<User> {
    return this.httpClient.put<User>(
      `${this.apiURL}/api/user/${username}`,
      user
    );
  }
}
