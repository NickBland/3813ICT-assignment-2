import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { User } from "./user";
import { HttpClient } from "@angular/common/http";
import { UserService } from "./user.service";

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
      this.refreshToken();
      this.isAuthenticated.next(true);
    } else {
      this.isAuthenticated.next(false);
    }
  }

  // Refresh token
  async refreshToken() {
    const username = sessionStorage.getItem("username");
    if (username) {
      const user = await firstValueFrom(
        this.userService.refreshToken(username)
      );
      sessionStorage.setItem("authToken", user.authToken ?? "");
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
    sessionStorage.removeItem("username");
    this.refreshLoginState();
    this.router.navigate(["/login"]);
  }
}
