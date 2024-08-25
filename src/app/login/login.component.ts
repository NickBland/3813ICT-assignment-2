import { Component, OnInit, Signal, effect } from "@angular/core";
import { Router } from "@angular/router";
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from "@angular/forms";
import { UserService } from "../user.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  loggedIn$ = {} as Signal<boolean>;

  loginForm: FormGroup;

  constructor(private userService: UserService, private router: Router) {
    effect(() => {
      if (this.loggedIn$()) {
        this.router.navigate(["/profile"]);
      }
    });

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
    this.userService.loginUser(this.loginForm.value.username, this.loginForm.value.password);
  }
}
