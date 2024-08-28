import { Component, Signal, OnInit, computed } from "@angular/core";
import { User } from "../user";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-account-details",
  standalone: true,
  imports: [ErrorComponent],
  templateUrl: "./account-details.component.html",
  styleUrl: "./account-details.component.scss",
})
export class AccountDetailsComponent implements OnInit {
  // This is pretty much a read-only version of the profile component, allowing the user to see another user's profile
  // There should be a button to go back to the profile page

  // insantiate the signals, and error code here
  user$ = {} as Signal<User>;
  username: string | null = null; // The username of the user to view (taken from the URL params)
  loggedIn$ = {} as Signal<boolean>;
  error: Error | null = null;
  isLoading = true;

  constructor(private userService: UserService, private route: ActivatedRoute) {
    // set the signals up by tracking the global signal states
    this.user$ = computed(() => this.userService.user$());
    this.loggedIn$ = computed(() => this.userService.loggedIn$());
  }

  ngOnInit(): void {
    return;
  }
}
