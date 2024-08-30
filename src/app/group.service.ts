import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Group } from "./group";
import { Observable } from "rxjs";

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
}
