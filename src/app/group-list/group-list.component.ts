import { Component, OnInit } from "@angular/core";
import { Group } from "../group";
import { GroupService } from "../group.service";
import { ErrorComponent } from "../error/error.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-group-list",
  standalone: true,
  imports: [ErrorComponent, RouterModule],
  templateUrl: "./group-list.component.html",
  styleUrl: "./group-list.component.scss",
})
export class GroupListComponent implements OnInit {
  constructor(private groupService: GroupService) {}

  // Display a list of groups on the screen
  groups = [] as Group[];
  availableGroups: boolean[] = [];
  error: Error | null = null;
  isLoading = true;

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

  getGroups() {
    // Get the list of groups
    this.groupService.getGroups().subscribe({
      next: (value) => {
        // Set the groups array to the received groups
        this.groups = value;
        this.getUserGroups();
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
    this.getGroups();
  }
}
