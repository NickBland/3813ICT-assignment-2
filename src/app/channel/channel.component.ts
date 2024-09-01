import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ErrorComponent } from "../error/error.component";
import { ChannelService } from "../channel.service";
import { Channel } from "../channel";
import { Group } from "../group";
import { GroupService } from "../group.service";

@Component({
  selector: "app-channel",
  standalone: true,
  imports: [ErrorComponent, RouterModule],
  templateUrl: "./channel.component.html",
  styleUrl: "./channel.component.scss",
})
export class ChannelComponent implements OnInit {
  channelID = 0;
  channel = {} as Channel;
  error: Error | null = null;
  isLoading = false;

  groupID = 0;
  group = {} as Group;

  isGroupAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private groupService: GroupService
  ) {}

  getChannel() {
    this.channelService.getChannel(this.channelID).subscribe({
      next: (channel) => {
        this.channel = channel;
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
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getGroup() {
    this.groupService.getGroup(this.groupID).subscribe({
      next: (group) => {
        this.group = group;
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
      complete: () => {
        this.setAdmin();
      },
      // Loading is set to false in the getChannel() method, since that is called afterwards
    });
  }

  removeUser() {
    return;
  }

  addUser() {
    return;
  }

  setAdmin() {
    // Determine if the logged in user is an admin of the group
    if (this.group.admins.includes(sessionStorage.getItem("username") ?? "")) {
      this.isGroupAdmin = true;
    } else {
      this.isGroupAdmin = false;
    }
  }

  ngOnInit() {
    this.isLoading = true;
    try {
      this.channelID = Number(this.route.snapshot.paramMap.get("channelId"));
      this.groupID = Number(this.route.snapshot.paramMap.get("id"));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      this.error = new Error("Invalid group ID");
      this.isLoading = false;
    }
    this.getGroup();
    this.getChannel();
  }
}
