import { Component, OnInit } from "@angular/core";
import { GroupService } from "../group.service";
import { ChannelService } from "../channel.service";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { Group } from "../group";
import { ErrorComponent } from "../error/error.component";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { User } from "../user";
import { UserService } from "../user.service";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-group-profile",
  standalone: true,
  imports: [ErrorComponent, RouterModule, ReactiveFormsModule],
  templateUrl: "./group-profile.component.html",
  styleUrl: "./group-profile.component.scss",
})
export class GroupProfileComponent implements OnInit {
  // instantiate the vars to use, and error code here
  group = {} as Group;
  groupId: number | null = null; // The group of the group to view (taken from the URL params)
  channelNames: string[] = [];
  error: Error | null = null;
  isLoading = true;
  isAdmin = false;

  channelForm: FormGroup;

  users = [] as User[];
  usersToAdd = [] as string[];
  usersToRemove = [] as string[];
  addUserForm: FormGroup;
  removeUserForm: FormGroup;

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private userService: UserService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialise the channel form, with one form control: channelName
    this.channelForm = new FormGroup({
      channelName: new FormControl("", [Validators.required]),
      channelDescription: new FormControl("", [Validators.required]),
    });

    // Initialise the other forms
    this.addUserForm = new FormGroup({
      username: new FormControl(this.usersToAdd, [Validators.required]),
    });

    this.removeUserForm = new FormGroup({
      username: new FormControl(this.usersToRemove, [Validators.required]),
    });
  }

  // Create a channel
  createChannel() {
    this.isLoading = true;
    // Create the channel
    this.channelService
      .createChannel(this.group.id, {
        name: this.channelForm.value.channelName,
        description: this.channelForm.value.channelDescription,
      })
      .subscribe({
        next: () => {
          // Re-get the group to update the channel list
          this.getGroup();

          // Finally, reset the form, and close the modal
          this.channelForm.reset();
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
      });
  }

  // Assign the channel to be deleted
  deleteChannelId = 0;
  assignDeleteChannel(channelId: number) {
    this.deleteChannelId = channelId;
  }

  // Delete a channel
  deleteChannel() {
    this.isLoading = true;
    if (this.deleteChannelId === 0) {
      this.error = new Error("No channel provided");
      this.isLoading = false;
      return;
    }
    this.channelService.deleteChannel(this.deleteChannelId).subscribe({
      next: () => {
        this.assignDeleteChannel(0);
        // Re-get the group to update the channel list
        this.getGroup();
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
        this.isLoading = false;
      },
    });
  }

  async getChannelNames() {
    // Get a list of all channels for the group
    const channels = this.channelService.getChannelNameFromId(
      0,
      this.group.channels
    );

    await Promise.all([channels]).then((values) => {
      this.channelNames = values[0] as string[];
    });

    return this.channelNames;
  }

  async onlyViewableChannels() {
    // Using the array of channel IDs, use the isUserInChannel function to determine if the user is in the channel
    // If the user is in the channel, do nothing. If they aren't in the channel, remove the channel from the array
    const viewableChannels = [] as number[];

    for (const channelID of this.group.channels) {
      const isUserInChannel = await firstValueFrom(
        this.channelService.isUserInChannel(
          channelID,
          sessionStorage.getItem("username") ?? ""
        )
      );

      if (isUserInChannel) {
        viewableChannels.push(channelID);
      }
    }
    this.group.channels = viewableChannels;
  }

  async getUsers(all = false) {
    // Reset the arrays
    this.usersToAdd = [];
    this.usersToRemove = [];

    // Check if the users array needs to be updated with all users
    if (all) {
      this.users = await firstValueFrom(this.userService.getUsers());
    }

    // Determine which users are not in the group, and which ones are
    for (const user of this.users) {
      if (user.username !== sessionStorage.getItem("username")) {
        if (this.group.users.includes(user.username)) {
          this.usersToRemove.push(user.username);
        } else {
          this.usersToAdd.push(user.username);
        }
      }
    }
  }

  addUser() {
    this.isLoading = true;
    // Add the user to the group
    this.groupService
      .addUserToGroup(this.groupId ?? 0, this.addUserForm.value.username)
      .subscribe({
        next: () => {
          // Re-get the group to update the user list
          this.getGroup();
          this.getUsers();
          this.addUserForm.reset();
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

  removeUser() {
    this.isLoading = true;
    // Remove the user from the group
    this.groupService
      .removeUserFromGroup(
        this.groupId ?? 0,
        this.removeUserForm.value.username
      )
      .subscribe({
        next: () => {
          // Re-get the group to update the user list
          this.getGroup();
          this.getUsers();
          this.removeUserForm.reset();
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

  getGroup() {
    this.isLoading = true;
    // Get the user's profile
    if (this.groupId) {
      this.groupService.getGroup(this.groupId).subscribe({
        next: (value) => {
          // Set the user object to the received user
          this.group = value;

          this.getUsers(true);

          this.onlyViewableChannels();
          this.getChannelNames();
          this.setAdmin();
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
    } else {
      this.error = new Error("No group provided");
    }
  }

  deleteGroup() {
    this.isLoading = true;
    // Delete the group
    this.groupService.deleteGroup(this.groupId ?? 0).subscribe({
      next: () => {
        // Redirect to the group list
        this.router.navigate(["/groups"]);
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
        this.authService.refreshToken();
      },
    });
  }

  setAdmin() {
    // Determine if the logged in user is an admin of the group
    if (this.group.admins.includes(sessionStorage.getItem("username") ?? "")) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
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

    // Get the group's profile
    this.getGroup();
  }
}
