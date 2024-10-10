import { Component, OnDestroy, OnInit } from "@angular/core";
import { MessageService } from "../message.service";
import { Message } from "../message";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [],
  templateUrl: "./message-list.component.html",
  styleUrl: "./message-list.component.scss",
})
export class MessageListComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  onlineUsers: string[] = [];

  messageEvents!: Subscription;
  userEvents!: Subscription;

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initIoConnection();
  }

  ngOnDestroy() {
    if (this.messageEvents) {
      this.messageEvents.unsubscribe();
    }
    if (this.userEvents) {
      this.userEvents.unsubscribe();
    }
  }

  private initIoConnection() {
    this.messageService.initSocket();

    this.messageEvents = this.messageService
      .getMessages()
      .subscribe((message: Message) => {
        this.messages.push(message);
        console.log(message);
      });

    this.userEvents = this.messageService
      .getOnlineUsers()
      .subscribe((users: string[]) => {
        this.onlineUsers = users;
        // console.log(users);
      });

    // Now join the chat room! Grab the username from the session storage, channel from the URL params
    const username = sessionStorage.getItem("username");
    const channelID = Number(this.route.snapshot.paramMap.get("channelId"));

    if (username && channelID) {
      this.messageService.joinChannel(username, channelID.toString());
    }
  }
}
