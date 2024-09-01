import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Group } from "./group";
import { firstValueFrom, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GroupService {
  private apiURL = "http://localhost:8888";
  groups$ = signal<Group[]>([]);
  group$ = signal<Group>({} as Group);

  constructor(private httpClient: HttpClient) {}

  // Get all groups
  getGroups() {
    return this.httpClient.get<Group[]>(`${this.apiURL}/api/group/`);
  }

  // Get a group by id
  getGroup(id: number) {
    return this.httpClient.get<Group>(`${this.apiURL}/api/group/${id}`);
  }

  // Update a group
  updateGroup(id: number, group: Group): Observable<Group> {
    return this.httpClient.put<Group>(`${this.apiURL}/api/group/${id}`, group);
  }

  // Create a group
  createGroup(group: Group): Observable<Group> {
    return this.httpClient.post<Group>(`${this.apiURL}/api/group/`, group);
  }

  // Delete a group
  deleteGroup(id: number): Observable<Group> {
    return this.httpClient.delete<Group>(`${this.apiURL}/api/group/${id}`);
  }

  // Add a user to a group
  addUserToGroup(groupId: number, username: string): Observable<Group> {
    return this.httpClient.post<Group>(
      `${this.apiURL}/api/group/${groupId}/add_user/${username}`,
      {}
    );
  }

  // Remove a user from a group
  removeUserFromGroup(groupId: number, username: string): Observable<Group> {
    return this.httpClient.post<Group>(
      `${this.apiURL}/api/group/${groupId}/remove_user/${username}`,
      {}
    );
  }

  // Group Name -> ID
  async getGroupIdFromName(groupName = "", groupNames: string[] = []) {
    const groups = await firstValueFrom(this.getGroups());

    // Check if the groupNames array is NOT empty
    if (groupNames.length > 0) {
      const groupIds: number[] = [];
      for (const group of groups) {
        if (groupNames.includes(group.name)) {
          groupIds.push(group.id);
        }
      }
      return groupIds;
    } else {
      for (const group of groups) {
        if (group.name === groupName) {
          return group.id;
        }
      }
    }
    return 0;
  }

  // Group ID -> Name
  async getGroupNameFromId(groupId = 0, groupIDs: number[] = []) {
    const groups = await firstValueFrom(this.getGroups());

    // Check if the groupIDs array is NOT empty
    if (groupIDs.length > 0) {
      const groupNames: string[] = [];
      for (const group of groups) {
        if (groupIDs.includes(group.id)) {
          groupNames.push(group.name);
        }
      }
      return groupNames;
    } else {
      for (const group of groups) {
        if (group.id === groupId) {
          return group.name;
        }
      }
    }
    return "";
  }
}
