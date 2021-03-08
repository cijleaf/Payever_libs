import { ChannelSetInterface } from "./terminal.interface";

export interface ShopInterface {
  isDefault: boolean;
  channelSet: ChannelSetInterface;
  picture: string;
  name: string;
  _id: string;
  id: string;
}

export interface DomainInterface {
  name: string;
}
