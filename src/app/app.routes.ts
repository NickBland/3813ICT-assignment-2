import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";
import { groupAuthGuard } from "./group-auth.guard";
import { channelAuthGuard } from "./channel-auth.guard";
import { UnknownPageComponent } from "./unknown-page/unknown-page.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { AccountDetailsComponent } from "./account-details/account-details.component";
import { UserListComponent } from "./user-list/user-list.component";
import { GroupListComponent } from "./group-list/group-list.component";
import { GroupProfileComponent } from "./group-profile/group-profile.component";
import { ChannelComponent } from "./channel/channel.component";

export const routes: Routes = [
  { path: "unknown", component: UnknownPageComponent },
  { path: "login", component: LoginComponent },
  { path: "profile", component: ProfileComponent, canActivate: [authGuard] },
  { path: "users", component: UserListComponent, canActivate: [authGuard] },
  {
    path: "profile/:username",
    component: AccountDetailsComponent,
    canActivate: [authGuard],
  },
  { path: "groups", component: GroupListComponent, canActivate: [authGuard] },
  {
    path: "group/:id",
    component: GroupProfileComponent,
    canActivate: [authGuard, groupAuthGuard], // Require the user to be a member of the group and be logged in
  },
  {
    path: "group/:id/:channelId",
    component: ChannelComponent,
    canActivate: [authGuard, groupAuthGuard, channelAuthGuard], // Require the user to be a member of the group and channel, and be logged in
  },
  { path: "", redirectTo: "/login", pathMatch: "full" }, // Redirect to the login page if no route is provided
  { path: "**", redirectTo: "/unknown" }, // Redirect to a 404 page if the route doesn't exist
];
