export type Value = {
  value: string;
};

export type Binding = {
  名前: Value;
  名前ルビ?: Value;
  ブランド?: Value;
  性別?: Value;
  年齢?: Value;
  学年?: Value;
  身長?: Value;
  体重?: Value;
  BWH?: Value;
  誕生日?: Value;
  星座?: Value;
  血液型?: Value;
  利き手?: Value;
  出身地?: Value;
  趣味?: Value;
  好きな物?: Value;
  特技?: Value;
  紹介文?: Value;
  CV?: Value;
  カラー?: Value;
  URL?: Value;
};

export type BindingKey = keyof Binding;

export type ImasparqlResponse = {
  results: {
    bindings: Binding[];
  };
};
