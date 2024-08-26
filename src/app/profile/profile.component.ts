import { Component, WritableSignal } from "@angular/core";
import { User } from "../user";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
})
export class ProfileComponent {
  // Simple profile view, allowing the user to see their own profile
  // There should also be a pop up form to edit the user's profile
  // This form should have a cancel button and a save button

  // instantiate the user service here
  user$ = {} as WritableSignal<User>;
  
}
