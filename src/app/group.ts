export interface Group {
  _id?: string;
  id: number;
  name: string;
  description: string;
  users: string[];
  admins: string[];
  channels: number[];
}
