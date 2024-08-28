import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { AccountDetailsComponent } from "./account-details/account-details.component";
import { UserListComponent } from "./user-list/user-list.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "profile", component: ProfileComponent, canActivate: [authGuard] },
  { path: "users", component: UserListComponent },
  {
    path: "profile/:username",
    component: AccountDetailsComponent,
    canActivate: [authGuard],
  },
  { path: "**", redirectTo: "/login" }, // Redirect to the login page if an invalid path is provided
];
