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

  constructor(private authService: AuthService) {
    // Refresh the loggedIn variable
    this.authService.isAuthenticated.subscribe((value) => {
      this.loggedIn = value;
    });
  }

  logout() {
    this.authService.logoutUser();
    this.loggedIn = false;
  }
}
