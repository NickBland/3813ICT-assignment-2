import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { GroupService } from "./group.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const groupAuthGuard: CanActivateFn = async (route, state) => {
  const groupService = inject(GroupService);
  // Check if the user is a member of the group before allowing access

  // Get the group id from the route
  const groupId = Number(route.params["id"]);

  // Get the user's groups from the auth token
  let token = sessionStorage.getItem("authToken");
  if (token) {
    token = token.split(".")[1]; // Get the payload from the JWT token (Ignore the header and signature)
    token = atob(token); // Decode Base64
  } else {
    return false;
  }
  const userGroups = JSON.parse(token as string).user.groups;

  // Turn the group names from the user in to group IDs
  const roleIDs = groupService.getGroupIdFromName("", userGroups);

  // Check if the user is a member of the group
  const resolvedRoleIDs = await Promise.all([roleIDs]);

  // Ensure resolvedRoleIDs is an array and contains the expected values
  if (
    Array.isArray(resolvedRoleIDs[0]) &&
    resolvedRoleIDs[0].includes(groupId)
  ) {
    return true;
  }

  return false;
};
