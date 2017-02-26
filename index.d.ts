type IIntialState<S> = {
  initial: S;
};

export type IReducer<A> = {
  actionCreators: {
    [P in keyof A]: A[P];
  };
  actionTypes: {
    [P in keyof A]: P;
  }
};

type IReduce<S> = (state: S, payload?: any) => S;

export type IState = {
  <A, S>(name: string, config: {[P in keyof A]: IReduce<S>} & IIntialState<S>): IReducer<A>;
};


export const State: IState;

