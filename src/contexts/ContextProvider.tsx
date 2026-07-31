import { createContext, useContext, useState, ReactNode } from 'react';

interface ClickedState {
  chat: boolean;
  cart: boolean;
  userProfile: boolean;
  notification: boolean;
  [key: string]: boolean;
}

interface StateContextValue {
  currentColor: string;
  currentMode: string;
  activeMenu: boolean;
  screenSize: number | undefined;
  setScreenSize: (size: number | undefined) => void;
  handleClick: (clicked: string) => void;
  isClicked: ClickedState;
  initialState: ClickedState;
  setIsClicked: (state: ClickedState) => void;
  setActiveMenu: (active: boolean) => void;
  setCurrentColor: (color: string) => void;
  setCurrentMode: (mode: string) => void;
  setMode: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setColor: (color: string) => void;
  themeSettings: boolean;
  setThemeSettings: (settings: boolean) => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const StateContext = createContext<StateContextValue | undefined>(undefined);

const initialState: ClickedState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [screenSize, setScreenSize] = useState<number | undefined>(undefined);
  const [currentColor, setCurrentColor] = useState('#03C9D7');
  const [currentMode, setCurrentMode] = useState('Light');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState<ClickedState>(initialState);

  // Add the state for the sidebar collapse/expand
  const [isCollapsed, setIsCollapsed] = useState(false);

  const setMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);
  };

  const setColor = (color: string) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);
  };

  const handleClick = (clicked: string) => setIsClicked({ ...initialState, [clicked]: true });

  // Function to toggle sidebar collapse/expand
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <StateContext.Provider value={{
      currentColor, currentMode, activeMenu, screenSize, setScreenSize, handleClick,
      isClicked, initialState, setIsClicked, setActiveMenu, setCurrentColor, setCurrentMode,
      setMode, setColor, themeSettings, setThemeSettings, isCollapsed, toggleSidebar,
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a ContextProvider');
  }
  return context;
};
