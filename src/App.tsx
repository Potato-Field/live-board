import { 
  FC
  , useState
  , useRef
  , useEffect 
} from 'react';
//import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Text } from 'react-konva';
import { ButtonCustomGroup } from './component/ButtonCustomGroup';

import { useTool } from './component/ToolContext';
import { ColorProvider } from './component/ColorContext';

import { Tools } from './component/Tools';

import "./index.css"

//-----------CRDT---------------------
import * as Y from "yjs";
//import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";


interface BaseData {
  name? : string
  tool : Tools
}

interface LineData extends BaseData {
  points: number[];
}

interface TextData extends BaseData {
  init: string;
  x?: number;
  y?: number;
}

interface ShapeData extends BaseData {
  color : string
}

const App: FC = () => {
  //Container Components

  const { tool, setTool } = useTool();
  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const [lines, setLines] = useState<LineData[]>([]);
  const [textInputs, setTextInputs] = useState<TextData[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  
  const stageRef = useRef(null);
  const isDrawing = useRef(false);
  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  const yLinesRef = useRef<Y.Array<LineData>>(yDocRef.current.getArray<LineData>('lines'));


  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1234'] });
    const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1234'] });

    // Y.js 배열을 캔버스에 선으로 그리기
    yLinesRef.current.observe(() => {
      setLines(yLinesRef.current.toArray());
    });

    return () => {
      provider.destroy();
      yDocRef.current.destroy();
    };
  }, []);

  /* 
    마우스 클릭 시 동작
  */
  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();

    if (tool === Tools.TEXT) {
      
    } else if (tool === Tools.PEN) {
      isDrawing.current = true;
      yLinesRef.current.push([{ tool, points: [pos.x, pos.y] }]);
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = yLinesRef.current.get(yLinesRef.current.length - 1);
    const newPoints = lastLine ? [...lastLine.points, point.x, point.y] : [];
    // 마지막 라인 포인트를 업데이트
    yLinesRef.current.delete(yLinesRef.current.length - 1, 1);
    yLinesRef.current.push([{ tool, points: newPoints }]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div style={{position: "relative", width: "100%"}}>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {/* pen */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={currentColor}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                line.tool === Tools.ERASER ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
        
        {/* highlighter */}
        {/* <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={currentColor}
              strokeWidth={15}
              tension={0.5}
              lineCap="butt"
              lineJoin="round"
              opacity={0.4}
            />
          ))}
        </Layer> */}

        <Layer>
          {textInputs.map((textInput, i) => (
            <Text
            key={i}
            text={textInput.init}
            x={textInput.x}
            y={textInput.y}
            fill="#000000"
            fontSize={16}
            draggable
            onDragEnd={(e) => {
              const updatedTextInputs = [...textInputs];
              updatedTextInputs[i].x = e.target.x();
              updatedTextInputs[i].y = e.target.y();
              setTextInputs(updatedTextInputs);
            }}
            />
          ))}
        </Layer>
      </Stage>
      <ColorProvider>
        <ButtonCustomGroup />
      </ColorProvider>
    </div>
  );
}

export default App;