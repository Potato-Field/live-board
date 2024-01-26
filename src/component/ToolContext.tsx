import { 
    createContext
    , useContext
    , useState
    , ReactNode 
} from 'react';
import { Tools } from './Tools';

interface ToolContextType {
  tool: Tools;
  setTool: (tool: Tools) => void;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const useTool = () => {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
};

interface ToolProviderProps {
  children: ReactNode;
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [tool, setTool] = useState<Tools>(Tools.PEN);

  return (
    <ToolContext.Provider value={{ tool, setTool }}>
      {/* 자식 컴포넌트에서 tool, setTool 이용 가능 */}
      {children}  
    </ToolContext.Provider>
  );
};