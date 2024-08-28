import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { User } from "./user";
import { UserService } from "./user.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public isAuthenticated = new BehaviorSubject<boolean>(false);
  private apiURL = "http://localhost:8888";

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private userService: UserService
  ) {
    this.refreshLoginState();
  }

  refreshLoginState() {
    if (sessionStorage.getItem("authToken")) {
      this.isAuthenticated.next(true);
    }
  }

  // Login a user
  loginUser(username: string, password: string) {
    // Use the API to post login information
    return this.httpClient.post<User>(`${this.apiURL}/api/user/login`, {
      username,
      password,
    });
  }

  // Logout a user
  logoutUser() {
    // Clear the user from the session storage and navigate to the login page
    sessionStorage.removeItem("authToken");
    this.refreshLoginState();
    this.router.navigate(["/login"]);
  }
}
