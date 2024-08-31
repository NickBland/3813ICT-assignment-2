import { Component, OnInit } from "@angular/core";
import { GroupService } from "../group.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Group } from "../group";
import { ErrorComponent } from "../error/error.component";

@Component({
  selector: "app-group-profile",
  standalone: true,
  imports: [ErrorComponent, RouterModule],
  templateUrl: "./group-profile.component.html",
  styleUrl: "./group-profile.component.scss",
})
export class GroupProfileComponent implements OnInit {
  // instantiate the vars to use, and error code here
  group = {} as Group;
  groupId: number | null = null; // The group of the group to view (taken from the URL params)
  error: Error | null = null;
  isLoading = true;

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  getGroup() {
    // Get the user's profile
    if (this.groupId) {
      this.groupService.getGroup(this.groupId).subscribe({
        next: (value) => {
          // Set the user object to the received user
          this.group = value;
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
    } else {
      this.error = new Error("No group provided");
      this.isLoading = false;
    }
  }

  ngOnInit() {
    // Get the information of the user to view from the URL params
    try {
      this.groupId = Number(this.route.snapshot.paramMap.get("id"));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.error = new Error("Invalid group ID");
      this.isLoading = false;
    }

    // Get the user's profile
    this.getGroup();
  }
}
