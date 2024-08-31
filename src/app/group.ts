export interface Group {
  id: number;
  name: string;
  description: string;
  users: string[];
  admins: string[];
  // channels: channel[];
  channels: string[]; // NOT YET IMPLEMENTED, JUST A PLACEHOLDER FOR NOW
}
