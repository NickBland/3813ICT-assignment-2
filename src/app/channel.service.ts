import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Channel } from "./channel";

@Injectable({
  providedIn: "root",
})
export class ChannelService {
  private apiURL = "http://localhost:8888";
  constructor(private httpClient: HttpClient) {}

  // Get all channels for a group
  getChannels(groupId: number) {
    return this.httpClient.get<Channel[]>(
      `${this.apiURL}/api/channels/${groupId}`
    );
  }

  // Get a channel by id
  getChannel(channelId: number) {
    return this.httpClient.get<Channel>(
      `${this.apiURL}/api/channel/${channelId}`
    );
  }

  // Create a channel
  createChannel(channel: Channel) {
    return this.httpClient.post<Channel>(
      `${this.apiURL}/api/channel/`,
      channel
    );
  }

  // Delete a channel
  deleteChannel(channelId: number) {
    return this.httpClient.delete<Channel>(
      `${this.apiURL}/api/channel/${channelId}`
    );
  }

  // Update a channel
  updateChannel(channelId: number, channel: Channel) {
    return this.httpClient.put<Channel>(
      `${this.apiURL}/api/channel/${channelId}`,
      channel
    );
  }
}
