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
import TextEditor, {TextInputProps} from './component/TextEditor';
import { FastLayer } from 'konva/lib/FastLayer';


interface BaseData {
  name? : string
  tool : Tools
}

interface LineData extends BaseData {
  points: number[];
}
// interface TextInputProps {
//   init: string;
//   x?: number;
//   y?: number;
// }

interface InputData{
  id: string;
  value: string;
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

  //const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
 // const [textInputs, setTextInputs] = useState<TextData[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#000000');

//text 상태 저장
  const [textInputs, setTextInputs] = useState<TextInputProps[]>([]);
  
  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  const yLinesRef = useRef<Y.Array<LineData>>(yDocRef.current.getArray<LineData>('lines'));

 const yTextRef = useRef<Y.Array<TextInputProps>>(yDocRef.current.getArray<TextInputProps>('texts'));

  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    const provider = new WebrtcProvider('drawing-room', yDocRef.current);

    // Y.js 배열을 캔버스에 선으로 그리기
    yLinesRef.current.observe(() => {
      setLines(yLinesRef.current.toArray());
    });
    yTextRef.current.observe(() => {
      setTextInputs(yTextRef.current.toArray());
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
    console.log(tool) //
    if (tool === Tools.TEXT) {        //이 부분 수정해야 됨 !!!
      const newText: TextInputProps = { init: 'New Text', x: pos.x, y: pos.y, isEditing: false };
      setTextInputs(prev => [...prev, newText]);
      yTextRef.current.push([newText]);
      // console.log("text");

      // setTextInputs(prev => [...prev, { init: 'New Text', x: pos.x, y: pos.y, isEditing: false }]);
      // console.log(textInputs);
      // //// 텍스트 생성시 텍스트 길이 따라 객체 박스 계산하려고 length  계산
      // //const newTextIndex = textInputs.length;
      // //setTool(`text-${newTextIndex}`);
      console.log(textInputs);
       setTool(Tools.PEN);                     //추가 수정해야 됨
    } else if (tool === Tools.PEN) {
      console.log("not text");
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
        <TextEditor textInputs={textInputs} setTextInputs={setTextInputs} yTextRef={yTextRef} />
      </Layer>
      </Stage>
      <ColorProvider>
        <ButtonCustomGroup />
      </ColorProvider>
    </div>
  );
}

export default App;
