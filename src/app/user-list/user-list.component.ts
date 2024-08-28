import { Component, OnInit } from "@angular/core";
import { User } from "../user";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [ErrorComponent, RouterModule],
  templateUrl: "./user-list.component.html",
  styleUrl: "./user-list.component.scss",
})
export class UserListComponent implements OnInit {
  // Display a list of users on the screen, with a URL to go to their profile

  // instantiate the vars to use
  users = [] as User[];
  error: Error | null = null;
  isLoading = true;

  constructor(private userService: UserService) {}

  getUsers() {
    // Get the list of users
    this.userService.getUsers().subscribe({
      next: (value) => {
        // Set the users array to the received users
        this.users = value;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error;
        this.isLoading = false;
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

  ngOnInit() {
    this.getUsers();
  }
}
