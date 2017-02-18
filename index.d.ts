type IIntialState = {
  initial: any;
};

export type IReducer<S> = {
  actionCreators: {
    [P in keyof S]: S[P];
  };
  actionTypes: {
    [P in keyof S]: P;
  }
};

type a = (state: any, payload?: any) => void;
export type IState = {
  <S>(name: string, config: {[P in keyof S]: a} & IIntialState): IReducer<S>;
};


export const State: IState;

