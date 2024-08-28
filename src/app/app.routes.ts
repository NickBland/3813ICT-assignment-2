import { Routes } from "@angular/router";
import { authGuard } from "./auth.guard";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { AccountDetailsComponent } from "./account-details/account-details.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "profile", component: ProfileComponent, canActivate: [authGuard] },
  {
    path: "profile/:username",
    component: AccountDetailsComponent,
    canActivate: [authGuard],
  },
  { path: "**", redirectTo: "/login" }, // Redirect to the login page if an invalid path is provided
];
