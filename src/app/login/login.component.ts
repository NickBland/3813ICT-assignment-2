import { Component, OnInit, Signal, effect } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule, NgForm } from "@angular/forms";
import { UserService } from "../user.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  loggedIn$ = {} as Signal<boolean>;

  constructor(private userService: UserService, private router: Router) {
    effect(() => {
      if (this.loggedIn$()) {
        this.router.navigate(["/profile"]);
      }
    });
  }

  ngOnInit() {
    this.loggedIn$ = this.userService.loggedIn$;
  }

  onSubmit(form: NgForm) {
    this.userService.loginUser(form.value.username, form.value.password);
  }
}
