import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated.value) {
    // Display an alert on the screen using bootstrap, and let it disappear after a few seconds
    alert("You must be logged in to view this page");
    router.navigate(["/login"]);
    return false;
  }

  return authService.isAuthenticated.value;
};
