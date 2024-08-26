import { Component, OnInit, Signal, effect } from "@angular/core";
import { RouterModule, Router } from "@angular/router";
import { UserService } from "../user.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent implements OnInit {
  loggedIn$ = {} as Signal<boolean>;

  constructor(private userService: UserService, private router: Router) {
    // Effect to check if the user is logged in, and redirect to the login page if not (only works if currently on page)
    effect(() => {
      if (!this.loggedIn$()) {
        this.router.navigate(["/login"]);
      }
    });
  }

  ngOnInit() {
    this.loggedIn$ = this.userService.loggedIn$;
  }

  logout() {
    this.userService.logoutUser();
  }
}
