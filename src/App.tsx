import { 
  FC
  , useState
  , useRef
  , useEffect 
} from 'react';
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
import Konva from 'konva';
import { uuidv4 } from 'lib0/random.js';


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

  const { tool } = useTool();
  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const [dataLoaded, setDataLoaded] = useState(false);

  const stageRef = useRef(null);
  const isDrawing = useRef(false);
  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  //const yLinesRef = useRef<Y.Array<Konva.Line>>(yDocRef.current.getArray<Konva.Line>('lines'));
  const yPens = yDocRef.current.getMap('pens');

  const yLines = yDocRef.current.getMap('yLines');



  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1234'] });
    const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1239'] });
    
    

    // Y.js 배열을 캔버스에 선으로 그리기
    // yLinesRef.current.observe(() => {
    //   setLines(yLinesRef.current.toArray());
    // });
    yPens.observe(event => {
      yPens.forEach((dataSet:any, index:string)=>{
        const node = stageRef.current.children[0].findOne("#"+index)
        if(dataSet.type === 'update' && node != null){
          var newPoints = node.points().concat(dataSet.point);
          node.points(newPoints);
          
        } else if(dataSet.type === 'insert' && node == null){
          const newLine = new Konva.Line({
            id : index,
            points: dataSet.point,
            stroke: 'black',
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
          });
          stageRef.current.getLayers()[0].add(newLine);
        } 
        yPens.delete(index);
      });  
    })
    
    
    // 초기화 함수 정의
    const initializeCanvas = () => {
      yLines.forEach((lineData:any, idx:string) => {
        if(lineData == null) return;
        const newLine =  new Konva.Line({
          id : idx,
          points: lineData.points,
          stroke: lineData.stroke,
          strokeWidth: lineData.strokeWidth,
          lineCap: lineData.lineCap,
          lineJoin: lineData.lineJoin,
        })
        
        stageRef.current.getLayers()[0].add(newLine);
      });
      stageRef.current.getLayers()[0].draw();
    };
    
    const checkDataLoaded = () => {
      // yLines의 크기가 0보다 크면 데이터가 로드된 것으로 간주
      if (yLines.size > 0 && !dataLoaded) {
        initializeCanvas();
        setDataLoaded(true); // 데이터 로드 완료 상태로 설정
      }
    };
  
    yLines.observe(checkDataLoaded);

    checkDataLoaded();

    // 사용자가 처음 접속했을 때 선을 그리는 초기화 함수 호출


    return () => {
      //yLinesRef.current.unobserveDeep(updateLayer);
      provider.destroy();
      yDocRef.current.destroy();
      yLines.unobserve(checkDataLoaded);
    };
  }, []);

  /* 
    마우스 클릭 시 동작
  */
  
  let newLine : Konva.Line | null = null;
  let id = uuidv4();
  let penData : {} | null = null;

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition();
    const layers = stage.getLayers();
    const layer = layers[0];
    

    if (tool === Tools.TEXT) {
      //텍스트 이벤트
      
    } else if (tool === Tools.PEN) {


      const idx:string = "lineIdx_"+(id).toString()
      //펜 이벤트
      isDrawing.current = true;
      newLine = new Konva.Line({
        id : idx,
        points: [pos.x, pos.y],
        stroke: 'black',
        strokeWidth: 5,
        lineCap: 'round',
        lineJoin: 'round',
      });
      layer.add(newLine);

      
      const changeInfo = {
        type: "insert",
        point: [pos.x, pos.y]
      };
      yPens.set(idx, changeInfo);
      //yLinesRef.current.push([newLine]);
      
    } else if (tool === Tools.HIGHLIGHTER) {
      //형광펜 이벤트
      isDrawing.current = true;

      newLine = new Konva.Line({
        points      : [pos.x, pos.y],
        stroke      : 'black',
        strokeWidth : 15,
        tension     : 0.5,
        lineCap     : "butt",
        lineJoin    : "round",
        opacity     : 0.4
      });
      layer.add(newLine);

    } else if (tool === Tools.SHAPE) {
      //도형 이벤트
    } 
      
  };

  const handleMouseMove = (e: any) => {
    if (tool === Tools.PEN ||tool === Tools.HIGHLIGHTER ) {
      if (!isDrawing.current || newLine == null) {
        return;
      }
      //e.evt.preventDefault();

      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();

      var newPoints = newLine.points().concat([pos.x, pos.y]);
      newLine.points(newPoints);
      
      const idx = "lineIdx_"+(id).toString()
      /*
      penData = { 
        id : idx
        , points: newLine.points()
        , tool: Tools.PEN 
      };
      yPens.set(idx, penData);
      */
      const changeInfo = {
        type: "update",
        point: [pos.x, pos.y]
      };
      yPens.set(idx, changeInfo);

      //yLinesRef.current.delete(yLinesRef.current.length - 1, 1);
      

    } else if (tool === Tools.SHAPE) {

    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    const idx = "lineIdx_"+(id).toString()
    if(newLine == null) return;
    const konvaData = {
      id : idx,
      points: newLine.points(),
      stroke: newLine.stroke(),
      strokeWidth: newLine.strokeWidth(),
      lineCap: newLine.lineCap(),
      lineJoin: newLine.lineJoin(),
    }
    yLines.set(idx, konvaData)
    newLine = null;
    id = uuidv4();
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
        <Layer></Layer>

      </Stage>
      <ColorProvider>
        <ButtonCustomGroup />
      </ColorProvider>
    </div>
  );
}

export default App;