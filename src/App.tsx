import { 
  FC
  , useState
  , useRef
  , useEffect 
} from 'react';
import { Stage, Layer, Line, Text, Group } from 'react-konva';
import { ButtonCustomGroup } from './component/ButtonCustomGroup';

import { useTool } from './component/ToolContext';
import { ColorProvider } from './component/ColorContext';

import { Tools } from './component/Tools';

//import Stamp from './component/Stamp';

import thumbUpImg from './assets/thumbup.png';
import thumbDownImg from './assets/thumbdown.png'

import "./index.css"

//import EditableText from "./component/EditableText";

//-----------CRDT---------------------
import * as Y from "yjs";
//import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";
import Konva from 'konva';
import { uuidv4 } from 'lib0/random.js';
import {TextInputProps} from './component/TextEditor';
//import { FastLayer } from 'konva/lib/FastLayer';
import { Shape } from './component/UserShape';
//import { set } from 'lodash';
import VoiceChat from './component/voicechat/voicechat';
//import { number } from 'lib0';
//import MindMap from './component/MindMap';

let multiSelectBlocker = {
  x1:0,
  y1:0,
  x2:0,
  y2:0,

}//블록 하는 좌표
let groupTr:Konva.Transformer | null = null;
//Container Components
const App: FC = () => {

  const { tool, setTool } = useTool();
  //const [tool, setTool] = useState<string>('pen');
  //const [currentColor, setCurrentColor] = useState<string>('#000000');
  //const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [clickedIconBtn, setClickedIconBtn] = useState<string | null>(null);

  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const [, setIsLoading] = useState(true);

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
  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  
  //Pen 동작 저장
  const yPens = yDocRef.current.getMap('pens');
  //Shape 저장
  const yShape = yDocRef.current.getMap('shape');
  //Trans 동작 저장
  const yTrans = yDocRef.current.getMap('trans');
  //Drag move 동작 저장
  const yMove = yDocRef.current.getMap('move');
  
  //Pen 객체 전체 저장
  const yObjects = yDocRef.current.getMap('objects');

  const yTextRef = useRef<Y.Array<TextInputProps>>(yDocRef.current.getArray<TextInputProps>('texts'));
  
  //블록 변수
  let selectionRectangle:Konva.Rect = new Konva.Rect();

  
  //임시 UserId
  const userId = useRef("");
  const setUserId = (param:string)=>{
    userId.current = param
  }
  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current);
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['wss://192.168.1.103:1235'] });
    const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['wss:///www.jungleweb.duckdns.org:1235'] });
    
      

    // Y.js에 저장된 것들 감시하고 업데이트 되면 캔버스에 그리기
    yPens.observe(() => {
      yPens.forEach((konvaData:any, index:string)=>{
        
        const node:any = stageRef.current.children[0].findOne("#"+index)
        if(konvaData.type === 'update' && node != null){
          var newPoints = node.points().concat(konvaData.point);
          node.points(newPoints);
          
        } else if(konvaData.type === 'insert' && node == null){
          const newLine = createNewLine(index, konvaData.points, konvaData.stroke)
          
          stageRef.current.getLayers()[0].add(newLine);
        } 
        yPens.delete(index);
      });  
    })

    yShape.observe(() => {
      yShape.forEach((konvaData:any, index:string)=>{
        const node = stageRef.current.children[0].findOne("#"+index)
        let newShape:any;
        console.log(node)
        if(node) return;
        if(konvaData.type === Shape.Stamp){
          let stampImg = new window.Image();
          stampImg.src = konvaData.image === 'thumbUp' ? thumbUpImg : thumbDownImg;
    
          stampImg.onload = () => {
            
            const newStamp = createNewStamp(index, {x: konvaData.x, y: konvaData.y}, stampImg)
            newStamp.name(konvaData.image)
            stageRef.current.getLayers()[0].add(newStamp);
          }
          yShape.delete(index);    
        }
        else {
          if(konvaData.type === Shape.Rect){
            newShape = createNewRect(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)

          } else if(konvaData.type === Shape.Circle){
            newShape = createNewCir(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)
            
          } else if(konvaData.type === Shape.RegularPolygon){
            newShape = createNewTri(index, {x: konvaData.x, y: konvaData.y}, konvaData.fill)
          }
          stageRef.current.getLayers()[0].add(newShape);
          yShape.delete(index);
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


    // 초기화 함수 정의
    const initializeCanvas = () => {
      yObjects.forEach((konvaData:any, index:string) => {
        
        const node = stageRef.current.children[0].findOne("#"+index)
        if(node) return;
        if(konvaData == null) return;
        if(konvaData.type == Shape.Line){
          const newLine =  createNewLine(index, konvaData.points, konvaData.stroke)
          newLine.visible(false)
          stageRef.current.getLayers()[0].add(newLine);
          newLine.move({x:konvaData.x, y:konvaData.y});
  
          newLine.scaleX(konvaData.scaleX)
          newLine.scaleY(konvaData.scaleY)
          newLine.rotation(konvaData.rotation)
          newLine.visible(true);
        } else {
          
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
        }

        
      });
    };
    
    const handleDataLoaded = () => {
      
      setIsLoading(false);
      initializeCanvas();
      yObjects.unobserve(handleDataLoaded);
    };

    yObjects.observe(handleDataLoaded);

    //yObjects.observe(initializeCanvas);

    // if (!dataLoaded.current) {
    //   //yObjects.size > 0 && 
    //   initializeCanvas();
    //   dataLoaded.current = true; // 데이터 로드 완료 상태로 설정
    // }

    yTextRef.current.observe(() => {
      setTextInputs(yTextRef.current.toArray());
    });

    return () => {
      provider.destroy();
      yDocRef.current.destroy();
    };
  }, []);

  

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  
  let newLine : Konva.Line | null = null;

  let id = uuidv4(); //객체 고유 ID

  const createNewLine = (idx:string, pos:number[], color:any) =>{
    const newLine = new Konva.Line({
      id : idx,
      points: pos,
      stroke: color,
      strokeWidth: 5,
      lineCap: 'round',
      lineJoin: 'round',
      draggable   : true
    });
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
  
  const createNewTr = ()=>{
    //if (groupTr != null) return;
    const tr = new Konva.Transformer();
    tr.on('dragstart', function() {
      isDrag.current = true;
    });
    tr.on('dragmove', function() {
      tr.getNodes().forEach((node:any)=>{        
        const changeInfo = {
          idx : node.id(),
          x   : node.x(),
          y   : node.y(),
          userId : userId.current
        }
        yMove.set(node.id(), changeInfo);
      });

    });
    tr.on('dragend', function() {
      isDrag.current = false;
      let type:any;
      let konvaData:any;
      tr.getNodes().forEach((node:any)=>{
        type = node.getClassName()
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

        yObjects.set(node.id(), konvaData)
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

    });
    tr.on('transformend', function() {
      isTrans.current = false;
      let type:Shape;
      let konvaData:any;
      tr.getNodes().forEach((node:any)=>{
        type = node.getClassName()
        if (type === Shape.Line){
          konvaData = {
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
            draggable   : true,
          }
        } else if(type === Shape.RegularPolygon){
          konvaData = { 
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

        yObjects.set(node.id(), konvaData)
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

        e.evt.preventDefault();
        //블록(다중 선택하는 영역) 기능
        if(groupTr != null){
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
      
    } else if (tool === Tools.TEXT) {
      
      var textNode:any = new Konva.Text({
        id : idx,
        text: 'Some text here',
        x: realPointerPosition.x,
        y: realPointerPosition.y,
        fontSize: 20,
        draggable: true,
        width: 200,
      });

      layer.add(textNode);

      textNode.on('transform', function () {
        // reset scale, so only with is changing by transformer
        textNode.setAttrs({
          width: textNode.width() * textNode.scaleX(),
          scaleX: 1,
        });
      });

      const canvasClickHandler = (e:any) => {
        if (e.target === textNode) {
          // 텍스트 노드 클릭 시 아무 동작도 하지 않음
          return;
        }
        // 텍스트 노드 이외 클릭 시 Transformer 숨김
        // 이벤트 리스너 제거
        stageRef.current.off('click tap', canvasClickHandler);
      };
      // 캔버스에 클릭 이벤트 리스너 추가
      stageRef.current.on('click tap', canvasClickHandler);

      textNode.on('click tap', () => {
        stageRef.current.on('click tap', canvasClickHandler);
      })

      textNode.on('dblclick dbltap', () => {
        textNode.hide();

        var textPosition = textNode.absolutePosition();

        var areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
        };

        var textarea = document.createElement('textarea');
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

        function removeTextarea() {
          if(!textarea.parentNode) return;
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          textNode.show();
          // tr.show();
          // tr.forceUpdate();
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

        textarea.addEventListener('keydown', function (e) {
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
      setTool(Tools.CURSOR)

    } else if (tool === Tools.PEN) {
      const color = 'black' //임시 컬러
      //펜 이벤트
      isDrawing.current = true;
      
      newLine = createNewLine(idx, [realPointerPosition.x, realPointerPosition.y], color)

      layer.add(newLine);

      const changeInfo = {
        type: "insert",
        point: [realPointerPosition.x, realPointerPosition.y],
        stroke : color
      };
      yPens.set(idx, changeInfo);

    } else if (tool === Tools.HIGHLIGHTER) {
      //형광펜 이벤트
      isDrawing.current = true;

      newLine = new Konva.Line({
        points      : [realPointerPosition.x, realPointerPosition.y],
        stroke      : 'black',
        strokeWidth : 15,
        tension     : 0.5,
        lineCap     : "butt",
        lineJoin    : "round",
        opacity     : 0.4,
        draggable   : true
      });
      layer.add(newLine);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();

    const pos = stage.getPointerPosition();
    const scale = stage.scaleX(); // 현재 스케일
    const position = stage.position(); // 현재 위치
    
    const realPointerPosition = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale,
    };

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
        point: [realPointerPosition.x, realPointerPosition.y]
      };
      yPens.set(idx, changeInfo);
    }
  };

  const handleMouseUp = (e:any) => {
    const leaveEvtFlag:boolean = e.evt.type === 'mouseleave'? true:false
    if(tool === Tools.PEN){
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
        lineJoin  : newLine.lineJoin(),
      }
      yObjects.set(idx, konvaData)
      
      newLine = null;
      id = uuidv4();
    }
    else if(tool === Tools.CURSOR){
      if(isSelected.current){
        isSelected.current = false;
        if (!selectionRectangle.visible()) {
          return;
        }

        
        e.evt.preventDefault();
        // update visibility in timeout, so we can check it in click event
        selectionRectangle.visible(false);
        selectionRectangle.destroy();
        var shapes = stageRef.current.find('Shape, Line, Text');
        var box = selectionRectangle.getClientRect();
        
        const selected = shapes.filter((shape:any) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        
        if(groupTr == null){
          createNewTr(); 
        }
        if(groupTr){
          groupTr.nodes(selected);
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
      /*
      groupTr.getNodes().forEach((node:any) => {
        node.draggable(true);
      });
      */
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
    
    const defaultColor = 'black';

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
      let konvaData;
      

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
        
        yObjects.set(idx, konvaData);
      }
      
      id = uuidv4();
      setTool(Tools.CURSOR);
    }
    else if (tool === Tools.SHAPE){
      let newShape;
      let konvaData;

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
        newShape = createNewTri(idx, shapeOptions, 'black')
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
    
      yObjects.set(idx, konvaData)


      id = uuidv4();
      setTool(Tools.CURSOR);
    } 
    else if(tool === Tools.CURSOR){

    }
    else if (tool === Tools.POSTIT) {
      let PostItGroup = new Konva.Group({
        x: realPointerPosition.x,
        y: realPointerPosition.y,
        draggable: true,
      });

      const postItOptions = {
        x: 0,
        y: 0,
      }

      let PostItRect = new Konva.Rect({
        ...postItOptions,
        width: 250, // init size
        height: 300,  // init size
        fill: '#FFD966',
        shadowColor: 'black',
        shadowBlur: 15,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
        shadowOpacity: 0.2,
      });
      
      let PostItText: any = new Konva.Text({
        // id : idx,
        ...postItOptions,
        text: '',
        fontSize: 20,
        width: PostItRect.width(),
        height: PostItRect.height(),
        padding: 15,
      });

      let initText = new Konva.Text({
        ...postItOptions,
        text: 'Type anything! And also everyone in the meeting can vote on your topic by stamp👍🏽👎🏽',
        fontSize: 20,
        opacity: 0.4,
        width: PostItRect.width(),
        padding: 15,
      });

      PostItGroup.add(PostItRect);
      PostItGroup.add(PostItText);
      PostItGroup.add(initText);
      layer.add(PostItGroup);
      setTool(Tools.CURSOR);
      
      PostItGroup.on('dblclick dbltap', () => {
        initText.hide();

        if (PostItText.text() !== ''){
          PostItText.hide();
        }
        
        var textPosition = PostItText.absolutePosition();
        
        var areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
        };
        
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = PostItText.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = PostItText.width() - PostItText.padding() * 2 + 'px';
        // textarea.style.height = PostItText.height() - PostItText.padding() * 2 + 'px';
        textarea.style.fontSize = PostItText.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '15px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        // textarea.style.background = 'gray';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = PostItText.lineHeight();
        textarea.style.fontFamily = PostItText.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = PostItText.align();
        textarea.style.color = PostItText.fill();

        const rotation = PostItText.rotation();
        var transform = '';

        if (rotation) {
          transform += 'rotateZ(' + rotation + 'deg)';
        }

        var px = 0;
        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          px += 2 + Math.round(PostItText.fontSize() / 20);
        }

        transform += 'translateY(-' + px + 'px)';
        textarea.style.transform = transform;
        
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        function setTextareaWidth(newWidth: any) {
          if (!newWidth) {
            // set width for placeholder
            newWidth = PostItText.placeholder.length * PostItText.fontSize();
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
          scale = PostItText.getAbsoluteScale().x;
          setTextareaWidth(PostItText.width() * scale - PostItText.padding() * 2);
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + PostItText.fontSize() + 'px';
         
          // todo: PostItRect height 증가
          console.log(textarea.style.height);
          let textareaHeight = (parseInt(textarea.style.height.slice(0, -2)) as any);
          console.log(textareaHeight);
          if (textareaHeight > PostItRect.height) {
            PostItRect.height = textareaHeight;
            layer.batchDraw();  // 조건 만족할 때 PostItRect 사라짐
          }
          
          const key = e.key.toLowerCase();
          if (key == 'esc' || key == 'escape') {
            PostItText.text(textarea.value);
            PostItText.show();
            textarea.remove();
            stage.off('mouseup', handleOutsideClick);
          }
        });

        function handleOutsideClick(e: any) {
          if (textarea.value === '') {
            initText.show();
          }

          if (e.target !== textarea) {
            PostItText.text(textarea.value);
            PostItText.show();
            textarea.remove();
            stage.off('mouseup', handleOutsideClick);
          }
        }
        
        if(textarea){
          stage.on('mouseup', handleOutsideClick);
          // PostItText.show();
        }
      });
    }
  };

  const handleMouseWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
;
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

  return (
    <>
    <VoiceChat />
    <div style={{position: "relative", width: "100%"}}>
      <Stage
        width       = {window.innerWidth}
        height      = {window.innerHeight}
        onMouseEnter= {handleMouseEnter}
        onMouseLeave= {handleMouseLeave}
        onMouseDown = {handleMouseDown}
        onTouchStart= {handleMouseDown}
        onMouseMove = {handleMouseMove}
        onTouchMove = {handleMouseMove}
        onMouseUp   = {handleMouseUp}
        onTouchEnd  = {handleMouseUp}
        onClick     = {handleMouseClick}
        onWheel     = {handleMouseWheel}
        draggable   = {false}
        ref         ={stageRef}
      >
      
        <Layer></Layer>
        
      {/* <>
        <MindMap stageRef = {stageRef} currentTool={tool} yDocRef = {yDocRef}/>
      </> */}


      </Stage>
      <ColorProvider>
        <ButtonCustomGroup handleIconBtnClick={handleIconBtnClick} setUserId={setUserId}/>
      </ColorProvider>
    </div>
    </>
  );
}

export default App;