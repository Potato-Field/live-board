import React, {useRef, useEffect} from 'react';
import Konva from 'konva';
import { Tools } from './Tools';


import * as Y from "yjs";

type Target = {
    id: string;
    x: number;
    y: number;
    value: string,
    childIds: string[],
  };
  
  type Connector = {
    id: string;
    from: string;
    to: string;
  };
  


//const MindMap = forwardRef((ref: RefObject<Konva.Stage>) => {
export const MindMap = (({ stageRef, toolRef, yDocRef }: { stageRef: React.RefObject<Konva.Stage>, toolRef: any
, yDocRef: React.MutableRefObject<Y.Doc>}) => {
    //console.log(yDocRef)
    // const [nodeTargets, setNodeTargets] = useState<Target[]>([]);
    // const [connectors, setConnectors] = useState<Connector[]>([]);
    //const toolRef.current = toolRef.current;
   //console.log(toolRef.current, Tools.MINDMAP);
    const layerRef = useRef<Konva.Layer>();

    const yTargets: Y.Map<Target> = yDocRef.current.getMap('targets');
    const yConnectors: Y.Map<Connector> = yDocRef.current.getMap('connectors');

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
                      yTargets.set(newNodeId, newNode);
                  }
              }
          });
      }
    });


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
                yTargets.set(newNodeId, newNode);
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
      yTargets.set(newTargetId, newTarget);

      //child target id 추가하는 부분
      const updatedTarget = {
        ...baseTarget, 
        childIds: [...baseTarget.childIds, newTargetId]
      };
      yTargets.set(targetId, updatedTarget);

  
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
          const target = stage.findOne(`#${targetId}`);
          if (target) {
            const targetPosition = target.absolutePosition();
            textArea.style.left = stage.container().offsetLeft + targetPosition.x + 'px';
            textArea.style.top = stage.container().offsetTop + targetPosition.y + 'px';
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
              yTargets.set(targetId, { ...nowTarget, value: textArea.value });
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

      setupTextArea(textArea, target.value, areaPos);
    
    };
    



  const makeTextTravel = () => {
    let container = document.getElementById('textTravelContainer');
    if(!container){
      container = document.createElement('div');
      container.id = 'textTravelContainer';
      container.style.position = 'absolute'; 
      container.style.left = '50px'; 
      container.style.top = '50px';
      document.body.appendChild(container);
    }
    else{
      container.innerHTML = '';
    }


  
    const baseFontSize = 40; 
    const decrement = 6; 
    const baseFontWeight = 700;
    const fontDecrement = 100;

    const dfs = (targetId:string, depth:number, parentDiv:any) => {
      const nowTarget = yTargets.get(targetId);
      if(!nowTarget) return;

      const targetDiv = document.createElement('div');
      targetDiv.textContent = '.' + nowTarget.value;
      targetDiv.style.fontSize = `${baseFontSize - (depth * decrement)}px`; 
      targetDiv.style.textAlign = 'left';

      const calcWeight = Math.max(baseFontWeight - (depth * fontDecrement), 1);
      targetDiv.style.fontWeight = calcWeight.toString();


      parentDiv.appendChild(targetDiv);
      nowTarget.childIds.forEach(childId => dfs(childId, depth+1, targetDiv));
    }

    dfs('target-0', 0, container);
    return container;
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

    
    yTargets.delete(targetId);

    yConnectors.forEach((connector, connectorId) => {
      if (connector.from === targetId || connector.to === targetId) {
        const line = layerRef.current?.findOne('#' + connectorId);
        line?.destroy();
        yConnectors.delete(connectorId); 
      }
    });

  }




  const updateConnectors = (targetId:string) => {

    yConnectors.forEach((connector, connectorId) => {
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


  const showContextMenu = (event:any, id:string) =>  {
          //console.log("show context menu", event);
          let node = layerRef.current?.findOne(`#${id}`);
          let menu = document.getElementById('contextMenu'+ node?.id());
       
        
          if(!menu){
            const menu = document.createElement('div');
            menu.id = 'contextMenu' + node?.id();
            document.body.appendChild(menu);
            
            const createButton = document.createElement('button');
            createButton.innerHTML = 'Create';
            createButton.id = 'create' + menu.id;
            createButton.onclick = function (){
              addNewCircleAndConnector(id);
              menu.style.display = 'none';
            }
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.id = 'delete' + menu.id;
            deleteButton.onclick = function (){
              deleteTargetDfs(id);
              menu.style.display = 'none';
            }

            const sortButton = document.createElement('button');
            sortButton.innerHTML = 'Sort';
            sortButton.onclick = function () {
              makeTextTravel();
              menu.style.display = 'none';
            }

            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = 'Cancel';
            //id 필요없지 않나..
            cancelButton.onclick = function (){
              menu.style.display = 'none';
            }

            
            
            menu.appendChild(createButton);
            menu.appendChild(deleteButton);
            menu.appendChild(sortButton);
            menu.appendChild(cancelButton);
          }

          if(menu){
            menu.style.display = 'block';
            menu.style.position = 'absolute';
            menu.style.left = `${event.evt.clientX}px`;
            menu.style.top = `${event.evt.clientY}px`;
            menu.style.backgroundColor = '#f9f9f9';
            menu.style.boxShadow = '0px 8px 16px 0px rgba(0,0,0,0.2)';
            menu.style.zIndex = '1000';
            menu.style.padding = '10px';
            
          }
    
  }

  
  
    

  //ytargets, yconnectors observe 시 작동하는 함수 
  const updateCanvas = (e:any) => {
    e.changes.keys.forEach((change:any, key:any) => {
      //console.log(key, change.action);
      if (change.action === 'delete') {
        deleteTarget(key);
      }
    });
    
    yConnectors.forEach((connector, id) => {
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
                strokeWidth: 2,
            });
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

      
      yTargets.forEach((target, id) => {
        let node = layerRef.current?.findOne(`#${id}`);
        let textNode = layerRef.current?.findOne(`#text-${id}`) as Konva.Text;

        if (!node) {
            node = new Konva.Circle({
                id: id,
                x: target.x,
                y: target.y,
                fill: '#fff',
                radius: 70,
                draggable: true,
                opacity: 1,
                //stroke: 'black',
                //strokeWidth: 2,
            });
            layerRef.current?.add(node as Konva.Circle);
        } else {
            node.position({ x: target.x, y: target.y });
        }
        node.off('dblclick').on('dblclick', (event) => {
          if (event.evt.button === 0 && toolRef.current === Tools.MINDMAP) {
              //addNewCircleAndConnector(id);
              handleCircleClick(event, id);
          }
          
      });

     
  
      //우클릭 메뉴 이벤트
      node.off('contextmenu').on('contextmenu', (event) => {
        event.evt.preventDefault();
         if (toolRef.current === Tools.MINDMAP) {
          // console.log(toolRef.current)
          showContextMenu(event, id);
         }
      });
          
      //드래그 구현 update targets, connectors 
      node.off('dragmove').on('dragmove', () => {
        //if(toolRef.current === Tools.MINDMAP){}
            const target = yTargets.get(id);
            if(target){
              const updatedTarget: Target = {
                ...target, 
                x: node?.x()??target.x,
                y: node?.y()??target.y,
              }
              yTargets.set(id, updatedTarget);
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
          });
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
        textNode.off('contextmenu').on('contextmenu', (event) => {
          event.evt.preventDefault();
          if(toolRef.current === Tools.MINDMAP){
            showContextMenu(event, id);
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



    // console.log("!!!!!!!target, connector",yTargets, yConnectors);  //TEST
    // console.log("!!!!!!!!!!!!!!!!!!!!!!come out");//TEST
    




   


  // return {nodeTargets, setNodeTargets};
  return (<></>);
});

export default MindMap;