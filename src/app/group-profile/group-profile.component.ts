import { Component, OnInit } from "@angular/core";
import { GroupService } from "../group.service";
import { ChannelService } from "../channel.service";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Group } from "../group";
import { ErrorComponent } from "../error/error.component";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Modal } from "bootstrap";

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

  constructor(
    private groupService: GroupService,
    private channelService: ChannelService,
    private route: ActivatedRoute
  ) {
    // Initialise the channel form, with one form control: channelName
    this.channelForm = new FormGroup({
      channelName: new FormControl("", [Validators.required]),
      channelDescription: new FormControl("", [Validators.required]),
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
          const channelModal = new Modal("#channelModal");
          channelModal.hide();
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

  getGroup() {
    // Get the user's profile
    if (this.groupId) {
      this.groupService.getGroup(this.groupId).subscribe({
        next: (value) => {
          // Set the user object to the received user
          this.group = value;
          this.getChannelNames();
          this.setAdmin();
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
