import { Component, OnInit, Signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  loggedIn$ = {} as Signal<boolean>;
  error: Error | null = null;

  loginForm: FormGroup;

  constructor(private userService: UserService, private router: Router) {
    // Initialise the login form, with two form controls: username and password
    this.loginForm = new FormGroup({
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
    });
  }

  ngOnInit() {
    this.loggedIn$ = this.userService.loggedIn$;
  }

  submitLogin() {
    this.userService
      .loginUser(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe({
        next: (user) => {
          // Set the user$ signal to the user object returned from the login service, then navigate to the profile page
          this.userService.user$.set(user);
          sessionStorage.setItem("authToken", user.authToken ?? "");
          this.router.navigate(["/profile"]);
        },
        error: (error) => {
          // Format the error message in to a user-friendly message
          // Must be wrapped in an if statement to prevent errors if the error object is undefined
          if (this.error) {
            if (error.status === 401) {
              // Get the message from the received API response
              this.error.message = error.error.message;
            } else {
              this.error.message = "An unknown error occurred";
            }
          }
        },
      });
  }
}
