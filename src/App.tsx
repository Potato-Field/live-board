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

import Stamp from './component/Stamp';
import thumbUpImg from './thumbup.png';
import thumbDownImg from './thumbdown.png'

import "./index.css"

import EditableText from "./component/EditableText";

//-----------CRDT---------------------
import * as Y from "yjs";
//import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "y-webrtc";
import Konva from 'konva';
import { uuidv4 } from 'lib0/random.js';
import TextEditor, {TextInputProps} from './component/TextEditor';
import { FastLayer } from 'konva/lib/FastLayer';
import { set } from 'lodash';
//import { number } from 'lib0';


interface BaseData {
  name? : string
  tool : Tools
}

interface LineData extends BaseData {
  points: number[];
}

let multiSelectBlocker = {
  x1:0,
  y1:0,
  x2:0,
  y2:0,

}//블록 하는 좌표

// interface TextInputProps {
//   init: string;
//   x?: number;
//   y?: number;
// }

// interface InputData{
//   id: string;
//   value: string;
// }

// interface ShapeData extends BaseData {
//   color : string
// }


//Container Components
const App: FC = () => {

  const { tool, setTool } = useTool();
  //const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  /*
   * [CRDT] 
   * 2024.01.22
   * 드로잉 동기화 구현
   * 김병철
   */
  const dataLoaded = useRef(false);

  //text 상태 저장
  // const [textInputs, setTextInputs] = useState<TextData[]>([]);
  const [textInputs, setTextInputs] = useState<TextInputProps[]>([]);

  const stageRef = useRef(null);
  const isDrawing = useRef(false);
  const isSelected = useRef(false);
  const isCursor = useRef(false);
  const isHand = useRef(false);

  // Y.js 관련 상태를 useRef로 관리
  const yDocRef = useRef(new Y.Doc());
  
  //Pen 동작 저장
  const yPens = yDocRef.current.getMap('pens');
  
  //Pen 객체 전체 저장
  const yLines = yDocRef.current.getMap('yLines');

  const yTextRef = useRef<Y.Array<TextInputProps>>(yDocRef.current.getArray<TextInputProps>('texts'));
  
  //블록 변수
  let selectionRectangle:Konva.Rect = new Konva.Rect();
  let globalTr:Konva.Transformer | null = null;
  
  //load() 역할을 하는 듯
  useEffect(() => {
    //const provider = new WebsocketProvider('ws://192.168.1.103:1234', 'drawing-room', yDocRef.current)
    //const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://192.168.1.103:1234'] });
    const provider = new WebrtcProvider('drawing-room', yDocRef.current, { signaling: ['ws://localhost:1239'] });
    
      

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
            draggable : true
          });
          stageRef.current.getLayers()[0].add(newLine);
        } 
        yPens.delete(index);
      });  
    })
    
    
    // 초기화 함수 정의
    const initializeCanvas = () => {
      yLines.forEach((lineData:any, idx:string) => {
        const node = stageRef.current.children[0].findOne("#"+idx)
        if(node) return;
        if(lineData == null) return;
        const newLine =  new Konva.Line({
          id : idx,
          points: lineData.points,
          stroke: lineData.stroke,
          strokeWidth: lineData.strokeWidth,
          lineCap: lineData.lineCap,
          lineJoin: lineData.lineJoin,
          draggable : true
        })
        
        stageRef.current.getLayers()[0].add(newLine);
      });
    };
    
    // // 사용자가 처음 접속했을 때 선을 그리는 초기화 함수 호출
    // const checkDataLoaded = () => {
    //   // yLines의 크기가 0보다 크면 데이터가 로드된 것으로 간주
    //   if (!dataLoaded) {
    //     console.log("sync")
    //     console.log(yLines.size)
    //     //yLines.size > 0 && 
    //     initializeCanvas();
    //     setDataLoaded(true); // 데이터 로드 완료 상태로 설정
    //     yLines.unobserve(checkDataLoaded);
    //   }
    // };
    
    yLines.observe(initializeCanvas);
    
    // checkDataLoaded();

    if (!dataLoaded.current) {
      //yLines.size > 0 && 
      initializeCanvas();
      dataLoaded.current = true; // 데이터 로드 완료 상태로 설정
      yLines.unobserve(initializeCanvas);
    }

    yTextRef.current.observe(() => {
      setTextInputs(yTextRef.current.toArray());
    });

    return () => {
      //yLinesRef.current.unobserveDeep(updateLayer);
      provider.destroy();
      yDocRef.current.destroy();
      //yLines.unobserve(checkDataLoaded);
    };
  }, []);

  
  let newLine : Konva.Line | null = null;

  let id = uuidv4(); //객체 고유 ID



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

    const idx:string = "lineIdx_"+(id).toString()
    if(tool === Tools.HAND){
      if (e.target === stage){
        stage.container().style.cursor = 'grabbing';
        //Hand 모드 -> 캔버스 이동
        isHand.current = true;
        stageRef.current.draggable(true)
        
      } 
    }
    else if (tool === Tools.CURSOR){
      if(e.target === stage){

        e.evt.preventDefault();
        //블록(다중 선택하는 영역) 기능
        if(globalTr != null){
          globalTr.nodes([]);
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
    }
    else if (tool === Tools.TEXT) {
      /*
      const newText: TextInputProps = { init: 'Text Click', x: pos.x, y: pos.y, isEditing: false };
      setTextInputs(prev => [...prev, newText]);
      yTextRef.current.push([newText]);
      console.log(textInputs);
      setTool(Tools.MINDMAP);                  //추가 수정해야 됨
      */
      
      //---------리뉴얼--------
      var textNode:any = new Konva.Text({
        id : idx,
        text: 'Some text here',
        x: pos.x,
        y: pos.y,
        fontSize: 20,
        draggable: true,
        width: 200,
      });

      layer.add(textNode);

      // var tr = new Konva.Transformer({
      //   node: textNode,
      //   enabledAnchors: ['middle-left', 'middle-right'],
      //   // set minimum width of text
      //   boundBoxFunc: function (oldBox, newBox) {
      //     newBox.width = Math.max(30, newBox.width);
      //     return newBox;
      //   },
      // });

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
        //tr.hide();
        // 이벤트 리스너 제거
        stageRef.current.off('click tap', canvasClickHandler);
      };
      // 캔버스에 클릭 이벤트 리스너 추가
      stageRef.current.on('click tap', canvasClickHandler);

      //layer.add(tr);


      textNode.on('click tap', () => {
        //tr.show();
        stageRef.current.on('click tap', canvasClickHandler);
      })

      textNode.on('dblclick dbltap', () => {
        // hide text node and transformer:
        textNode.hide();
        //tr.hide();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = textNode.absolutePosition();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
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
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
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
          tr.show();
          tr.forceUpdate();
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

        textarea.addEventListener('keydown', function (e) {
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
      
        //펜 이벤트
        isDrawing.current = true;
        
        newLine = new Konva.Line({
          id : idx,
          points: [realPointerPosition.x, realPointerPosition.y],
          stroke: 'black',
          strokeWidth: 5,
          lineCap: 'round',
          lineJoin: 'round',
          draggable   : true
        });
        layer.add(newLine);

        const changeInfo = {
          type: "insert",
          point: [realPointerPosition.x, realPointerPosition.y]
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
    const layers = stage.getLayers();
    const layer = layers[0];
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
      
      const idx = "lineIdx_"+(id).toString()

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
        /*
        selected.forEach((node:any) => {
          node.draggable(true);
          node.on('dragstart', (e:any) => {
            e.cancelBubble = true;
          });
        
        });
        */
        if(globalTr == null){
          globalTr = new Konva.Transformer();
          globalTr.on('mousedown touchstart', (e) => {
            e.cancelBubble = true;
          });
          globalTr.nodes(selected);
          e.currentTarget.getLayers()[0].add(globalTr);
        } else {

          globalTr.nodes(selected);
        }
      } else {
        if(leaveEvtFlag) return;
        const selected = e.target
        console.log(Konva.Util.haveIntersection(selected, selected.getClientRect()))
        console.log(e)
        if(globalTr == null){
          globalTr = new Konva.Transformer();
          globalTr.anchorDragBoundFunc = (oldPos: any, newPos: any, e: any)=>{

          }
          globalTr.on('mousedown touchstart', (e) => {
            e.cancelBubble = true;
          });
          globalTr.nodes([selected]);
          e.currentTarget.getLayers()[0].add(globalTr);
        } else {
          if(globalTr.nodes().length < 2){
            
            globalTr.nodes([selected]);
          }
        }
      }
        
      return;
    }
    else if(tool === Tools.HAND){
      e.target.container().style.cursor = 'grab';
      if(isHand){
        isHand.current = false;
        stageRef.current.draggable(false)
      }
    }

    id = uuidv4();
  };

  const handleMouseClick = (e: any) => {
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

    if (tool === Tools.STAMP) {
      const stampType = e.currentTarget.id;
      let stampImg = new window.Image();
      stampImg.src = stampType === 'thumbUp' ? thumbUpImg : thumbDownImg;
      
      stampImg.onload = () => {
        setImage(stampImg);
        isSelected.current = true;
      }

      /* 클릭 위치에 스탬프 찍기 */
      if (isSelected.current) {
        const newStamp = new Konva.Image({
          x: realPointerPosition.x,
          y: realPointerPosition.y,
          image: stampImg,
        });
        isSelected.current = false;
        layer.add(newStamp);
      }
    } 
    else if(tool === Tools.CURSOR){

    }
  };

  const handleMouseWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const layers = stage.getLayers();
    const layer = layers[0];
    var oldScale = stage.scaleX();
    var pointer = stage.getPointerPosition();
    var scaleBy = 1.1;

    var mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;

    // when we zoom on trackpad, e.evt.ctrlKey is true
    // in that case lets revert direction
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
    const stage = e.target.getStage();
    handleMouseUp(e);

    if(globalTr != null){
      globalTr.destroy();
      globalTr = null;
    }

  }

  return (
    <div style={{position: "relative", width: "100%"}}>
      <Stage
        width       = {window.innerWidth}
        height      = {window.innerHeight}
        onMouseEnter= {handleMouseEnter}
        onMouseLeave= {handleMouseLeave}
        onMouseDown = {handleMouseDown}
        onMouseMove = {handleMouseMove}
        onMouseUp   = {handleMouseUp}
        onClick     = {handleMouseClick}
        onWheel     = {handleMouseWheel}
        draggable   = {false}
        ref         ={stageRef}
      >
      
      <Layer></Layer>

      <Layer>
        <TextEditor textInputs={textInputs} setTextInputs={setTextInputs} yTextRef={yTextRef} yDocRef = {yDocRef} />
      </Layer>

      </Stage>
      <ColorProvider>
        <ButtonCustomGroup />
      </ColorProvider>
    </div>
  );
}

export default App;