import { Component, OnInit } from "@angular/core";
import { Group } from "../group";
import { GroupService } from "../group.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-group-list",
  standalone: true,
  imports: [ErrorComponent, RouterModule, ReactiveFormsModule],
  templateUrl: "./group-list.component.html",
  styleUrl: "./group-list.component.scss",
})
export class GroupListComponent implements OnInit {
  // Display a list of groups on the screen
  groups = [] as Group[];
  availableGroups: boolean[] = [];
  error: Error | null = null;
  isLoading = true;

  groupCreationForm: FormGroup;

  constructor(private groupService: GroupService) {
    this.groupCreationForm = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(3)]),
      description: new FormControl("", [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  // Get the logged in user's groups to determine which view buttons should be active
  async getUserGroups() {
    let token = sessionStorage.getItem("authToken");
    if (token) {
      token = token.split(".")[1]; // Get the payload from the JWT token (Ignore the header and signature)
      token = atob(token); // Decode Base64
    } else {
      return [];
    }
    const userGroups = JSON.parse(token).user.groups;

    // Turn the group names from the user in to group IDs
    const roleIDs = this.groupService.getGroupIdFromName("", userGroups);

    // Check if the user is a member of the group
    const resolvedRoleIDs = await Promise.all([roleIDs]).then((values) => {
      return values; // Return the resolved role IDs
    });

    // Now adjust the size of the availableGroups array to match the size of the groups array
    this.availableGroups = new Array(this.groups.length).fill(false);

    // Mark the groups that the user is a member of as available (true) in the availableGroups array
    for (let i = 0; i < this.groups.length; i++) {
      if (
        Array.isArray(resolvedRoleIDs[0]) &&
        resolvedRoleIDs[0].includes(this.groups[i].id)
      ) {
        this.availableGroups[i] = true;
      }
    }
    return this.availableGroups;
  }

  // Create a new group
  createGroup() {
    // Create a new slimmed-down group object with the values from the form
    const newGroup = {
      name: this.groupCreationForm.value.name,
      description: this.groupCreationForm.value.description,
    };

    this.groupService.createGroup(newGroup).subscribe({
      next: (response) => {
        // Value returns both the group and a new authToken for the user
        const { group, authToken } = response;

        sessionStorage.setItem("authToken", authToken);

        // Add the new group to the groups array
        this.groups.push(group);

        this.groupCreationForm.reset();
        this.getGroups();
      },
      error: (error) => {
        this.error = error;
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

  getGroups() {
    // Get the list of groups
    this.groupService.getGroups().subscribe({
      next: (value) => {
        // Set the groups array to the received groups
        this.groups = value;
        this.getUserGroups();
      },
      error: (error) => {
        this.error = error;
        if (this.error) {
          if (error.status) {
            // Get the message from the received API response
            this.error.message = `${error.status}: ${error.error.message}`;
          } else {
            this.error.message = "An unknown error occurred";
          }
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnInit() {
    this.getGroups();
  }
}
