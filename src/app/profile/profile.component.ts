import { Component, Signal, OnInit } from "@angular/core";
import { User } from "../user";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [ErrorComponent, RouterModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit {
  // Simple profile view, allowing the user to see their own profile
  // There should also be a pop up form to edit the user's profile
  // This form should have a cancel button and a save button

  // insantaite the signals, and error code here
  user$ = {} as Signal<User>;
  loggedIn$ = {} as Signal<boolean>;
  error: Error | null = null;

  constructor(private userService: UserService) {
    // set the signals up
    this.user$ = this.userService.user$;
    this.loggedIn$ = this.userService.loggedIn$;
  }

  // Determine if the user is logged in, otherwise throw an error
  ngOnInit() {
    this.userService.refreshLoginState();
    if (!this.loggedIn$()) {
      this.error = new Error("You must be logged in to view this page!");
    }
  }
}
