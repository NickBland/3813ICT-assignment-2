import { Component, OnInit, Signal } from "@angular/core";
import { RouterModule } from "@angular/router";
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

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loggedIn$ = this.userService.loggedIn$;
  }

  logout() {
    this.userService.logoutUser();
  }
}
