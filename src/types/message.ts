export type FlexMessage = {
  type: "flex";
  altText: string;
  contents: FlexBubble | FlexCarousel;
};

export type FlexBubble = {
  type: "bubble";
  body: any;
};

export type FlexCarousel = {
  type: "carousel";
  contents: any[];
};
