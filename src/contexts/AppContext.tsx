import {
  createContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import { appReducer, defaultAppState } from "./appReducer";

type AppContextValue = {
  appState: typeof defaultAppState;
  setAppState: Dispatch<any>;
};

export const AppContext = createContext<AppContextValue>({
  appState: defaultAppState,
  setAppState: () => {},
});

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useReducer(appReducer, defaultAppState);

  return (
    <AppContext.Provider
      value={{
        appState,
        setAppState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
