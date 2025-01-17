import { Injectable } from "@angular/core";

import { DefaultEventsMap } from "@socket.io/component-emitter";
import { BehaviorSubject, Observable } from "rxjs";
import { io, Socket } from "socket.io-client";
import { Message } from "./message";
import { HttpClient } from "@angular/common/http";

const SERVER_URL = "http://localhost:8888";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private socket!: Socket<DefaultEventsMap, DefaultEventsMap>;
  private apiURL = "http://localhost:8888";

  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSubject.asObservable();

  constructor(private httpClient: HttpClient) {}

  initSocket(): void {
    this.socket = io(SERVER_URL);
    this.socket.on("disconnect", () => {
      this.socket.disconnect();
    });
  }

  joinChannel(username: string, channel: string): void {
    this.socket.emit("joinchannel", username, channel);
  }

  leaveChannel(): void {
    this.socket.emit("leavechannel");
  }

  sendMessage(contents: Message): void {
    this.socket.emit("message", { contents });
  }

  getMessages(): Observable<Message> {
    return new Observable((observer) => {
      this.socket.on("message", (message: Message) => {
        observer.next(message);
      });
    });
  }

  getChannelMessages(channelID: number) {
    return this.httpClient.get<Message[]>(
      `${this.apiURL}/api/messages/${channelID}`
    );
  }

  getOnlineUsers(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on("online users", (users: { username: string }[]) => {
        this.onlineUsersSubject.next(users.map((user) => user.username));
      });
      this.socket.on("online users", (users: string[]) => {
        observer.next(users);
      });
    });
  }
}
