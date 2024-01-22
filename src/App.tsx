import { FC, useState, useRef, useEffect } from 'react';
//import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Text } from 'react-konva';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
// import IconButton from '@mui/material/IconButton';
// import CircleIcon from '@mui/icons-material/Circle';
// import { Icon } from '@mui/material';
import "./index.css"

//-----------CRDT---------------------
import * as Y from "yjs";
//import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";

interface LineData {
  tool: string;
  points: number[];
}
interface TextInputProps {
  init: string;
  x?: number;
  y?: number;
}
const App: FC = () => {

  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
  const stageRef = useRef(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const isDrawing = useRef(false);
  const [textInputs, setTextInputs] = useState<TextInputProps[]>([]);

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  const yLinesRef = useRef<Y.Array<LineData>>(yDocRef.current.getArray<LineData>('lines'));


  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    const provider = new WebrtcProvider('drawing-room', yDocRef.current);

    // Y.js 배열을 캔버스에 선으로 그리기
    yLinesRef.current.observe(() => {
      setLines(yLinesRef.current.toArray());
    });

    return () => {
      provider.destroy();
      yDocRef.current.destroy();
    };
  }, []);

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
    console.log(tool)
    if (tool === 'text') {
      const newTextInput = { init: 'Click to Text', x: pos.x, y: pos.y };
      setTextInputs([...textInputs, newTextInput]);
      const newTextIndex = textInputs.length;
      setTool(`text-${newTextIndex}`);
    } else if (tool === 'pen') {
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
/*
  const handleTextInputChange = (index: number, newText: string) => {
    const updatedTextInputs = [...textInputs];
    updatedTextInputs[index].init = newText;
    setTextInputs(updatedTextInputs);
  }
*/
  //console.log(setTool);
  // 색상 변경 - 팔레트
  const handleColorChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
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
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
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
        <Layer></Layer>
      </Stage>

      <div className = "ToolBtnGroup" style={{position: "absolute", bottom: "2%", left: "50%", transform: "translate(-50%, 0)"}}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button id='undo' onClick={()=>{setTool("undo")}}>undo</Button>
          <Button id='do' onClick={()=>{setTool("do")}}>do</Button>
          <Button id='text' onClick={()=>{setTool("text")}}>text</Button>
          <Button id='pen' onClick={()=>{setTool("pen")}}>pen</Button>
          <Button id='highlighter' onClick={()=>{setTool("highlighter")}}>highlighter</Button>
          <Button id='eraser' onClick={()=>{setTool("eraser")}}>eraser</Button>
          <Button id='postit' onClick={()=>{setTool("postit")}}>postit</Button>
          <Button id='shape' onClick={()=>{setTool("shape")}}>shape</Button>
          <Button id='stamp' onClick={()=>{setTool("stamp")}}>stamp</Button>
          <Button id='mindmap' onClick={()=>{setTool("mindmap")}}>mindmap</Button>
          <Button id='palatte'>
            <input type='color' value={currentColor} onChange={handleColorChange}></input>
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default App;