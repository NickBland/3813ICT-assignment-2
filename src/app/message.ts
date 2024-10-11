export interface Message {
  sender: string;
  file: boolean;
  contents: string;
  timestamp?: Date;
  channel: number;
  id?: number;
  _id?: string;
}
