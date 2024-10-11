import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from "@angular/core";
import { MessageService } from "../message.service";
import { Message } from "../message";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { FormGroup, FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-message-list",
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: "./message-list.component.html",
  styleUrl: "./message-list.component.scss",
})
export class MessageListComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  messages: Message[] = [];
  onlineUsers: string[] = [];

  messageForm: FormGroup;
  channelID: number;

  messageEvents!: Subscription;
  userEvents!: Subscription;

  @ViewChild("scrollContainer") private scrollContainer!: ElementRef;

  constructor(
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.messageForm = new FormGroup({
      contents: new FormControl(""),
    });
    this.channelID = Number(this.route.snapshot.paramMap.get("channelId"));
  }

  ngOnInit() {
    this.initIoConnection();

    // Populate the messages array with the messages from the API. Future messages will be pushed to this array
    const channelID = Number(this.route.snapshot.paramMap.get("channelId"));
    this.messageService.getChannelMessages(channelID).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.scrollToBottom();
      },
    });
  }

  ngOnDestroy() {
    if (this.messageEvents) {
      this.messageEvents.unsubscribe();
    }
    if (this.userEvents) {
      this.userEvents.unsubscribe();
    }

    this.messageService.leaveChannel();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
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

    if (username && this.channelID) {
      this.messageService.joinChannel(username, this.channelID.toString());
    }
  }

  shouldShowSender(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentSender = this.messages[index].sender;
    const previousSender = this.messages[index - 1].sender;

    return currentSender !== previousSender;
  }

  sendMessage() {
    if (
      !this.messageForm.value.contents ||
      this.messageForm.value.contents.trim() === ""
    ) {
      // Don't send empty messages, and also clear the form just in case
      this.messageForm.reset();
      return;
    }

    // Create a new Message!
    const message: Message = {
      sender: sessionStorage.getItem("username") ?? "",
      contents: this.messageForm.value.contents,
      file: false,
      channel: this.channelID,
    };

    console.log(message);
    this.messageService.sendMessage(message);

    // Clear the form
    this.messageForm.reset();
  }
}
