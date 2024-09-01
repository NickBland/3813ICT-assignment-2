import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Channel } from "./channel";
import { firstValueFrom } from "rxjs";

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

  // Create a channel for a group
  createChannel(groupID: number, channel: Channel) {
    return this.httpClient.post<Channel>(
      `${this.apiURL}/api/channel/${groupID}`,
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

  // Add a user to a channel
  addUserToChannel(channelId: number, username: string) {
    return this.httpClient.post<Channel>(
      `${this.apiURL}/api/channel/${channelId}/${username}`,
      {}
    );
  }

  // Remove a user from a channel
  removeUserFromChannel(channelId: number, username: string) {
    return this.httpClient.delete<Channel>(
      `${this.apiURL}/api/channel/${channelId}/${username}`,
      {}
    );
  }

  // Get whether a user is in a channel
  isUserInChannel(channelId: number, username: string) {
    return this.httpClient.get<boolean>(
      `${this.apiURL}/api/channel/${channelId}/${username}`
    );
  }

  // Channel Name -> ID
  async getChannelIdFromName(channelName = "", channelNames: string[] = []) {
    const channels = await firstValueFrom(this.getChannels(0));
    if (channelNames.length > 0) {
      const channelIds: number[] = [];
      for (const channel of channels) {
        if (channelNames.includes(channel.name)) {
          channelIds.push(channel.id as number);
        }
      }
      return channelIds;
    } else {
      for (const channel of channels) {
        if (channel.name === channelName) {
          return channel.id;
        }
      }
    }
    return -1;
  }

  // Channel ID -> Name
  async getChannelNameFromId(channelId = 0, channelIDs: number[] = []) {
    const channels = await firstValueFrom(this.getChannels(0));
    if (channelIDs.length > 0) {
      const channelNames: string[] = [];
      for (const channel of channels) {
        if (channelIDs.includes(channel.id as number)) {
          channelNames.push(channel.name);
        }
      }
      return channelNames;
    } else {
      for (const channel of channels) {
        if (channel.id === channelId) {
          return channel.name;
        }
      }
    }
    return "";
  }
}
