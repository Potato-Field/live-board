import { FC, useState, useRef, useEffect } from 'react';
import React from 'react';
//import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Text} from 'react-konva';
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
  isEditing?: boolean;
}

interface InputData {
  id: string;
  value: string;
}

const App: FC = () => {

  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */

  //input state 저장하는 부분
  const [inputDataArray, setInputDataArray] = useState<InputData[]>([]);

  const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
  const stageRef = useRef(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const isDrawing = useRef(false);
  // 텍스트 생성
  const [textInputs, setTextInputs] = useState<TextInputProps[]>([]);
  // 텍스트 수정

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  const yLinesRef = useRef<Y.Array<LineData>>(yDocRef.current.getArray<LineData>('lines'));

  //input ref로 저장하는 부분
  const inputDataRefs = useRef<Y.Array<InputData>>(yDocRef.current.getArray<InputData>('inputdata'));


  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current) //서버 확인용
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1234'] }); //서버 확인용
    const provider = new WebrtcProvider('drawing-room', yDocRef.current);

    // Y.js 배열을 캔버스에 선으로 그리기
    yLinesRef.current.observe(() => {
      setLines(yLinesRef.current.toArray());
    });

    //inputarray 배열형태로 state에 저장하기 
    inputDataRefs.current.observe(() => {
      setInputDataArray(inputDataRefs.current.toArray());
    });

    return () => {
      provider.destroy();
      yDocRef.current.destroy();
    };
  }, []);

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();
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
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentColor(e.target.value);
  };

  const addInput = () => {
    const newId = `input - ${Date.now()}-${Math.random()}`
    const newInputData = {
      // id: `input - ${inputDataArray.length}`,
      id: newId,
      value: ''
    };
    setInputDataArray([...inputDataArray, newInputData]);
    inputDataRefs.current.push([newInputData]);
  }

  const removeInput = (index: number) => {
    const filteredArray = inputDataArray.filter((_, i) => i !== index);
    setInputDataArray(inputDataArray.filter((_, i) => i !== index));
    inputDataRefs.current.delete(index, 1);
  }

const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
  const updatedValue = event.target.value;

  const updatedTextInputs = [...textInputs];
  updatedTextInputs[index].init = updatedValue;

  setTextInputs(updatedTextInputs);

    const updatedInputDataArray = inputDataArray.map((inputData, i) => {
      if (i === index) {
        return { ...inputData, value: updatedValue };
      }
      return inputData;
    });
    setInputDataArray(updatedInputDataArray);
  }

  const handleTextInputDblClick = (index: number) => {
    yDocRef.current.transact(() => {
      const currentTextItem = textInputs[index];
      if (currentTextItem) {
        const updatedTextItem = { ...currentTextItem, isEditing: true };
        textInputs.splice(index, 1, updatedTextItem);
      }
    });
  
    setTextInputs([...textInputs]); // 이 부분을 추가하여 상태 갱신을 유발합니다.
  };

  const handleTextInputBlur = (index: number) => {
    yDocRef.current.transact(() => {
      const currentTextItem = textInputs[index];
      if (currentTextItem) {
        const updatedTextItem = { ...currentTextItem, isEditing: false };
        textInputs.splice(index, 1, updatedTextItem);
      }
    });
  
    setTextInputs([...textInputs]); // 이 부분을 추가하여 상태 갱신을 유발합니다.
  };


  return (
    <div style={{ position: "relative", width: "100%" }}>
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
        </Layer>
        <Layer>
        {textInputs.map((textInput, i) => (
            <React.Fragment key={i}>
              {textInput.isEditing ? (
                <input
                  type="text"
                  value={textInput.init}
                  onChange={(e) => handleInputChange(i, e)}
                  onBlur={() => handleTextInputBlur(i)}
                  autoFocus
                />
              ) : (
                <Text
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
                  onDblClick={() => handleTextInputDblClick(i)}
                />
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>

      <div className="ToolBtnGroup" style={{ position: "absolute", bottom: "2%", left: "50%", transform: "translate(-50%, 0)" }}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button id='undo' onClick={() => { setTool("undo") }}>undo</Button>
          <Button id='do' onClick={() => { setTool("do") }}>do</Button>
          <Button id='text' onClick={() => { setTool("text") }}>text</Button>
          <Button id='pen' onClick={() => { setTool("pen") }}>pen</Button>
          <Button id='highlighter' onClick={() => { setTool("highlighter") }}>highlighter</Button>
          <Button id='eraser' onClick={() => { setTool("eraser") }}>eraser</Button>
          <Button id='postit' onClick={() => { setTool("postit") }}>postit</Button>
          <Button id='shape' onClick={() => { setTool("shape") }}>shape</Button>
          <Button id='stamp' onClick={() => { setTool("stamp") }}>stamp</Button>
          <Button id='mindmap' onClick={() => { setTool("mindmap") }}>mindmap</Button>
          <Button id='palatte'>
            <input type='color' value={currentColor} onChange={handleColorChange}></input>
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}

export default App;