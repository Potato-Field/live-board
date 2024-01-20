import React, { FC, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Line, Text } from 'react-konva';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

interface LineData {
  tool: string;
  points: number[];
}

const App: FC = () => {
  const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef<boolean>(false);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };
  
  const handleMouseMove = (e: any) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
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
      >
        <Layer>
          {/* <Text text="네비바 만들 공간" x={5} y={30} /> */}
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
  );
}

export default App;