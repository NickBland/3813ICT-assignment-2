import { Component, OnInit } from "@angular/core";
import { User } from "../user";
import { UserService } from "../user.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [ErrorComponent, RouterModule, ReactiveFormsModule],
  templateUrl: "./user-list.component.html",
  styleUrl: "./user-list.component.scss",
})
export class UserListComponent implements OnInit {
  // Display a list of users on the screen, with a URL to go to their profile

  // instantiate the vars to use
  users = [] as User[];
  error: Error | null = null;
  isLoading = true;
  isSuperAdmin = false;

  userForm: FormGroup;

  constructor(private userService: UserService) {
    // Initialise the user form
    this.userForm = new FormGroup({
      username: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
      name: new FormControl("", [Validators.required, Validators.minLength(5)]),
      email: new FormControl("", [
        Validators.required,
        Validators.minLength(5),
        Validators.email,
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  // Update whether the logged in user is a super admin or not
  getAdminStatus() {
    // Retrieve whether the logged in user has the role "super" or not
    if (sessionStorage.getItem("username")) {
      for (const user of this.users) {
        if (user.username === sessionStorage.getItem("username")) {
          // console.log(user.roles.includes("super"));
          return (this.isSuperAdmin = user.roles.includes("super"));
        }
      }
    }
    return (this.isSuperAdmin = false);
  }

  // Assign the user to be deleted
  userToDelete = "";
  assignUserToDelete(username: string) {
    this.userToDelete = username;
  }

  // Delete a user
  deleteUser() {
    this.isLoading = true;
    if (this.userToDelete === "") {
      this.error = new Error("No user provided");
      this.isLoading = false;
      return;
    }
    // Delete the user
    this.userService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        this.assignUserToDelete("");
        // Re-get the users to update the user list
        this.getUsers();
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

  // Create a new user
  createUser() {
    this.isLoading = true;

    // Create a user object with default values
    const newUser: User = {
      username: "",
      name: "",
      password: "",
      email: "",
      roles: [],
      groups: [],
    };

    // Assign the form values to the new user
    newUser.username = this.userForm.value.username;
    newUser.name = this.userForm.value.name;
    newUser.email = this.userForm.value.email;
    newUser.password = this.userForm.value.password;

    // Create a new user
    this.userService.createUser(newUser).subscribe({
      next: () => {
        // Re-get the users to update the user list
        this.getUsers();
        this.userForm.reset(); // Clear the form
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

  // Get the list of all users
  getUsers() {
    // Get the list of users
    this.userService.getUsers().subscribe({
      next: (value) => {
        // Set the users array to the received users
        this.users = value;
        this.getAdminStatus();
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
