import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { ChannelService } from "./channel.service";
import { firstValueFrom } from "rxjs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const channelAuthGuard: CanActivateFn = async (route, state) => {
  // Get the Channel ID from the URL params
  const channelId = Number(route.paramMap.get("channelId"));

  // Group auth is already handled by the groupAuthGuard, so we only need to check if the user is a member of the channel
  // Get the users available in channels from the channel service
  const channelService = inject(ChannelService);
  const inChannel = await firstValueFrom(
    channelService.isUserInChannel(
      channelId,
      sessionStorage.getItem("username") ?? ""
    )
  );

  return inChannel;
};
