import { Component, Signal } from "@angular/core";
import { Router } from "@angular/router";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loggedIn$ = {} as Signal<boolean>;
  error: Error | null = null;

  loginForm: FormGroup;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialise the login form, with two form controls: username and password
    this.loginForm = new FormGroup({
      username: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
    });
  }

  submitLogin() {
    // Login the user
    // Check if the function returns an error and format, otherwise pass
    this.authService
      .loginUser(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe({
        next: (user) => {
          sessionStorage.setItem("authToken", user.authToken ?? "");
          this.userService.user$.set(user); // Set the global user signal to the user object returned from the request
          this.authService.refreshLoginState();
          this.router.navigate(["/profile"]);
        },
        error: (error) => {
          this.error = error;
          if (this.error) {
            if (error.status === 401) {
              // Get the message from the received API response
              this.error.message = `${error.status}: ${error.error.message}`;
            } else {
              this.error.message = "An unknown error occurred";
            }
          }
        },
      });
  }
}
