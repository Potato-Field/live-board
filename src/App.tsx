import { 
  FC
  , useState
  , useRef
  , useEffect, 
  useCallback
} from 'react';
import { useLocation} from 'react-router-dom';
import Konva from 'konva';
import { Stage, Layer } from 'react-konva';
import { ButtonCustomGroup } from './component/ButtonCustomGroup';

import { useTool } from './component/ToolContext';
import { useColor } from './component/ColorContext';

import { Tools } from './component/Tools';

import NavBarRoom from './component/NavBarRoom';

import thumbUpImg from './assets/thumbup.png';
import thumbDownImg from './assets/thumbdown.png'

import "./index.css"

//-----------CRDT---------------------
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { uuidv4 } from 'lib0/random.js';
import {TextInputProps} from './component/TextEditor';
import { Shape } from './component/UserShape';
// import MindMap, {undoManagerMindMap} from './component/MindMap';
import MindMap from './component/MindMap';

/* 블록 하는 좌표 */
let multiSelectBlocker = {
  x1:0,
  y1:0,
  x2:0,
  y2:0,
}

let groupTr:Konva.Transformer | null = null;

//Container Components
const App:FC = () => {

  const { tool, setTool } = useTool();
  const { currentColor } = useColor();
  const [clickedIconBtn, setClickedIconBtn] = useState<string | null>(null);
  
  const POSTIT_MIN_WIDTH = 250;  // init size
  const POSTIT_MIN_HEIGHT = 300; // init size

  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const [, setIsLoading] = useState(true);
  //const navigate = useNavigate();
  //text 상태 저장
  // const [textInputs, setTextInputs] = useState<TextData[]>([]);
  const [, setTextInputs] = useState<TextInputProps[]>([]);

  const stageRef = useRef<Konva.Stage>(null as any);
  const isDrawing = useRef(false);
  const isSelected = useRef(false);
  const isTrans = useRef(false);
  const isDrag = useRef(false);
  const isHand = useRef(false);

  const toolRef = useRef(tool);
  const currentColorRef = useRef<any>();

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  
  //Pen 동작 저장
  const yPens = yDocRef.current.getMap('pens');
  
  //Text 동작 저장
  const yText = yDocRef.current.getMap('text');
  
  //Shape 저장
  const yShape = yDocRef.current.getMap('shape');
  //Trans 동작 저장
  const yTrans = yDocRef.current.getMap('trans');
  //Drag move 동작 저장
  const yMove = yDocRef.current.getMap('move');
  
  //Pen 객체 전체 저장
  const yObjects = yDocRef.current.getMap('objects');

  //사용자 마우스 위치 저장
  const yMousePositions = yDocRef.current.getMap('mousePositions');
  
  // 선택 영역 데이터 구조 정의
  const ySelectedNodes = yDocRef.current.getMap('selectedNodes');

  // 객체 Lock 저장
  const yLockNodes = yDocRef.current.getMap('lockNodes');
  
  const yTextRef = useRef<Y.Array<TextInputProps>>(yDocRef.current.getArray<TextInputProps>('texts'));
  
  //const undoManagerObj = new Y.UndoManager([yObjects, yText, yPens, yShape, yTrans, yMove]);
 
  ////////version1
  //const undoManagerObj = new Y.UndoManager([yObjects]);
  
  // ///version2
  // let undoManagerObjRef = useRef<Y.UndoManager | null>(null);
  // if(!undoManagerObjRef)
  //   undoManagerObjRef = new Y.UndoManager([yObjects]);
  // const undoManagerObj = undoManagerObjRef.current;


  const undoManagerObjRef = useRef<Y.UndoManager | null>(null);
  const undoManagerObj = undoManagerObjRef.current;

  useEffect(() => {
    undoManagerObjRef.current = new Y.UndoManager([yObjects]);
  }, []);



  //블록 변수
  let selectionRectangle:Konva.Rect = new Konva.Rect();
  
  let newLine : Konva.Line | null = null;

  let id = uuidv4(); //객체 고유 ID
  
  const userId = useRef("");
  const setUserId = (param:string)=>{
    userId.current = param
  }

  function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // Red 값
    const g = Math.floor(Math.random() * 256); // Green 값
    const b = Math.floor(Math.random() * 256); // Blue 값

    const color = `rgb(${r}, ${g}, ${b})`;
    
    return color;
  }
  
  function updateMousePositionOnScreen(userId:string, mousePosition:any) {
    let mouseIcon = document.getElementById(`mouse-${userId}`);
    if (!mouseIcon) {
      mouseIcon = document.createElement('div');
      mouseIcon.id = `mouse-${userId}`;
      // 마우스 아이콘 스타일 설정
      mouseIcon.style.position = 'absolute';
      mouseIcon.setAttribute("class", `tool-${Tools[mousePosition.selectTool]}`);
      let mouseUser = document.createElement('p');
      
      mouseUser.textContent = `${userId}`;
      mouseUser.style.minWidth = '100px';
      mouseUser.style.marginTop = '30px';
      mouseUser.style.marginLeft = '10px';
      mouseUser.style.color = 'white';
      mouseUser.style.backgroundColor = getRandomColor()

      mouseIcon.appendChild(mouseUser);
      
      // 사용자별 마우스 아이콘을 구분하기 위한 스타일 추가
      document.body.appendChild(mouseIcon);
    }
    
    const userCurrentTool = Tools[mousePosition.selectTool];
    
    mouseIcon.setAttribute("class", `tool-${userCurrentTool}`);
    mouseIcon.style.left = `${mousePosition.x}px`;
    mouseIcon.style.top = `${mousePosition.y}px`;
  }

  const location = useLocation();
  const { nickname } = location.state || {};

  //load() 역할을 하는 듯
  useEffect(() => {
    setUserId(nickname)

    /* 웹소켓 방식 */
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current);

    /* 본인 로컬에서 작동 */
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current);

    /* 병철 로컬에서 작동 */
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1235'] });

    /* 배포시 사용 */
    const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['wss://www.jungleweb.duckdns.org:1235'] });
    
      

    // Y.js에 저장된 것들 감시하고 업데이트 되면 캔버스에 그리기
    yPens.observe(() => {
      yPens.forEach((konvaData:any, index:string)=>{
        
        const node:any = stageRef.current.children[0].findOne("#"+index)
        if(konvaData.type === 'update' && node != null){
          var newPoints = node.points().concat(konvaData.point);
          node.points(newPoints);
          
        } else if(konvaData.type === 'insert' && node == null){
          const newLine = createNewLine(index, konvaData.points, konvaData.stroke, konvaData.penStyle)
          
          stageRef.current.getLayers()[0].add(newLine);
        } else if(konvaData.type === 'delete' && node != null){
           node.destroy();
           
           
        }
        // yDocRef.current.transact(() => {

        //   yPens.delete(index);
        // }, undoManagerObj);
      });  
    })
    
   

    //마우스 움직임 감지
    yMousePositions.observe((event) => {
      event.changes.keys.forEach((change, key) => {
        if(key == userId.current) return;
        if (change.action === 'delete') {
          
        } else if (change.action === 'add' || change.action === 'update') {
          const mousePosition:any = yMousePositions.get(key);
          const adjustedPosition = {
            x          : mousePosition.x * stageRef.current.scaleX() + stageRef.current.x(),
            y          : (mousePosition.y+(43 / stageRef.current.scaleY())) * stageRef.current.scaleY() + stageRef.current.y(),
            selectTool : mousePosition.selectTool,
            //scale      : mousePosition.scale
          };
          updateMousePositionOnScreen(key, adjustedPosition);
        }
      });
    });

    //영역 전개 감지
    ySelectedNodes.observe((event) =>{
      event.changes.keys.forEach((change, key)=>{
        if(key == userId.current) return;
        const oldGroup:Konva.Group | undefined = stageRef.current.children[0].findOne(`#area-group-${key}`)
        if(change.action == 'delete'){
          if(!oldGroup) return;
          oldGroup.remove();
        }   
        else if(change.action == 'update'){
          if(!oldGroup) return;
          const userAreaData:any = ySelectedNodes.get(key);
          oldGroup.getChildren().forEach((node:any)=>{
            if(node.getClassName() == Shape.Rect){
              node.width(userAreaData.width);
              node.height(userAreaData.height);
              node.x(userAreaData.x);
              node.y(userAreaData.y);
            }else {
              node.x(userAreaData.x);
              node.y(userAreaData.y-23);
            }

          })
        }
        else if(change.action == 'add'){
          if(oldGroup) return;
          const userAreaData:any = ySelectedNodes.get(key);
          createNewUserArea(key, userAreaData);
        }
      });
    });

    //객체 lock 감지
    yLockNodes.observe((event) =>{
      event.changes.keys.forEach((change, key)=>{
        if(key == userId.current) return;
        if(change.action == 'delete'){
          const serializeData:any = change.oldValue;
          const userLockData:string[] = JSON.parse(serializeData);
          if(userLockData){
            userLockData.forEach((value) => {
              const node = stageRef.current.children[0].findOne("#"+value)
              if(!node) return;
              node.removeName('locked')
            });
          }
        } 
        else if(change.action == 'update'){
        }
        else {
          const serializeData:any = yLockNodes.get(key);
          const userLockData:string[] = JSON.parse(serializeData);
          userLockData.forEach((value) => {
            const node = stageRef.current.children[0].findOne("#"+value)
            if(!node) return;
            node.addName('locked')
          });
        }
      });
    });


    yText.observe(() => {
      yText.forEach((konvaData:any, index:string)=>{
        const node = stageRef.current.children[0].findOne("#"+index)
        let newShape:any;
        if(node) return;
        newShape = createNewText(index, {x: konvaData.x, y: konvaData.y}, konvaData.text)
        stageRef.current.getLayers()[0].add(newShape);
        yText.delete(index);
      });
    });

    yShape.observe(() => {
      yShape.forEach((konvaData:any, index:string)=>{
        const node = stageRef.current.children[0].findOne("#"+index)
        let newShape:any;
        if(node) return;
        if(konvaData.type === Shape.Stamp){
          let stampImg = new window.Image();
          stampImg.src = konvaData.image === 'thumbUp' ? thumbUpImg : thumbDownImg;
    
          stampImg.onload = () => {
            
            const newStamp = createNewStamp(index, {x: konvaData.x, y: konvaData.y}, stampImg)
            newStamp.name(konvaData.image)
            //stageRef.current.getLayers()[0].add(newStamp);
          }
          // yDocRef.current.transact(() => {
             yShape.delete(index); 
          // }, undoManagerObj);
        }
        else {
          if(konvaData.type === Shape.Rect){
            newShape = createNewRect(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)

          } else if(konvaData.type === Shape.Circle){
            newShape = createNewCir(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)
            
          } else if(konvaData.type === Shape.RegularPolygon){
            newShape = createNewTri(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)
          } else if(konvaData.type === Shape.Group){
            newShape = createNewPostIt(index, {x: konvaData.Group.x, y: konvaData.Group.y}, konvaData.Text.text)
          }
          //stageRef.current.getLayers()[0].add(newShape);

          // yDocRef.current.transact(() => {
             yShape.delete(index); 
          // }, undoManagerObj);
          //yShape.delete(index);   
        }
      });  
    })

    yMove.observe(() => {
      yMove.forEach((konvaData:any, index:string)=>{
        const paramUserId = konvaData.userId;
        if(paramUserId === userId.current || !userId.current) return;
        const node:Konva.Node | undefined | null = stageRef.current.children[0].findOne("#"+index)
        if(!node) return;
        node.x(konvaData.x)
        node.y(konvaData.y)
         yMove.delete(index);
      });
    })

    yTrans.observe(() => {
      yTrans.forEach((konvaData:any, index:string)=>{
        const paramUserId = konvaData.userId;
        if(paramUserId === userId.current || !userId.current) return;
        const node:Konva.Node | undefined | null = stageRef.current.children[0].findOne("#"+index)
        if(!node) return;
        node.x(konvaData.x)
        node.y(konvaData.y)
        node.scaleX(konvaData.scaleX)
        node.scaleY(konvaData.scaleY)
        node.rotation(konvaData.rotation)
         yTrans.delete(index);
      });
    })

    
    yTextRef.current.observe(() => {
      setTextInputs(yTextRef.current.toArray());
    });


    const createNodeFromKonvaData2 = (index: string, konvaData: any) => {
      const node = stageRef.current.children[0].findOne("#"+index)
        if(node) return;
        if(konvaData == null) return;
        if(konvaData.type == Shape.Line){
          
          const newLine =  createNewLine(index, konvaData.points, konvaData.stroke, konvaData.penStyle)
          newLine.visible(false)
          stageRef.current.getLayers()[0].add(newLine);
          newLine.move({x:konvaData.x, y:konvaData.y});
  
          newLine.scaleX(konvaData.scaleX)
          newLine.scaleY(konvaData.scaleY)
          newLine.rotation(konvaData.rotation)
          newLine.visible(true);
        } 
        else {
          
          if(konvaData.type == Shape.Rect){
            const newShape = createNewRect(index, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
            newShape.visible(false)
            stageRef.current.getLayers()[0].add(newShape);
            newShape.scaleX(konvaData.scaleX)
            newShape.scaleY(konvaData.scaleY)
            newShape.rotation(konvaData.rotation)
            newShape.visible(true);
          }
          else if(konvaData.type == Shape.Circle){
            const newShape = createNewCir(index, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
            newShape.visible(false)
            stageRef.current.getLayers()[0].add(newShape);
            newShape.scaleX(konvaData.scaleX)
            newShape.scaleY(konvaData.scaleY)
            newShape.rotation(konvaData.rotation)
            newShape.visible(true);
          } 
          else if(konvaData.type == Shape.RegularPolygon){
            const newShape = createNewTri(index, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
            newShape.visible(false)
            stageRef.current.getLayers()[0].add(newShape);
            newShape.scaleX(konvaData.scaleX)
            newShape.scaleY(konvaData.scaleY)
            newShape.rotation(konvaData.rotation)
            newShape.visible(true);
          }
          else if(konvaData.type == Shape.Stamp){
            let stampImg = new window.Image();
            
            stampImg.src = konvaData.image === 'thumbUp' ? thumbUpImg : thumbDownImg;
      
            stampImg.onload = () => {
              
              const newStamp = createNewStamp(index, {x: konvaData.x, y: konvaData.y}, stampImg)
              newStamp.name(konvaData.image)
              newStamp.visible(false)
              stageRef.current.getLayers()[0].add(newStamp);
              newStamp.scaleX(konvaData.scaleX)
              newStamp.scaleY(konvaData.scaleY)
              newStamp.rotation(konvaData.rotation)
              newStamp.visible(true);
            }           
          } 
          else if(konvaData.type == Shape.Group) { 
            const newShape = createNewPostIt(index, {x:konvaData.Group.x, y:konvaData.Group.y}, konvaData.Text.text);
            newShape.visible(false)
            stageRef.current.getLayers()[0].add(newShape);
            newShape.scaleX(konvaData.Group.scaleX)
            newShape.scaleY(konvaData.Group.scaleY)
            newShape.rotation(konvaData.Group.rotation)
            newShape.visible(true);
          } 
          else if(konvaData.type == Shape.Text){
            const newShape = createNewText(index, {x: konvaData.x, y: konvaData.y}, konvaData.text)
            newShape.visible(false)
            stageRef.current.getLayers()[0].add(newShape);
            newShape.scaleX(konvaData.scaleX)
            newShape.scaleY(konvaData.scaleY)
            newShape.rotation(konvaData.rotation)
            newShape.visible(true);
          }
        } 

    }


    // const createNodeFromKonvaData = (id:string, konvaData:any) => { 
    //   let newShape;
    //   switch (konvaData.type) {
    //     case 'Line':
    //       let newLine;
    //       // return new Konva.Line({
    //       //   id: id,
    //       //   points: konvaData.points,
    //       //   stroke: konvaData.stroke,
    //       //   strokeWidth: konvaData.strokeWidth,
    //       //   lineCap: konvaData.lineCap,
    //       //   lineJoin: konvaData.lineJoin,
    //       //   // Add other properties as needed
    //       // });
    //       newLine = createNewLine(id, konvaData.points, konvaData.stroke, konvaData.penStyle);
    //       newLine.visible(false);
    //       stageRef.current.getLayers()[0].add(newLine);
    //       newLine.move({x: konvaData.x, y: konvaData.y});
    //       newLine.scaleX(konvaData.scaleX);
    //       newLine.scaleY(konvaData.scaleY);
    //       newLine.rotation(konvaData.rotation);
    //       newLine.visible(true);
    //       return newLine;
    //       break;
    //     case Shape.Rect:
    //       newShape = createNewRect(id, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
    //       break;
    //     case Shape.Circle:
    //       newShape = createNewCir(id, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
    //       break;
    //     case Shape.RegularPolygon:
    //       newShape = createNewTri(id, {x:konvaData.x, y:konvaData.y}, konvaData.fill);
    //       break;
    //     case Shape.Stamp:
    //       let stampImg = new window.Image();
    //       stampImg.src = konvaData.image === 'thumbUp' ? thumbUpImg : thumbDownImg;
    //       stampImg.onload = () => {
    //         newShape = createNewStamp(id, {x: konvaData.x, y: konvaData.y}, stampImg);
    //         newShape.name(konvaData.image);
    //       }
    //       break;
    //     case Shape.Group:
    //       newShape = createNewPostIt(id, {x:konvaData.Group.x, y:konvaData.Group.y}, konvaData.Text.text);
    //       break;
    //     case Shape.Text:
    //       newShape = createNewText(id, {x: konvaData.x, y: konvaData.y}, konvaData.text);
    //       break;
    //     default:
    //       return null;
    //   }

    //   if (newShape) {
    //     newShape.visible(false);
    //     stageRef.current.getLayers()[0].add(newShape);
    //     newShape.scaleX(konvaData.scaleX);
    //     newShape.scaleY(konvaData.scaleY);
    //     newShape.rotation(konvaData.rotation);
    //     newShape.visible(true);
    //     return newShape;
    //   }
      
    // }


    const updateCanvas = () => {
      setIsLoading(false);
      yObjects.observe((event) => {

        event.keysChanged.forEach(id => {
          const konvaData = yObjects.get(id);
          let node = stageRef.current.findOne(`#${id}`);
          console.log(konvaData, node, event.keysChanged, "changed event konvaData, node !!!!!!!!!");

          //node?.destroy();
          if (!konvaData || node) { 
            node?.destroy();
          }

          if(konvaData){
            // const newNode = createNodeFromKonvaData(id, konvaData);
            // if(newNode){
            //   stageRef.current.getLayers()[0].add(newNode);
            // }
            createNodeFromKonvaData2(id, konvaData);
          }
        });
        


      });
    };
    updateCanvas();







    return () => {      
      yMousePositions.delete(userId.current);
      provider.destroy();
      yDocRef.current.destroy();
    };
  }, []);


  useEffect(() => {
    toolRef.current = tool;
    currentColorRef.current = currentColor;
  }, [tool, currentColor]);

  const createNewUserArea = (paramUserId:string, pos:{x:number, y:number, width:number, height:number})=>{
    
    if(pos.width == 0 && pos.height == 0) return;
    
    const newRect = new Konva.Rect({
      id : `area-${paramUserId}`,
      stroke: 'rgba(255,0,0,0.5)',
      strokeWidth : 7,
      visible : true,
    })
    
    const nameTag = new Konva.Text({
      id : `area-tag-${paramUserId}`,
      fill: 'rgba(255,0,0,0.5)',
      fontSize : 20,
      fontStyle : 'bold',
      padding : 2,
      visible : true,
      width: 100,
      height: 100,
      text : `${paramUserId}`
    })
    
    const groups = new Konva.Group({
      id : `area-group-${paramUserId}`,
    })
    
    
    groups.add(newRect);
    groups.add(nameTag);
    
    newRect.x(pos.x)
    newRect.y(pos.y)
    newRect.width(pos.width)
    newRect.height(pos.height)
    
    nameTag.x(pos.x)
    nameTag.y(pos.y-23) 
    
    stageRef.current.getLayers()[0].add(groups);
    
  }
  
  const createNewLine = (idx:string, pos:number[], color:any, penStyle:Tools = Tools.PEN) =>{
    let newLine:Konva.Line;
    
    if(penStyle == Tools.PEN){
      newLine = new Konva.Line({
        id          : idx,
        points      : pos,
        stroke      : color,
        strokeWidth : 5,
        lineCap     : 'round',
        lineJoin    : 'round',
        draggable   : true,
        name        : Tools[Tools.PEN]
      });
    } else {
      newLine = new Konva.Line({
        id          : idx,
        points      : pos,
        stroke      : color,
        strokeWidth : 15,
        lineCap     : "butt",
        lineJoin    : "round",
        draggable   : true,
        tension     : 0.5,
        opacity     : 0.4,
        name        : Tools[Tools.HIGHLIGHTER],
      });
    }

    newLine.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        newLine.draggable(false)
        return;
      } else {
        newLine.draggable(true)
      }

      const selected = e.target
      if(groupTr == null){
        createNewTr();
      } 
      if(groupTr){
        if(groupTr.nodes().length == 0){
          groupTr.nodes([selected]);
        }
      }
      
    })
    return newLine
  }

  const createNewStamp = (id:string, pos:{x:number, y:number}, imageObj:any)=>{
    let newStamp = new Konva.Image({
      id     : id,
      x      : pos.x,
      y      : pos.y,
      width  : 40,
      height : 40,
      image  : imageObj,
      draggable : true
    });
      
    newStamp.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        newStamp.draggable(false)
        return;
      } else {
        newStamp.draggable(true)
      }
      
      const selected = e.target
      if(groupTr == null){
        createNewTr();
      }
      if(groupTr){
        if(groupTr.nodes().length == 0){
          groupTr.nodes([selected]);
        }
      }
    })

    return newStamp;
  }
  
  const createNewRect = (id:string, pos:{x:number, y:number}, color:any)=>{

    const newShape = new Konva.Rect({
      id        : id,
      x         : pos.x,
      y         : pos.y,
      width     : 150, 
      height    : 150,
      fill      : color,
      draggable : true
    });
    newShape.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        newShape.draggable(false)
        return;
      } else {
        newShape.draggable(true)
      }

      const selected = e.target
      if(groupTr == null){
        createNewTr();
      }
      if(groupTr){
        if(groupTr.nodes().length == 0){
          groupTr.nodes([selected]);
        }
      }
    })
    return newShape
  }

  const createNewCir = (id:string, pos:{x:number, y:number}, color:any)=>{
    const newShape = new Konva.Circle({
      id        : id,
      x         : pos.x,
      y         : pos.y,
      width     : 150, 
      height    : 150,
      fill      : color,
      draggable : true
    });

    newShape.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        newShape.draggable(false)
        return;
      } else {
        newShape.draggable(true)
      }

      const selected = e.target
      if(groupTr == null){
        createNewTr();
      }
      if(groupTr){
        if(groupTr.nodes().length == 0){
          groupTr.nodes([selected]);
        }
      }
    })
    return newShape
  }
  
  const createNewTri = (id:string, pos:{x:number, y:number}, color:any)=>{
    const newShape = new Konva.RegularPolygon({
      id        : id,
      x         : pos.x,
      y         : pos.y,
      sides     : 3,
      radius    : 100,
      fill      : color,
      draggable : true
    });
    
    newShape.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        newShape.draggable(false)
        return;
      } else {
        newShape.draggable(true)
      }

      const selected = e.target
      if(groupTr == null){
        createNewTr();
      }
      if(groupTr){
        if(groupTr.nodes().length == 0){
          groupTr.nodes([selected]);
        }
      }
    })
    return newShape
  }

  function findFirstDiffIndex(oldStr:string, newStr:string) {
    let start = 0;
    while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
        start++;
    }

    let endOld = oldStr.length - 1;
    let endNew = newStr.length - 1;
    while (endOld >= start && endNew >= start && oldStr[endOld] === newStr[endNew]) {
        endOld--;
        endNew--;
    }

    return { start, endOld: endOld + 1, endNew: endNew + 1 };
  }

  const createNewTextArea:any = (textNode:any, areaPosition:{x:number, y:number})=>{
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
    textarea.style.height = textNode.height() - textNode.padding() * 2 + 1 + 'px';
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    let rotation = textNode.rotation();
    var transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }

    var px = 0;

    var isFirefox =
      navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    if (isFirefox) {
      px += 2 + Math.round(textNode.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';

    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    return textarea;
  }
  
  const createNewText = (id:string, pos:{x:number, y:number}, text:string , color:string = 'Black')=>{
    const yTextData = yDocRef.current.getText(id);

    const textNode:any = new Konva.Text({
      id : id,
      text: text == ""?'Some text here':text,
      x: pos.x,
      y: pos.y,
      fontSize: 20,
      fill : color,
      draggable: true,
      width: 200,
    });

    
    
    textNode.on("mousedown", (e:any)=>{
      
      if(toolRef.current !== Tools.CURSOR){
        textNode.draggable(false)
        return;
      } else {
        textNode.draggable(true)
      }
      
      const selected = e.target
      if(groupTr == null){
        createNewTr();
      }
      if(groupTr && groupTr.nodes().length == 0){
        groupTr.nodes([selected]);
      }
    });
    
    var textPosition = textNode.absolutePosition();
    let textarea:HTMLTextAreaElement;
    
    yTextData.observe(() => {
      
      textNode.text(yTextData.toString());
    });
    // if (textarea !== document.activeElement) {
      //   textarea.value = yTextData.toString();
      // }
      
      textNode.on('dblclick dbltap', () => {
        textNode.hide();
        
        var areaPosition = {
          x: stageRef.current.container().offsetLeft + textPosition.x,
          y: stageRef.current.container().offsetTop + textPosition.y,
        };
        
        textarea = createNewTextArea(textNode, areaPosition);
        textarea.value = yTextData.toString();
        
        
        let isComposing = false;
        
        textarea.addEventListener('compositionstart', () => {
          isComposing = true; // 한글 입력 시작
        });
        
        textarea.addEventListener('compositionend', () => {
          isComposing = false; // 한글 입력 완료
          
          syncText(); // 입력 완료 후 동기화 함수 호출
        });
        
        textarea.addEventListener('input', () => {
          if (!isComposing) {
            // 한글 입력이 아니거나 입력이 완료된 경우에만 동기화 진행
            syncText();
          }
        });
        
        const syncText = ()=>{
          const currentText = textarea.value;
          // Y.Text 객체의 현재 내용
          const yCurrentText = yTextData.toString();
          
          const { start, endOld, endNew } = findFirstDiffIndex(yCurrentText, currentText);
          
          if (start !== endOld) {
            yTextData.delete(start, endOld - start);
          }
          
          // 그리고 새로운 문자열을 삽입
          const newText = currentText.substring(start, endNew);
          if (newText.length > 0) {
            yTextData.insert(start, newText);
          }
        }
        
     
      function removeTextarea() {
        if (!textarea.parentNode) return;
        textarea.parentNode.removeChild(textarea);
        window.removeEventListener('click', handleOutsideClick);
        textNode.show();
    
        const konvaData = {
          type      : Shape.Text, 
          id        : textNode.id(),
          x         : textNode.x(),
          y         : textNode.y(),
          width     : textNode.width(),
          fontSize  : textNode.fontSize(),
          text      : textNode.text(),
          draggable : true,
        }
        
        yDocRef.current.transact(() => {
          yObjects.set(textNode.id(), konvaData);
        }, undoManagerObj);
      }
      
      function setTextareaWidth(newWidth:any) {
        if (!newWidth) {
          // set width for placeholder
          newWidth = textNode.placeholder.length * textNode.fontSize();
        }
        // some extra fixes on different browsers
        var isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
          );
          var isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth);
          }
          
          var isEdge =
          document.DOCUMENT_NODE || /Edge/.test(navigator.userAgent);
          if (isEdge) {
            newWidth += 1;
          }
          textarea.style.width = newWidth + 'px';
        }
        
        textarea.addEventListener('keydown', function (e:any) {
          // hide on enter
          // but don't hide on shift + enter
          if (e.key === 'Enter' && !e.shiftKey) {
            textNode.text(textarea.value);
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.key === 'esc') {
            removeTextarea();
          }
        });
        
        
        textarea.addEventListener('keydown', function () {
          let scale = textNode.getAbsoluteScale().x;
          setTextareaWidth(textNode.width() * scale);
        textarea.style.height = 'auto';
        textarea.style.height =
        textarea.scrollHeight + textNode.fontSize() + 'px';
      });

      function handleOutsideClick(e:any) {
        if (e.target !== textarea) {
          textNode.text(textarea.value);
          removeTextarea();
          //tr.hide();
        }
      }

      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
      });
    });

    return textNode
  }

  const createNewPostIt = (id:string, pos:{x:number, y:number}, text:string = "")=>{
    const yTextData = yDocRef.current.getText(id); //text 동기화 추가
    const defaultString = 'Type anything! And also everyone in the meeting can vote on your topic by stamp👍🏽👎🏽';

    let postItGroup = new Konva.Group({
      name : 'postIt',
      x: pos.x,
      y: pos.y,
      draggable: true,
      id: id, // 각각의 포스트잇마다 uuid 잘 찍힘 
    });

    
    const postItOptions = {
      x: 0,
      y: 0,
    }
    
    let postItText: any = new Konva.Text({
      id : id+"_pit",
      name: 'postItText',
      ...postItOptions, // x, y
      width: POSTIT_MIN_WIDTH,
      height: POSTIT_MIN_HEIGHT,
      text: text,
      fontSize: 20,
      padding: 15,
    });
    
    let initText = new Konva.Text({
      id : id+"_piit",
      name: 'postItinitText',
      ...postItOptions,
      width: postItText.width(),
      text: defaultString,
      fontSize: 20,
      opacity: 0.4,
      padding: 15,
    });
    
    let postItRect = new Konva.Rect({
      id : id+"_pir",
      name : "postItRect",
      ...postItOptions,
      width: postItText.width(),
      height: postItText.height(),
      fill: '#FFD966',
      shadowColor: 'black',
      shadowBlur: 15,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      shadowOpacity: 0.2,
    });  
    
    postItGroup.add(postItRect);
    postItGroup.add(postItText);
    postItGroup.add(initText);
    
    if(text !== ""){
      initText.hide();
    }

    //text 관찰자 추가
    yTextData.observe(() => {
      if(yTextData.toString() ==""){
        initText.show();
      }else{
        initText.hide();
      }
      postItText.text(yTextData.toString());
    });

    postItGroup.on('dblclick dbltap', () => {
      initText.hide();
      postItText.hide();
      
      var textPosition = postItText.absolutePosition();
      
      var areaPosition = {
        x: stageRef.current.container().offsetLeft + textPosition.x,
        y: stageRef.current.container().offsetTop + textPosition.y,
      };
      
      //createNewTextArea 유사한 부분---------------------------
      var textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = postItText.width() + 'px';
      textarea.style.height = postItText.height() + 'px';
      textarea.style.fontSize = postItText.fontSize() + 'px';
      textarea.style.border = 'none';
      textarea.style.padding = '15px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.lineHeight = postItText.lineHeight();
      textarea.style.fontFamily = postItText.fontFamily();
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = postItText.align();
      textarea.style.color = postItText.fill();

      const rotation = postItText.rotation();
      var transform = '';

      if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)';
      }

      var px = 0;
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isFirefox) {
        px += 2 + Math.round(postItText.fontSize() / 20);
      }

      transform += 'translateY(-' + px + 'px)';
      textarea.style.transform = transform;
      
      //creatNewTextArea End-------------------------------

      //Text 동기화 시작---------------------------
      textarea.value = yTextData.toString();

      let isComposing = false;
        
      textarea.addEventListener('compositionstart', () => {
        isComposing = true; // 한글 입력 시작
      });
      
      textarea.addEventListener('compositionend', () => {
        isComposing = false; // 한글 입력 완료
        
        syncText(); // 입력 완료 후 동기화 함수 호출
      });
      
      textarea.addEventListener('input', () => {
        if (!isComposing) {
          // 한글 입력이 아니거나 입력이 완료된 경우에만 동기화 진행
          syncText();
        }
      });
      
      const syncText = ()=>{
        const currentText = textarea.value;
        // Y.Text 객체의 현재 내용
        const yCurrentText = yTextData.toString();
        
        const { start, endOld, endNew } = findFirstDiffIndex(yCurrentText, currentText);
        
        if (start !== endOld) {
          yTextData.delete(start, endOld - start);
        }
        
        // 그리고 새로운 문자열을 삽입
        const newText = currentText.substring(start, endNew);
        if (newText.length > 0) {
          yTextData.insert(start, newText);
        }
      }

      //Text 동기화 끝---------------------------

      function setTextareaWidth(newWidth: any) {
        if (!newWidth) {
          // set width for placeholder
          newWidth = postItText.placeholder.length * postItText.fontSize();
        }
        // some extra fixes on different browsers
        var isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );
        var isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isSafari || isFirefox) {
          newWidth = Math.ceil(newWidth);
        }

        var isEdge =
          document.DOCUMENT_NODE || /Edge/.test(navigator.userAgent);
        if (isEdge) {
          newWidth += 1;
        }
        textarea.style.width = newWidth + 'px';
      }

      /* 입력되는 텍스트 양에 따른 rect height 증가  */
      textarea.addEventListener('keydown', function (e: any) {
        setTextareaWidth(postItText.width());
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + postItText.fontSize() + 'px';
       
        const text = postItGroup.findOne('.postItText')
        const rect = postItGroup.findOne('.postItRect')

        let textareaHeight = (parseInt(textarea.style.height.slice(0, -2)) as any); // 'px' 제거
        
        if (text && rect) {
          text.setAttrs({
            height: Math.max(textareaHeight, text.attrs.height),
          });

          rect.setAttrs({
            height: text.height(),
          });
        }

        const key = e.key.toLowerCase();
        if (key == 'esc' || key == 'escape') {
          postItText.text(textarea.value);
          postItText.show();
          textarea.remove();
          stageRef.current.off('mouseup', handleOutsideClick);

          const konvaData = {
            type  : Shape.Group,
            Group : {
              id        : postItGroup.id(),
              x         : postItGroup.x(),
              y         : postItGroup.y(),
              width     : postItGroup.width(),
              height     : postItGroup.height(),
              draggable : true,
              userId    : userId,
            },
            Rect  : {},
            Text  : {
              text      : postItText.text(),
              fontSize  : postItText.fontSize(),
            } 
          }

          yDocRef.current.transact(() => {
            yObjects.set(postItGroup.id(), konvaData);
          }, undoManagerObj);

        }
      });

      function handleOutsideClick(e: any) {
        if (textarea.value === '') {
          initText.show();
        }

        if (e.target !== textarea) {
          postItText.text(textarea.value);
          postItText.show();
          textarea.remove();
          stageRef.current.off('mouseup', handleOutsideClick);

          const konvaData = {
            type  : Shape.Group,
            Group : {
              id        : postItGroup.id(),
              x         : postItGroup.x(),
              y         : postItGroup.y(),
              width     : postItGroup.width(),
              height     : postItGroup.height(),
              draggable : true,
              userId    : userId,
            },
            Rect  : {},
            Text  : {
              text      : postItText.text(),
              fontSize  : postItText.fontSize(),
            } 
          }
          
          yDocRef.current.transact(() => {
            yObjects.set(postItGroup.id(), konvaData);
          }, undoManagerObj);
        }
      }
      
      if(textarea){
        stageRef.current.on('mouseup', handleOutsideClick);
        // PostItText.show();
      }
    });

    postItGroup.on('mousedown', (e:any)=>{  // e.target: Text, e.currentTarget: Group 
          //그룹 Transfomer
      
      if(toolRef.current !== Tools.CURSOR){
        postItGroup.draggable(false)
        return;
      } else {
        postItGroup.draggable(true)
      }

      if (groupTr === null) {
        createNewTr();
      } else {          
        groupTr.nodes([e.target]);  // e.target: PostItText
      }
      
      const text = postItGroup.findOne('.postItText')
      const rect = postItGroup.findOne('.postItRect')
      const init = postItGroup.findOne('.postItText')
      
      if (text && rect) {
        text.on('transform', () => {
          text.setAttrs({
            width: Math.max(text.width() * text.scaleX(), POSTIT_MIN_WIDTH),
            height : Math.max(text.height() * text.scaleY(), POSTIT_MIN_HEIGHT),
            scaleX: 1,
            scaleY: 1,
          });
    
          // text의 크기가 변경될 때 rect의 크기도 업데이트
          rect.setAttrs({
            width: text.width(),
            height: text.height(),
          });

          // text의 너비가 변경될 때 initText의 너비도 업데이트
          if (init) {
            init.setAttrs({
              width: text.width(),
            })
          }
        });
      }
    })
    return postItGroup
  }

  const createNewTr = ()=>{
    //if (groupTr != null) return;
    const tr = new Konva.Transformer({ flipEnabled: false });
    tr.on('dragstart', function() {
      isDrag.current = true;
    });
    tr.on('dragmove', function(e:any) {
      //마우스 동기화
      //const mousePosition = { x: e.evt.clientX, y: e.evt.clientY, selectTool : toolRef.current };
      
      // const mousePosition = { 
      //   x: (e.evt.clientX - stageRef.current.x()) / stageRef.current.scaleX(), 
      //   y: (e.evt.clientY - stageRef.current.y()) / stageRef.current.scaleX(), 
      //   selectTool : toolRef.current,
      //   scale: stageRef.current.scaleX()
      // };
      // if(userId.current){
      //   yMousePositions.set(userId.current, mousePosition);
      // }
      const stage = e.target.getStage();
    
      const pos = stage.getPointerPosition();
      const scale = stage.scaleX(); // 현재 스케일
      const position = stage.position(); // 현재 위치
      
      const realPointerPosition = {
        x: (pos.x - position.x) / stage.scaleX(),
        y: (pos.y - position.y) / stage.scaleY(),
      };
  
      const mousePosition = { 
        x: realPointerPosition.x, 
        y: realPointerPosition.y, 
        selectTool : toolRef.current,
        scale: scale
      };
  
      if(userId.current){
        yMousePositions.set(userId.current, mousePosition);
      }
      
      
      tr.getNodes().forEach((node:any)=>{    
        const changeInfo = {
          idx : node.id(),
          x   : node.x(),
          y   : node.y(),
          userId : userId.current
        }
        yDocRef.current.transact(() => {
          yMove.set(node.id(), changeInfo);
        }, undoManagerObj);
      });
      
      const selectionRect = tr.getClientRect();

      // 선택 영역 정보를 절대 좌표계로 변환하여 저장
      const absoluteSelectionInfo = {
        x: (selectionRect.x - position.x) / scale,
        y: (selectionRect.y - position.y) / scale ,
        width: selectionRect.width / stageRef.current.scaleX(),
        height: selectionRect.height / stageRef.current.scaleY(),
      };
      

      ySelectedNodes.set(userId.current, absoluteSelectionInfo);
    });

   
    tr.on('dragend', function() {
      isDrag.current = false;
      let type:any;
      let konvaData:any;
      tr.getNodes().forEach((node:any)=>{
        type = node.getClassName()
        if(node.name().includes("postIt")){
          if(type === Shape.Group){
            konvaData = {
              type  : type,
              Group : {},
              Rect  : {},
              Text  : {} 
            }
            const childList:Konva.Node[] = node.children;
            if(node.getClassName() == Shape.Group){
              konvaData.Group = {
                draggable : true,
                id        : node.id(),
                x         : node.x(),
                y         : node.y(),
                rotation  : node.rotation(),
                scaleX    : node.scaleX(),
                scaleY    : node.scaleY(),
                // offsetX   : node.id(),
                // offsetY   : node.id(),
                // skewX     : node.skewX(),
                // skewY     : node.skewY(),
              }
            }
            childList.forEach((childNode:any)=>{
              if(childNode.getClassName() == Shape.Rect){
                konvaData.Rect = {
                  id        : childNode.id(),
                  x         : childNode.x(),
                  y         : childNode.y(),
                  width     : childNode.width(),
                  height    : childNode.height(),
                  scaleX    : childNode.scaleX(),
                  scaleY    : childNode.scaleY(),
                  rotation  : childNode.rotation(),
                  draggable : true,
                }
              } 
              else if(childNode.getClassName() == Shape.Text){
                if(childNode.hasName("postItText")){
                  konvaData.Text = {
                    id        : childNode.id(),
                    x         : childNode.x(),
                    y         : childNode.y(),
                    width     : childNode.width(),
                    fontSize  : childNode.fontSize(),
                    text      : childNode.text(),
                    scaleX    : childNode.scaleX(),
                    scaleY    : childNode.scaleY(),
                    rotation  : childNode.rotation(),
                    draggable : true,
                  }
                }
              } 
            })
          }
        } else {
          if (type === Shape.Line){
            konvaData = {
              type        : type,
              id          : node.id(),
              x           : node.x(),
              y           : node.y(),
              points      : node.points(),
              stroke      : node.stroke(),
              strokeWidth : node.strokeWidth(),
              lineCap     : node.lineCap(),
              lineJoin    : node.lineJoin(),
              scaleX      : node.scaleX(),
              scaleY      : node.scaleY(),
              rotation    : node.rotation(),
              tension     : node.tension(),
              opacity     : node.opacity(),
              penStyle    : node.hasName(Tools[Tools.PEN]) ? Tools.PEN : Tools.HIGHLIGHTER,
              draggable   : true,
            }
          } else if(type === Shape.RegularPolygon){
            konvaData = {
              type      : type, 
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              sides     : node.sides(),
              radius    : node.radius(),
              fill      : node.fill(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            }
          } else if (type === Shape.Circle || type === Shape.Rect){
            konvaData = {
              type      : type, 
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              height    : node.height(),
              fill      : node.fill(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            }
          } else if(type === Shape.Stamp){
            konvaData = {
              type      : type,
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              height    : node.height(),
              image     : node.getName(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true
            }
          } 
          else if(type == Shape.Text){
            konvaData = {
              type      : type, 
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              fontSize  : node.fontSize(),
              text      : node.text(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            }
            
          }
        }
        yDocRef.current.transact(() => { 
          yObjects.set(node.id(), konvaData);
        }, undoManagerObj);
        // console.log("createline in drag end");
        // console.log("undoStack.length",undoManagerObj.undoStack.length);
        // console.log("redoStack.length", undoManagerObj.redoStack.length);


      });


    });
    

    tr.on('transformstart', function() {
      isTrans.current = true;

    });
    tr.on('transform', function() {
      tr.getNodes().forEach((node:any)=>{        
        const changeInfo = {
          idx      : node.id(),
          x        : node.x(),
          y        : node.y(),
          scaleX   : node.scaleX(),
          scaleY   : node.scaleY(),
          rotation : node.rotation(),
          userId : userId.current
        }

        
        yTrans.set(node.id(), changeInfo); 
      });
      const selectionRect = tr.getClientRect();
      const scale = stageRef.current.scaleX(); // 현재 스케일
      const position = stageRef.current.position(); // 현재 위치 
      
      // 선택 영역 정보를 절대 좌표계로 변환하여 저장
      const absoluteSelectionInfo = {
        x: (selectionRect.x - position.x) / scale,
        y: (selectionRect.y - position.y) / scale ,
        width: selectionRect.width / stageRef.current.scaleX(),
        height: selectionRect.height / stageRef.current.scaleY(),
        
      };
      
      ySelectedNodes.set(userId.current, absoluteSelectionInfo);

    });
    tr.on('transformend', function() {
      isTrans.current = false;
      let type:Shape;
      let konvaData:any;
      tr.getNodes().forEach((node:any)=>{
        type = node.getClassName()
        if(node.name().includes("postIt")){
          if(type === Shape.Group){
            konvaData = {type : type}
            const childList:Konva.Node[] = node.children;
            if(node.getClassName() == Shape.Group){
              konvaData.Group = {
                draggable : true,
                id        : node.id(),
                x         : node.x(),
                y         : node.y(),
                rotation  : node.rotation(),
                scaleX    : node.scaleX(),
                scaleY    : node.scaleY(),
                // offsetX   : node.id(),
                // offsetY   : node.id(),
                // skewX     : node.skewX(),
                // skewY     : node.skewY(),
              }
            }
            childList.forEach((childNode:any)=>{
              if(childNode.getClassName() == Shape.Rect){
                konvaData.Rect = {
                  id        : childNode.id(),
                  x         : childNode.x(),
                  y         : childNode.y(),
                  width     : childNode.width(),
                  height    : childNode.height(),
                  scaleX    : childNode.scaleX(),
                  scaleY    : childNode.scaleY(),
                  rotation  : childNode.rotation(),
                  draggable : true,
                }
              } 
              else if(childNode.getClassName() == Shape.Text){
                if(childNode.hasName("postItText")){
                  konvaData.Text = {
                    id        : childNode.id(),
                    x         : childNode.x(),
                    y         : childNode.y(),
                    width     : childNode.width(),
                    fontSize  : childNode.fontSize(),
                    text      : childNode.text(),
                    scaleX    : childNode.scaleX(),
                    scaleY    : childNode.scaleY(),
                    rotation  : childNode.rotation(),
                    draggable : true,
                  }
                }
              } 
            })
          }
        } else {
          if (type === Shape.Line){
            konvaData = {
              type        : type,
              id          : node.id(),
              x           : node.x(),
              y           : node.y(),
              points      : node.points(),
              stroke      : node.stroke(),
              strokeWidth : node.strokeWidth(),
              lineCap     : node.lineCap(),
              lineJoin    : node.lineJoin(),
              scaleX      : node.scaleX(),
              scaleY      : node.scaleY(),
              rotation    : node.rotation(),
              tension     : node.tension(),
              opacity     : node.opacity(),
              penStyle    : node.hasName(Tools[Tools.PEN]) ? Tools.PEN : Tools.HIGHLIGHTER,
              draggable   : true,
            }
          } else if(type === Shape.RegularPolygon){
            konvaData = { 
              type      : type,
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              sides     : node.sides(),
              radius    : node.radius(),
              fill      : node.fill(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            }
          } else if (type === Shape.Circle || type === Shape.Rect){
            konvaData = { 
              type      : type,
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              height    : node.height(),
              fill      : node.fill(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            } 
          } else if(type === Shape.Stamp){
            konvaData = {
              type      : type,
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              height    : node.height(),
              image     : node.getName(), 
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true
            }
          } else if(type === Shape.Text){
            konvaData = {
              type      : type, 
              id        : node.id(),
              x         : node.x(),
              y         : node.y(),
              width     : node.width(),
              fontSize  : node.fontSize(),
              text      : node.text(),
              scaleX    : node.scaleX(),
              scaleY    : node.scaleY(),
              rotation  : node.rotation(),
              draggable : true,
            }
          }
        }
        yDocRef.current.transact(() => {
          yObjects.set(node.id(), konvaData)
        }, undoManagerObj);
      });

    });
    

    tr.on('mousedown touchstart', (e) => {
      e.cancelBubble = true;
    });

    groupTr = tr;
    stageRef.current.getLayers()[0].add(groupTr)
  }

  
  /* stamp, shape에만 사용 */
  const handleIconBtnClick = (id: string) => {
    setClickedIconBtn(id);  // 어떤 IconBtn 클릭했는지 변수 clickIconBtn에 저장
  }


  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition();
    const layers = stage.getLayers();
    const layer = layers[0];
    const scale = stage.scaleX(); // 현재 스케일
    const position = stage.position(); // 현재 위치
    
    const realPointerPosition = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };

    const idx:string = "obj_Id_"+(id).toString()

    if(tool === Tools.HAND){
      if (e.target === stage){
        stage.container().style.cursor = 'grabbing';
        //Hand 모드 -> 캔버스 이동
        isHand.current = true;
        stageRef.current.draggable(true)
        
      } 
    } else if (tool === Tools.CURSOR){
      if(e.target === stage){

        //e.evt.preventDefault();
        //블록(다중 선택하는 영역) 기능
        if(groupTr != null){
          const oldSelected = groupTr.getNodes();
          oldSelected.forEach((node)=>{
            if(node.hasName('locked')){
              node.removeName("locked")
            }
          });
          ySelectedNodes.delete(userId.current);
          yLockNodes.delete(userId.current);
          groupTr.nodes([]);
        }
        selectionRectangle= new Konva.Rect({
          fill: 'rgba(0,0,255,0.3)',
          visible : true,
          x: realPointerPosition.x,
          y: realPointerPosition.y,
          width: 0,
          height: 0,
        });
      
        
        multiSelectBlocker.x1 = realPointerPosition.x;
        multiSelectBlocker.y1 = realPointerPosition.y;
        multiSelectBlocker.x2 = realPointerPosition.x;
        multiSelectBlocker.y2 = realPointerPosition.y;
        
        selectionRectangle.width(1);
        selectionRectangle.height(1);
        isSelected.current = true;
        layer.add(selectionRectangle)
      } 
      
    } else if (tool === Tools.PEN || tool === Tools.HIGHLIGHTER) {

      //펜 이벤트
      isDrawing.current = true;

      newLine = createNewLine(idx, [realPointerPosition.x, realPointerPosition.y], currentColorRef.current, toolRef.current)

      layer.add(newLine);
      
      const changeInfo = {
        type: "insert",
        point: [realPointerPosition.x, realPointerPosition.y],
        stroke : newLine.stroke(),
        penStyle: toolRef.current
      };
      //yDocRef.current.transact(() => {
        yPens.set(idx, changeInfo);
        //yObjects.set(idx, changeInfo);    //my add code 
      //}, undoManagerObj);
      //console.log("create", undoManagerObj, undoManagerObj.undoStack);

    }
  };

  const handleMouseMove = (e: any) => {
    
    const stage = e.target.getStage();
    
    const pos = stage.getPointerPosition();
    const scale = stage.scaleX(); // 현재 스케일
    const position = stage.position(); // 현재 위치
    
    const realPointerPosition = {
      x: (pos.x - position.x) / stage.scaleX(),
      y: (pos.y - position.y) / stage.scaleY(),
    };

    const mousePosition = { 
      x: realPointerPosition.x, 
      y: realPointerPosition.y, 
      selectTool : toolRef.current,
      scale: scale
    };

    if(userId.current){
      yMousePositions.set(userId.current, mousePosition);
    }

    if(tool === Tools.CURSOR){
      if (!isSelected.current) return;

      //e.evt.preventDefault();
      multiSelectBlocker.x2 = realPointerPosition.x;
      multiSelectBlocker.y2 = realPointerPosition.y;

      selectionRectangle.setAttrs({
        visible : true,
        x: Math.min(multiSelectBlocker.x1, multiSelectBlocker.x2),
        y: Math.min(multiSelectBlocker.y1, multiSelectBlocker.y2),
        width: Math.abs(multiSelectBlocker.x2 - multiSelectBlocker.x1),
        height: Math.abs(multiSelectBlocker.y2 - multiSelectBlocker.y1),
      });
    }
    else if (tool === Tools.HAND){
      
    }
    else if (tool === Tools.PEN ||tool === Tools.HIGHLIGHTER ) {
      if (!isDrawing.current || newLine == null) {
        return;
      }


      var newPoints = newLine.points().concat([realPointerPosition.x, realPointerPosition.y]);
      newLine.points(newPoints);
      
      const idx = "obj_Id_"+(id).toString()

      const changeInfo = {
        type: "update",
        point: [realPointerPosition.x, realPointerPosition.y],
        penStyle : tool
      };
      //yDocRef.current.transact(() => {
      yPens.set(idx, changeInfo);
    //}, undoManagerObj);
    }
    else if(tool === Tools.ERASER){
      const stage = e.target.getStage()
      const pointerPosition = stage.getPointerPosition();
      const lines = stage.getLayers()[0].getChildren((node:any) => {return node.getClassName() === 'Line'});

      const line = lines.find((line:any) => line.intersects(pointerPosition));
      if(line){
        const lineId = line.id();
        const changeInfo = {
          type: "delete"
        };
        //yPens 주석 처리해도 같은 결과?
        yDocRef.current.transact(() => {
          yPens.set(lineId.toString(), changeInfo);
          yObjects.set(lineId.toString(), changeInfo);
        }, undoManagerObj);
      }
    }
  };

  const handleMouseUp = (e:any) => {
    const leaveEvtFlag:boolean = e.evt.type === 'mouseleave'? true:false  
    const stage = e.target.getStage();

    const scale = stage.scaleX(); // 현재 스케일
    const position = stage.position(); // 현재 위치 

    if(tool === Tools.PEN || tool === Tools.HIGHLIGHTER){
      isDrawing.current = false;
      const idx = "obj_Id_"+(id).toString()
      if(newLine == null) return;
      const konvaData = {
        id          : idx,
        type        : 'Line',
        points      : newLine.points(),
        stroke      : newLine.stroke(),
        strokeWidth : newLine.strokeWidth(),
        lineCap     : newLine.lineCap(),
        lineJoin    : newLine.lineJoin(),
        opacity     : newLine.opacity(),
        tenson      : newLine.tension(),
        penStyle    : tool,
        draggable   : true
      }
      // console.log("handlemouseup 1090, before");
      // console.log(newLine, idx, konvaData, "data check 1930");
      //   console.log("undoStack.length",undoManagerObj.undoStack.length);
      //   console.log("redoStack.length", undoManagerObj.redoStack.length);
      yDocRef.current.transact(() => {
        yObjects.set(idx, konvaData)
        //console.log("mouse down set line", yObjects, undoManagerObj.undoStack);
      }, undoManagerObj); 
      // console.log("handlemouseup 1090, after");
      //   console.log("undoStack.length",undoManagerObj.undoStack.length);
      //   console.log("redoStack.length", undoManagerObj.redoStack.length);
      
      newLine = null;
      id = uuidv4();
    }
    else if(tool === Tools.CURSOR){
      if(isSelected.current){
        isSelected.current = false;
        if (!selectionRectangle.visible()) {
          return;
        }
        
        //e.evt.preventDefault();
        selectionRectangle.visible(false);
        selectionRectangle.destroy();
        var shapes = stageRef.current.find('Shape, Line, Text, Group');
        var box = selectionRectangle.getClientRect();
        
        const rowSelected:Konva.Node[] = shapes.filter((shape:any) =>
          Konva.Util.haveIntersection(box, shape.getClientRect())
        );

        let selected:any[] = [];
        let locksData:string[] = [];
        let rotationFlag = true;
        if(groupTr == null){
          createNewTr(); 
        }

        if(groupTr){
          
          rowSelected.forEach((node)=>{
            const nodeId:string = node.id();
            if(!nodeId.includes("area-") && !node.hasName('locked')){
              node.addName("locked");
              selected.push(node);
              locksData.push(nodeId);
              if(node.getClassName() == Shape.Group){
                rotationFlag = false;
              }
            }
          })
          if(selected.length > 0){
            groupTr.nodes(selected);
            groupTr.rotateEnabled(rotationFlag);
            
            const selectionRect = groupTr.getClientRect();

            // 선택 영역 정보를 절대 좌표계로 변환하여 저장
            const absoluteSelectionInfo = {
              x     : (selectionRect.x - position.x) / scale,
              y     : (selectionRect.y - position.y) / scale ,
              width : selectionRect.width / stageRef.current.scaleX(),
              height: selectionRect.height / stageRef.current.scaleY(),
            };
            
            ySelectedNodes.set(userId.current, absoluteSelectionInfo);
            yLockNodes.set(userId.current, JSON.stringify(locksData));
          }
        }
        
      } else {
        if(leaveEvtFlag) return;
        
        if(isTrans || isDrag) return ;
        
        const selected = e.target
        if(groupTr == null){
          createNewTr();
        } 
        if(groupTr){
          if(groupTr.nodes().length < 2){
            
            groupTr.nodes([selected]);
          }
        }
      }
    }
    else if(tool === Tools.HAND){
      e.target.container().style.cursor = 'grab';
      if(isHand){
        isHand.current = false;
        stageRef.current.draggable(false)
      }
    }
  };

  const handleMouseClick = (e: any) => {
    const stage = e.target.getStage()
    const pos = stage.getPointerPosition();
    const layers = stage.getLayers();
    const layer = layers[0];
    const scale = stage.scaleX(); // 현재 스케일
    const position = stage.position(); // 현재 위치
    const idx = "obj_Id_"+(id).toString()
    
    const defaultColor = currentColorRef.current;

    const realPointerPosition = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };
    
    const shapeOptions = {
      x: realPointerPosition.x,
      y: realPointerPosition.y,
    }

    
    if(tool === Tools.STAMP){
      let stampImg = new window.Image();
      stampImg.src = clickedIconBtn === 'thumbUp' ? thumbUpImg : thumbDownImg;
      let konvaData : any;
      
      
      stampImg.onload = () => {
        
        /* 클릭 위치에 스탬프 찍기 */
        const newStamp = createNewStamp(idx, shapeOptions, stampImg);
        if(clickedIconBtn){
          newStamp.name(clickedIconBtn);
        }
        konvaData = {
          id        : newStamp.id(),
          type      : Shape.Stamp,
          x         : newStamp.x(),
          y         : newStamp.y(),
          width     : newStamp.width(),
          height    : newStamp.height(),
          image     : clickedIconBtn,
          userId    : userId,
          draggable : true
        }
        layer.add(newStamp);
        
        yShape.set(idx, konvaData);

        // console.log("handlemouseclick 2074, before");
        // console.log("undoStack.length",undoManagerObj.undoStack.length);
        // console.log("redoStack.length", undoManagerObj.redoStack.length);

        yDocRef.current.transact(() => {
          yObjects.set(idx, konvaData);
        }, undoManagerObj);
        //console.log(undoManagerObj.undoStack, "2000, ");

        // console.log("handlemouseclick 2083, before");
        // console.log("undoStack.length",undoManagerObj.undoStack.length);
        // console.log("redoStack.length", undoManagerObj.redoStack.length);
        
        
        
      }
      
      id = uuidv4();
      setTool(Tools.CURSOR);
    }
    else if (tool === Tools.SHAPE){
      let newShape;
      let konvaData : any;
      
      if (clickedIconBtn === 'rect'){
        newShape = createNewRect(idx, shapeOptions, defaultColor)

        konvaData = {
          id        : newShape.id(),
          type      : Shape.Rect,
          x         : newShape.x(),
          y         : newShape.y(),
          width     : newShape.width(), 
          height    : newShape.height(),
          fill      : defaultColor,
          userId    : userId,
          draggable : true,
        }
      }
      else if (clickedIconBtn === 'cir') {
        newShape = createNewCir(idx, shapeOptions, defaultColor)

        konvaData = {
          id        : newShape.id(),
          type      : Shape.Circle,
          x         : newShape.x(),
          y         : newShape.y(),
          width     : newShape.width(), 
          height    : newShape.height(),
          fill      : defaultColor,
          userId    : userId,
          draggable : true
        }
      }
      else if (clickedIconBtn === 'tri') {
        newShape = createNewTri(idx, shapeOptions, defaultColor)
        konvaData = {
          id        : newShape.id(),
          type      : Shape.RegularPolygon,
          x         : newShape.x(),
          y         : newShape.y(),
          sides     : newShape.sides(),
          radius    : newShape.radius(),
          fill      : defaultColor,
          userId    : userId,
          draggable : true
        }
      }
      layer.add(newShape);
      yShape.set(idx, konvaData);

      // console.log("handlemouseclick 2135, before");
      //   console.log("undoStack.length",undoManagerObj.undoStack.length);
      //   console.log("redoStack.length", undoManagerObj.redoStack.length);

      yDocRef.current.transact(() => {
        yObjects.set(idx, konvaData);
      }, undoManagerObj);
        //console.log(undoManagerObj.undoStack, yObjects);    //TEST
        // console.log("handlemouseclick 2143, after");
        // console.log("undoStack.length",undoManagerObj.undoStack.length);
        // console.log("redoStack.length", undoManagerObj.redoStack.length);
    
    
    

      id = uuidv4();
       setTool(Tools.CURSOR);
    } 
    else if (tool === Tools.TEXT) {
      
      var textNode:Konva.Text = createNewText(idx, realPointerPosition, "", defaultColor);
      const konvaData = {
        id       : textNode.id(),
        text     : textNode.text(),
        x        : textNode.x(),
        y        : textNode.y(),
        fill     : textNode.fill(),
        fontSize: textNode.fontSize(),
        draggable: true,
        width: textNode.width(),
        userId    : userId,
      }
      layer.add(textNode);

      
      yText.set(idx, konvaData);
      yDocRef.current.transact(() => {
      yObjects.set(idx, konvaData);
    }, undoManagerObj); 
  
    
      
      id = uuidv4();
      //setTool(Tools.CURSOR);
    }
    else if (tool === Tools.POSTIT) {
      const postItGroup = createNewPostIt(idx, realPointerPosition, "");

      const konvaData = {
        type  : Shape.Group,
        Group : {
          id        : postItGroup.id(),
          x         : postItGroup.x(),
          y         : postItGroup.y(),
          width     : postItGroup.width(),
          height     : postItGroup.height(),
          draggable : true,
          userId    : userId,
        },
        Rect  : {},
        Text  : {
          text      : "",
        } 
      }

      layer.add(postItGroup);

      yDocRef.current.transact(() => {
        yShape.set(idx, konvaData);
      
        yObjects.set(idx, konvaData)
      }, undoManagerObj);

      setTool(Tools.CURSOR);
    };    
  }

  const handleMouseWheel = (e: any) => {
    //e.evt.preventDefault();
    const stage = e.target.getStage();

    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    var scaleBy = 1.1;

    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let direction = e.evt.deltaY > 0 ? 1 : -1;

    if (e.evt.ctrlKey) {
      direction = -direction;
    }

    var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);  
  };

  const handleMouseEnter = (e:any)=>{
    const stage = e.target.getStage();
    if(tool === Tools.HAND){
      stage.container().style.cursor = 'grab';
    } else {
      stage.container().style.cursor = 'default';
    }
  }

  const handleMouseLeave = (e:any)=>{
    
    handleMouseUp(e);

    // if(groupTr != null){
    //   groupTr.destroy();
    //   groupTr = null;
    // }

  }


  // const handleUndo = useCallback(() => {
  //    undoManagerObj?.undo();
  //    undoManagerMindMap?.undo();
 
  // }, [undoManagerObj, undoManagerMindMap]);
  
  const handleUndo = () => {
    //console.log(yObjects);
    console.log("before undo", undoManagerObj, undoManagerObj?.undoStack, undoManagerObj?.undoStack.length, yObjects);
    console.log(undoManagerObj?.undoStack.length, "undostack length");
    console.log(undoManagerObj?.redoStack.length, "redostack length");
    console.log(yObjects, "yObject before!!!!");
    undoManagerObj?.undo();
    //undoManagerMindMap?.undo();


    // yObjects.observe((event) => {
    //   console.log("undo then change event", event);
    // })
    console.log("after undo", undoManagerObj, undoManagerObj?.undoStack, undoManagerObj?.undoStack.length, yObjects);
    console.log(undoManagerObj?.undoStack.length, "undostack length");
    console.log(undoManagerObj?.redoStack.length, "redostack length");
    console.log(yObjects, "yObject after!!!!");
  }

  const handleRedo = () => {
    console.log("before redo", undoManagerObj, undoManagerObj?.redoStack, undoManagerObj?.undoStack.length);
    console.log(undoManagerObj?.undoStack.length, "undostack length");
    console.log(undoManagerObj?.redoStack.length, "redostack length");
    console.log(yObjects, "yObject before!!!!");
    undoManagerObj?.redo();
    //undoManagerMindMap?.redo();

    console.log("after redo", undoManagerObj, undoManagerObj?.redoStack, undoManagerObj?.undoStack.length);
    console.log(undoManagerObj?.undoStack.length, "undostack length");
    console.log(undoManagerObj?.redoStack.length, "redostack length");
    console.log(yObjects, "yObject after!!!!");
  }

  


  return (
    <>
    <div style={{position: "relative", width: "100%"}}>
      {/* <NavBarLobby /> */}
      {/* <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button> */}

      {/* <VoiceChat /> */}
      
      <NavBarRoom stageRef = {stageRef} />

      <Stage
        width        = {window.innerWidth}
        height       = {window.innerHeight}
        onMouseEnter = {handleMouseEnter}
        onMouseLeave = {handleMouseLeave}
        onMouseDown  = {handleMouseDown}
        onTouchStart = {handleMouseDown}
        onMouseMove  = {handleMouseMove}
        onTouchMove  = {handleMouseMove}
        onMouseUp    = {handleMouseUp}
        onTouchEnd   = {handleMouseUp}
        onClick      = {handleMouseClick}
        onWheel      = {handleMouseWheel}
        draggable    = {false}
        ref          = {stageRef}
      >
      
        <Layer></Layer>

        <>
          <MindMap stageRef = {stageRef} toolRef={toolRef} yDocRef = {yDocRef}/>
        </>

      </Stage>
      <ButtonCustomGroup handleIconBtnClick={handleIconBtnClick} handleUndo={handleUndo} handleRedo={handleRedo}/>
    </div>
    </>
  );
}

export default App;