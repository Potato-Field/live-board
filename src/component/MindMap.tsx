import React, {useRef, useEffect} from 'react';
import Konva from 'konva';
import { Tools } from './Tools';
import {Target} from './Target'
// import {Connector} from './Connector'

import * as Y from "yjs";
// import { layer } from '@fortawesome/fontawesome-svg-core';
// import { now } from 'lodash';
import "./contextMenu.css";


type SummaryNode = {
  id: string;
  value: string;
  priority: number;
}
  

//  export const undoManagerObjRef = useRef<Y.UndoManager | null>(null);
//  export const undoManagerObj = undoManagerObjRef.current;

//const MindMap = forwardRef((ref: RefObject<Konva.Stage>) => {
export const MindMap = (({ stageRef, toolRef, yDocRef, yTargets, yConnectors, undoManagerObj}: { stageRef: React.RefObject<Konva.Stage>, toolRef: any
, yDocRef: React.MutableRefObject<Y.Doc>, yTargets:any , yConnectors:any, undoManagerObj:any}) => {
    //console.log(yDocRef)
    // const [nodeTargets, setNodeTargets] = useState<Target[]>([]);
    // const [connectors, setConnectors] = useState<Connector[]>([]);
    //const toolRef.current = toolRef.current;
   //console.log(toolRef.current, Tools.MINDMAP);

    const layerRef = useRef<Konva.Layer>();

    useEffect(() => {
      if (stageRef.current && !layerRef.current) {
          let layer = stageRef.current.getLayers()[0];
          if (!layer) {
              layer = new Konva.Layer();
              stageRef.current.add(layer);
          }
          layerRef.current = layer;
      }
  }, [stageRef]);
 
    /*************************************************** */

    useEffect(() => {
      if (stageRef.current) {
          stageRef.current.on('click', () => {
            //console.log(toolRef.current, toolRef.current, toolRef, "Tool now");
              if (toolRef.current === Tools.MINDMAP && yTargets.size === 0) {
                  const stage = stageRef.current;
                  const pointerPosition = stage?.getPointerPosition();
  
                  if (stage && pointerPosition) {
                      const newNodeId = `target-${yTargets.size}`;
                      const newNode = {
                          id: newNodeId,
                          x: pointerPosition.x,  
                          y: pointerPosition.y,  
                          value: "new-node",
                          childIds: [],
                      };
                      yDocRef.current.transact(() => {
                        yTargets.set(newNodeId, newNode);
                      }, undoManagerObj);
                  }
              }
          });
      }
    });

    useEffect(() => {
      const stage = stageRef.current; 
      if (stage) {
        const clickHandler = (e:any) => {
          if (e.target === stage) {
            document.querySelectorAll('.context-menu').forEach(menu => {
              if(menu){
                (menu as HTMLElement).style.display = 'none';
              }
            });
          }
        };

        stage.on('mousedown', clickHandler);
        return () => {
          stage.off('mousedown', clickHandler);
        };
      }
    }, [stageRef]); 
    


    const handleClick = (event:any) => {
      // console.log("!!!!targets, and connectors", yTargets, yConnectors, yTargets._map.size, yConnectors._map.size);
      // console.log(yTargets.size, yConnectors.size);
      if(event){
        //console.log(makeTextTravel());
      }
        if (toolRef.current === Tools.MINDMAP && yTargets.size === 0) {
            const stage = stageRef.current;
            const pointerPosition = stage?.getPointerPosition();
            if (stage && pointerPosition) {
                const newNodeId = `target-${yTargets.size}`;
                const newNode = {
                    id: newNodeId,
                    x: pointerPosition.x,
                    y: pointerPosition.y,
                    value: "new-node",
                    childIds: [],
                };
                yDocRef.current.transact(() => {
                  yTargets.set(newNodeId, newNode);

                }, undoManagerObj);
            }
        }
    };


    const addNewCircleAndConnector = (targetId:string) => {
      const baseTarget = yTargets.get(targetId);
      if (!baseTarget) return;
  
      const nowCircle = layerRef.current?.findOne('#' + targetId);
      const nowRadius = nowCircle?.attrs.radius;
      let randomX = Math.random() * (nowRadius * 5); // Example random range
      let randomY = Math.random() * (nowRadius * 5); // Example random range

      if(randomX < nowRadius*2 && randomY < nowRadius*2){
        randomX += nowRadius*2;
        randomY += nowRadius*2;

      }

      const dx = [1, 1, -1, -1];
      const dy = [1, -1, 1, -1];
  
      const quadrant = yTargets._map.size % 4;
      randomX *= dx[quadrant];
      randomY *= dy[quadrant];
  
      const newX = baseTarget.x + randomX;
      const newY = baseTarget.y + randomY;
      
      const generateRandomId = (prefix:any) => `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  
      const newTargetId = generateRandomId(`target-${yTargets.size}`);
      const newTarget = { id: newTargetId, x: newX, y: newY, value: `new-node${yTargets.size}`, childIds: [] };

      yDocRef.current.transact(() => {

        yTargets.set(newTargetId, newTarget);
      }, undoManagerObj);

      //child target id 추가하는 부분
      const updatedTarget = {
        ...baseTarget, 
        childIds: [...baseTarget.childIds, newTargetId]
      };

      yDocRef.current.transact(() => {

        yTargets.set(targetId, updatedTarget);
      }, undoManagerObj);

  
      const newConnectorId = generateRandomId(`connector-${yConnectors.size}`);
      const newConnector = { id: newConnectorId, from: targetId, to: newTargetId };
      yConnectors.set(newConnectorId, newConnector);
        
    };




    //double click 시 textarea 생성 
    const handleCircleClick = (event: any, targetId: string) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
    
      const textAreaId = `textarea-${targetId}`;
      let textArea = document.getElementById(textAreaId) as HTMLTextAreaElement;
    
      const setupTextArea = (textArea: HTMLTextAreaElement, targetValue: string, position: {x: number, y: number}) => {
     
          textArea.value = targetValue;
          textArea.style.fontSize = '25px';
          textArea.style.position = 'absolute';
          textArea.style.left = position.x + 'px';
          textArea.style.top = position.y + 'px';
          textArea.style.border = 'none';
          textArea.style.padding = '0px'; 
          textArea.style.margin = '0px';
          textArea.style.overflow = 'hidden';
          textArea.style.background = 'none'; 
          textArea.style.outline = 'none';
          textArea.style.resize = 'none';
          textArea.focus();
    
        // 드래그 했을 경우 textarea 위치 변경
        const updateTextAreaPosition = () => {
          const targetText = layerRef.current?.findOne("#text-"+targetId);
          if (targetText) {
            const targetPosition = targetText.absolutePosition();
            textArea.style.left = (stage.container().offsetLeft + targetPosition.x) + 'px';
            textArea.style.top = (stage.container().offsetTop + targetPosition.y) + 'px';
          }
        };
        
    
        updateTextAreaPosition()
        stage.on('dragmove', updateTextAreaPosition);
      };

      if (!textArea) {
        textArea = document.createElement('textarea');
        textArea.id = textAreaId;
        document.body.appendChild(textArea);
    
        textArea.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            const nowTarget = yTargets.get(targetId);
            if(nowTarget){
              yDocRef.current.transact(()=>{
                yTargets.set(targetId, { ...nowTarget, value: textArea.value });

              }, undoManagerObj);
            }
            textArea.parentNode?.removeChild(textArea);
            targetText?.show();
  
          }
        });
      }
    
      const target = yTargets.get(targetId);
      if (!target) {
        console.error("Target not found:", targetId);
        return;
      }
    
      const targetText = layerRef.current?.findOne("#text-"+targetId);
      targetText?.hide();

      const targetTextPosition = targetText?.absolutePosition();
      const areaPos = {
        x: stage.container().offsetLeft + (targetTextPosition?.x ?? 0),
        y: stage.container().offsetTop + (targetTextPosition?.y ?? 0),
      };
      console.log(targetText?.x(), targetText?.y(), areaPos);     //TEST

      setupTextArea(textArea, target.value, areaPos);
    
    };
    



  const makeTextTravel = () => {
    let summaryGroup = layerRef.current?.findOne('#summaryGroup') as Konva.Group;
    if(summaryGroup){
      summaryGroup.destroy();
    }
    
    summaryGroup = new Konva.Group({
        id: 'summaryGroup',
        x: 50,
        y: 50,
        stroke: 'black',
        strokeWidth: 2,
        draggable: true,
    });

    const summaryNodes = new Map<string, SummaryNode>([]);
    const dfs = (targetId:string, depth:number) => {
      const nowTarget = yTargets.get(targetId);
      if(!nowTarget) return;
      summaryNodes.set(targetId, {id: targetId, value: nowTarget.value, priority: depth});
      nowTarget?.childIds.forEach((childId:any) => dfs(childId, depth+1));
    }

    dfs('target-0', 0);   //target id set target-0 should revise this if set many mindmap

    const baseFontSize = 40;
    const decrement = 6;
    const baseFontWeight = 700;
    const fontDecrement = 100;
    let yPosition = 10;

    summaryNodes.forEach((summaryNode) => {
      const fontSize = baseFontSize - (summaryNode.priority * decrement);
      const fontWeight = Math.max(baseFontWeight - (summaryNode.priority * fontDecrement), 1);
      const blanks = '        '.repeat(summaryNode.priority);

      const text = new Konva.Text({
          x: 10,
          y: yPosition,
          text: blanks + '.' + summaryNode.value,
          // text:'.' + summaryNode.value,
          fontSize: fontSize,
          // fontStyle: fontWeight.toString() as Konva.FontStyle,
          fontStyle: fontWeight.toString(),
          fontFamily: 'Arial',
          fill: 'black',
      });
      summaryGroup?.add(text);
      yPosition += text.height() + 10;
    });

    layerRef.current?.add(summaryGroup);
  }


  const deleteTargetDfs = (targetId: string) => {
    const nowTarget = yTargets.get(targetId);
    if(!nowTarget)return;

    if(nowTarget.childIds){
      nowTarget.childIds.forEach((childTargetId:string) => {
        deleteTargetDfs(childTargetId);
      });
    }
  
    deleteTarget(targetId);
  }


  const deleteTarget = (targetId: string) => {
    //console.log("delete before target, connector", yTargets, yConnectors);
    const node = layerRef.current?.findOne('#' + targetId);
    const textNode = layerRef.current?.findOne('#text-'+targetId);
    node?.destroy();
    textNode?.destroy();

    yDocRef.current.transact(() => {

      yTargets.delete(targetId);
    }, undoManagerObj)

    yConnectors.forEach((connector:any, connectorId:any) => {
      if (connector.from === targetId || connector.to === targetId) {
        const line = layerRef.current?.findOne('#' + connectorId);
        line?.destroy();
        yConnectors.delete(connectorId); 
      }
    });

  }




  const updateConnectors = (targetId:string) => {

    yConnectors.forEach((connector:any, connectorId:any) => {
      if (connector.from === targetId || connector.to === targetId) {
        const fromNode = yTargets.get(connector.from);
        const toNode = yTargets.get(connector.to);
        
        if (fromNode && toNode) {
          const foundLine = layerRef.current?.findOne('#' + connectorId) as Konva.Arrow;
          if (foundLine) {
            foundLine.points([fromNode.x, fromNode.y, toNode.x, toNode.y]);
            layerRef.current?.add(foundLine);
          }
        }
      }
    });

  }


  const createMenuItem = (text:any, onClick:any, id:any) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('context-menu-item'); 
    button.addEventListener('click', () => {
      onClick();
      const menu = document.getElementById('contextMenu' + id);
      console.log(menu);
      if (menu) {
        menu.style.display = 'none';
      }
    });
    return button;
  };

  const showContextMenu = (event:any, id:any) => {
    event.evt.preventDefault();
    let menu = document.getElementById('contextMenu' + id);

    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'contextMenu' + id;
      menu.classList.add('context-menu');
      

      menu.appendChild(createMenuItem('생성', () => {addNewCircleAndConnector(id);}, id));
      menu.appendChild(createMenuItem('삭제', () => deleteTargetDfs(id), id));
      menu.appendChild(createMenuItem('요약', () => makeTextTravel(), id));
      menu.appendChild(createMenuItem('취소', () => menu!.style.display = 'none', id));

      document.body.appendChild(menu);
    }

    menu.style.display = 'block';
    menu.style.left = `${event.evt.clientX}px`;
    menu.style.top = `${event.evt.clientY}px`;
  };
  
  
    

  //ytargets, yconnectors observe 시 작동하는 함수 
  const updateCanvas = (e:any) => {
    e.changes.keys.forEach((change:any, key:any) => {
      //console.log(key, change.action);
      if (change.action === 'delete') {
        deleteTarget(key);
      }
    });
    
    yConnectors.forEach((connector:any, id:any) => {
      const foundLine = layerRef.current?.findOne(`#${id}`);
      let line: Konva.Arrow | null = null;
      if (foundLine instanceof Konva.Arrow) {
          line = foundLine;
      } 


      let fromNode = yTargets.get(connector.from);
      let toNode = yTargets.get(connector.to);
      
      if (fromNode && toNode) {
        const points = [fromNode.x, fromNode.y, toNode.x, toNode.y];

        if (!line) {
            line = new Konva.Arrow({
                id: id,
                points: points,
                stroke: 'black',
                fill: 'black',
                strokeWidth: 6,
            });
            line.addName('mindmap');
            layerRef.current?.add(line);
        } 
        else {
            line.points(points);
        }
        if(line){
          line.zIndex(0);
        }
    }
    });

      
      yTargets.forEach((target:any, id:any) => {
        let node = layerRef.current?.findOne(`#${id}`);
        let textNode = layerRef.current?.findOne(`#text-${id}`) as Konva.Text;
        node?.addName('mindmap');
        textNode?.addName('mindmap');

        if (!node) {
            node = new Konva.Circle({
                id: id,
                x: target.x,
                y: target.y,
                // fill:'#f9f9f9',
                fill:'#A9A9A9',
                radius: 70,
                draggable: false,
                opacity: 1,
                //stroke: 'black',
                //strokeWidth: 2,
            });
            node.addName('mindmap');
            node.on('mousedown', ()=>{
              if(toolRef.current == Tools.CURSOR || toolRef.current == Tools.MINDMAP){
                node?.draggable(true)
              }
            })
            node.on('mouseup', ()=>{
              node?.draggable(false)
              
            })
            layerRef.current?.add(node as Konva.Circle);
        } else {
            node.position({ x: target.x, y: target.y });
        }

        node.on("mouseclick", () => {
          if(toolRef.current === Tools.CURSOR || toolRef.current === Tools.MINDMAP){
            node?.draggable(true);
          }

        });

        node.off('dblclick').on('dblclick', (event) => {
          if (event.evt.button === 0 && (toolRef.current === Tools.MINDMAP || toolRef.current === Tools.CURSOR)) {
              handleCircleClick(event, id);
          }
          
        });

     
  
        //우클릭 메뉴 이벤트
        node.off('contextmenu').on('contextmenu', (event) => {
          event.evt.preventDefault();
          if (toolRef.current === Tools.MINDMAP || toolRef.current === Tools.CURSOR) {
            // console.log(toolRef.current)
            showContextMenu(event, id);
          }
        });

          
        // //드래그 구현 update targets, connectors 
        node.off('dragmove').on('dragmove', () => {
          //if(toolRef.current === Tools.MINDMAP || toolRef.current === Tools.CURSOR){}
              const target = yTargets.get(id);
              if(target){
                const updatedTarget: Target = {
                  ...target, 
                  x: node?.x()??target.x,
                  y: node?.y()??target.y,
                }
                yDocRef.current.transact(() => {
                  yTargets.set(id, updatedTarget);
                }, undoManagerObj);
                //layerRef.current?.add(target);
          
              
              updateConnectors(id);
            }
        });


      //target text 구현 
      const fontSize = 25; 

      const textValue = target.value;
      const textForMeasure = new Konva.Text({
        text: textValue,
        fontSize: fontSize,
        fontFamily: 'Arial',
      });

      const textWidth = textForMeasure.width();
      const textHeight = textForMeasure.height();
      const offsetX = textWidth / 2;
      const offsetY = textHeight / 2;

    
      const textX = target.x - offsetX;
      const textY = target.y - offsetY;
        if (!textNode) {

          
          textNode = new Konva.Text({
            id: 'text-' + target.id,
            x: textX,
            y: textY,
            text: target.value,
            fontSize: fontSize,
            fontFamily: 'Arial',
            fill: 'black',
            stroke: 'black',
            zincIndex: 1,
            draggable: false,
          });
          textNode.addName('mindmap');
          textNode.on('mousedown', ()=>{
            if(toolRef.current == Tools.CURSOR || toolRef.current == Tools.MINDMAP){
              textNode?.draggable(true)
            }
          })
          textNode.on('mouseup', ()=>{
            textNode?.draggable(false)
            
          })
          layerRef.current?.add(textNode as Konva.Text);
        } 
        else {
          textNode.position({ x: textX, y: textY });
          textNode.text(textValue);
        }

        //텍스트 더블클릭 이벤트
        textNode.off('dblclick').on('dblclick', (event) => {
          if (event.evt.button === 0 && toolRef.current === Tools.MINDMAP) {
              handleCircleClick(event, id);
          }
        });


        //텍스트 우클릭 이벤트
        textNode.off('contextmenu').on('contextmenu', (event:any) => {
          event.evt.preventDefault();
          if(toolRef.current === Tools.MINDMAP){
            showContextMenu(event, id);
          }
        });

        textNode.off('dragmove').on('dragmove', () => {
          const textX = textNode.x();
          const textY = textNode.y();
          textNode.position({ x: textX, y: textY });
          const target = yTargets.get(id);
          if(target){
            const updatedTarget: Target = {
              ...target, 
              // x: textNode?.x() + offsetX??textX + offsetX,
              // y: textNode?.y() + offsetY??textY + offsetY,
              x: offsetX + (textNode?.x()??textX),
              y: offsetY + (textNode?.y()??textY),
            }
            yDocRef.current.transact(() => {
              yTargets.set(id, updatedTarget);
            }, undoManagerObj);
            updateConnectors(id);
          }
        });

        

        
    });
  };


  //기본 click useEffect
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.on('click', handleClick);
    }

    return () => {
      if (stageRef.current) {
          stageRef.current.off('click', handleClick);
      }
    };
  },[stageRef]);


  useEffect(() => {
      yConnectors.observe(updateCanvas);
      yTargets.observe(updateCanvas);
      //console.log("!!!!upedate",yTargets, yConnectors);     //TEST
    return () => {
            yTargets.unobserve(updateCanvas);
            yConnectors.unobserve(updateCanvas);
    };
}, [yTargets, yConnectors, toolRef.current, stageRef]);


  return (<>
  
  
  </>);
});

export default MindMap;