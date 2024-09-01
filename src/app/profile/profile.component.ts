import { Component, Signal, OnInit, computed } from "@angular/core";
import { User } from "../user";
import { UserService } from "../user.service";
import { AuthService } from "../auth.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";
import {
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [ErrorComponent, RouterModule, ReactiveFormsModule],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent implements OnInit {
  // Simple profile view, allowing the user to see their own profile
  // There should also be a pop up form to edit the user's profile
  // This form should have a cancel button and a save button

  // instantiate the signals, and error code here
  user$ = {} as Signal<User>;
  error: Error | null = null;
  isLoading = true;
  success = false;

  username: string | null = null;

  profileUpdateForm: FormGroup;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {
    // set the signals up by tracking the global signal states
    this.user$ = computed(() => this.userService.user$());

    // Initialise the update form
    this.profileUpdateForm = new FormGroup({
      username: new FormControl("", [Validators.minLength(5)]),
      name: new FormControl("", [Validators.minLength(5)]),
      email: new FormControl("", [Validators.minLength(5), Validators.email]),
      password: new FormControl("", [Validators.minLength(3)]),
    });
  }

  // Get the user's profile
  getUser() {
    // Since the user is logged in, but signals are not updated between refreshes, we need to first get the user details from the JWT token
    let token = sessionStorage.getItem("authToken");
    if (token) {
      token = token.split(".")[1]; // Get the payload from the JWT token (Ignore the header and signature)
      token = atob(token); // Decode Base64
    }
    const userAuth = JSON.parse(token as string).user;

    // Set the global user signal to the userAuth object
    this.userService.user$.set(userAuth);
    this.isLoading = false;
  }

  updateProfile() {
    // Move the form data into a user object, only updating the fields that have changed (not empty)
    let user = this.user$();
    user = { ...user, ...this.profileUpdateForm.value };

    console.log(user);

    this.userService.updateUser(this.user$().username, user).subscribe({
      next: (user) => {
        this.userService.user$.set(user);
        this.isLoading = false;

        // Clear the form
        this.profileUpdateForm.reset();

        // Refresh the user object after updating the authToken with the received one
        sessionStorage.setItem("authToken", user.authToken ?? "");
        this.getUser();

        // Update Success to be true for 5 seconds
        this.success = true;
        setTimeout(() => {
          this.success = false;
        }, 5000);
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
  }

  deleteUser() {
    // Delete the user from the database
    this.userService.deleteUser(this.user$().username).subscribe({
      next: (response) => {
        console.log(response);
        // Log the user out, thereby removing the session storage
        this.authService.logoutUser();
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
  }

  // Determine if the user is logged in and perform actions, otherwise throw an error
  ngOnInit() {
    this.getUser();
  }
}
