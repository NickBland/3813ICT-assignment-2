import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  loggedIn = false;
  username: string | null = null;

  constructor(private authService: AuthService) {
    // Refresh the loggedIn variable
    this.authService.isAuthenticated.subscribe((value) => {
      this.loggedIn = value;
      this.username = ` | ${sessionStorage.getItem("username")}`; // This WILL be here if the user is logged in
    });
  }

  logout() {
    this.authService.logoutUser();
    this.loggedIn = false;
    this.username = null;
  }
}
