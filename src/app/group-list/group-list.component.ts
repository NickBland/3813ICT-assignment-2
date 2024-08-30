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
  error: Error | null = null;
  isLoading = true;

  getGroups() {
    // Get the list of groups
    this.groupService.getGroups().subscribe({
      next: (value) => {
        // Set the groups array to the received groups
        this.groups = value;
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
