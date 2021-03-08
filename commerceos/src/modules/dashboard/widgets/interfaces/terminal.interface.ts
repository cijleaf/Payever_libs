export interface TerminalInterface {
  active: boolean;
  channelSet: string;
  logo: string;
  name: string;
  _id: string;
}

export interface ChannelSetInterface {
  checkout: string;
  id: string;
  type: string;
}
