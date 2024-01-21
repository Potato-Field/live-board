import { FC, useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
//-----------CRDT---------------------
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
//import { WebsocketProvider } from "y-websocket";

interface LineData {
  tool: string;
  points: number[];
}

const App: FC = () => {
  
  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */

  const [lines, setLines] = useState<LineData[]>([]);
  const [tool, setTool] = useState<string>('pen');
  const stageRef = useRef(null);
  const isDrawing = useRef(false);

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  const yLinesRef = useRef<Y.Array<LineData>>(yDocRef.current.getArray<LineData>('lines'));

  useEffect(() => {
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
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    yLinesRef.current.push([{ tool, points: [pos.x, pos.y] }]);
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
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
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
      </Stage>
      {/* 임시 스타일 */}
      <div style={{position: "absolute", bottom: "2%", left: "25%" }}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button onClick={()=>{setTool("do")}}>do</Button>
            <Button onClick={()=>{setTool("undo")}}>undo</Button>
            <Button onClick={()=>{setTool("text")}}>text</Button>
            <Button onClick={()=>{setTool("pen")}}>pen</Button>
            <Button onClick={()=>{setTool("highlighter")}}>highlighter</Button>
            <Button onClick={()=>{setTool("eraser")}}>eraser</Button>
            <Button onClick={()=>{setTool("postit")}}>postit</Button>
            <Button onClick={()=>{setTool("shape")}}>shape</Button>
            <Button onClick={()=>{setTool("stamp")}}>stamp</Button>
            <Button onClick={()=>{setTool("mindmap")}}>mindmap</Button>
            <Button onClick={()=>{setTool("color")}}>color</Button>
          </ButtonGroup>
      </div>
    </div>
  );
}

export default App;