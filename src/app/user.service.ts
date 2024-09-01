import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { User } from "./user";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiURL = "http://localhost:8888";
  public users$ = signal<User[]>([]);
  public user$ = signal<User>({} as User);

  constructor(private httpClient: HttpClient) {}

  // Get all users
  getUsers() {
    return this.httpClient.get<User[]>(`${this.apiURL}/api/user/`);
  }

  // Get a user by username
  getUser(username: string) {
    return this.httpClient.get<User>(`${this.apiURL}/api/user/${username}`);
  }

  // Update a user
  updateUser(username: string, user: User): Observable<User> {
    return this.httpClient.put<User>(
      `${this.apiURL}/api/user/${username}`,
      user
    );
  }

  // Delete a user
  deleteUser(username: string): Observable<User> {
    return this.httpClient.delete<User>(`${this.apiURL}/api/user/${username}`);
  }

  // Create a user
  createUser(user: User): Observable<User> {
    return this.httpClient.post<User>(`${this.apiURL}/api/user/`, user);
  }

  // Refresh a user's token
  refreshToken(username: string): Observable<User> {
    return this.httpClient.patch<User>(`${this.apiURL}/api/user/refresh`, {
      username: username,
    });
  }
}
