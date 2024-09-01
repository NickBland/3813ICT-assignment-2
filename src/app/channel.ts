export interface Channel {
  // Optional properties are used since the server will assign the ID and group automatically
  // These properties are not required when creating a new channel
  id?: number;
  name: string;
  description: string;
  group?: number;
  users?: string[];
  messages?: string[]; // This should be Message[], but that hasn't been defined at this stage
}
