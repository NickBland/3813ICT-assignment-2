import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ErrorComponent } from "../error/error.component";
import { MessageListComponent } from "../message-list/message-list.component";
import { MessageService } from "../message.service";
import { ChannelService } from "../channel.service";
import { Channel } from "../channel";
import { Group } from "../group";
import { GroupService } from "../group.service";
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Tooltip } from "bootstrap";

@Component({
  selector: "app-channel",
  standalone: true,
  imports: [
    ErrorComponent,
    MessageListComponent,
    RouterModule,
    ReactiveFormsModule,
  ],
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
  usersToAdd: string[] = [];
  usersToRemove: string[] = [];
  addUserForm: FormGroup;
  removeUserForm: FormGroup;

  onlineUsers: boolean[] = [];

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService,
    private groupService: GroupService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.addUserForm = new FormGroup({
      username: new FormControl(this.usersToAdd, [Validators.required]),
    });

    this.removeUserForm = new FormGroup({
      username: new FormControl(this.usersToRemove),
    });
  }

  getUsers() {
    // Reset the arrays
    this.usersToAdd = [];
    this.usersToRemove = [];

    // Get all users in the group, and remove the ones already in the channel
    this.group.users.forEach((user) => {
      // Don't add the logged in user to the list
      if (user !== sessionStorage.getItem("username")) {
        if (!this.channel.users?.includes(user)) {
          this.usersToAdd.push(user);
        } else {
          this.usersToRemove.push(user);
        }
      }
    });
  }

  getChannel() {
    this.channelService.getChannel(this.channelID).subscribe({
      next: (channel) => {
        this.channel = channel;
        this.getUsers();
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
    this.isLoading = true;
    const username = this.removeUserForm.get("username")?.value;
    this.channelService
      .removeUserFromChannel(this.channelID, username)
      .subscribe({
        next: () => {
          this.getChannel();
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

  addUser() {
    this.isLoading = true;
    const username = this.addUserForm.get("username")?.value;
    this.channelService.addUserToChannel(this.channelID, username).subscribe({
      next: () => {
        this.getChannel();
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

    this.messageService.onlineUsers$.subscribe((users: string[]) => {
      // Set the user's online to be true if they are in the subscribed list
      if (this.channel.users) {
        this.onlineUsers = new Array(this.channel.users.length).fill(false);

        const uniqueUsers: string[] = [];

        this.onlineUsers.forEach((onlineUser, index) => {
          if (
            this.channel.users!.includes(users[index]) &&
            !uniqueUsers.includes(users[index])
          ) {
            this.onlineUsers[index] = true;
            uniqueUsers.push(users[index]);
          }
        });

        // ACTIVATE TOOLTIPS
        this.cdr.detectChanges(); // Trigger DOM update before initializing tooltips

        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]'
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const tooltipList = [...tooltipTriggerList].map(
          (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl)
        );
      }
    });
  }
}
