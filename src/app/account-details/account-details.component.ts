import { Component, OnInit } from "@angular/core";
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

  // instantiate the vars to use, and error code here
  user = {} as User;
  username: string | null = null; // The username of the user to view (taken from the URL params)
  error: Error | null = null;
  isLoading = true;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  getUser() {
    // Get the user's profile
    if (this.username) {
      this.userService.getUser(this.username).subscribe({
        next: (value) => {
          // Set the user object to the received user
          this.user = value;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = error;
          this.isLoading = false;
          if (this.error) {
            if (error.status) {
              // Get the message from the received API response
              this.error.message = `${error.status}: ${error.error.message}`;
            } else {
              this.error.message = "An unknown error occurred";
            }
          }
        },
      });
    } else {
      this.error = new Error("No username provided");
      this.isLoading = false;
    }
  }

  ngOnInit() {
    // Get the information of the user to view from the URL params
    this.username = this.route.snapshot.paramMap.get("username");

    // Get the user's profile
    this.getUser();
  }
}
