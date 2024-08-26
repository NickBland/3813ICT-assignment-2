import { Component, Signal } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { UserService } from "../user.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {
  loggedIn$ = {} as Signal<boolean>;

  constructor(private userService: UserService, private router: Router) {
    this.loggedIn$ = this.userService.loggedIn$;
  }

  logout() {
    this.userService.logoutUser();
    this.router.navigate(["/login"]);
  }
}
