export interface Group {
  id: number;
  name: string;
  description: string;
  users: string[];
  admins: string[];
  channels: number[];
}
