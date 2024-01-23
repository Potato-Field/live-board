// ColorContext.tsx
import { 
    createContext
    , useContext
    , useState
    , ReactNode 
} from 'react';

interface ColorContextType {
  currentColor: string;
  setCurrentColor: React.Dispatch<React.SetStateAction<string>>;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
};

interface ColorProviderProps {
  children: ReactNode;
}

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const [currentColor, setCurrentColor] = useState<string>('#000000');

  return (
    <ColorContext.Provider value={{ currentColor, setCurrentColor }}>
      {children}
    </ColorContext.Provider>
  );
};
