export type Config = {
  channelAccessToken: string;
  channelSecret: string;
};

export type WebhookRequestBody = {
  events: WebhookEvent[];
};

export type WebhookEvent = MessageEvent | PostbackEvent;

type eventBase = {
  replyToken: string;
};

export type MessageEvent = {
  type: "message";
  message: {
    type: "text";
    text: string;
  };
} & eventBase;

export type PostbackEvent = {
  type: "postback";
  postback: {
    params: {
      date: string;
    };
  };
} & eventBase;
