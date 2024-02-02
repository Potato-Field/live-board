import React, {useRef, useEffect, useState} from 'react';
import Konva from 'konva';
import { Tools } from './Tools';


import * as Y from "yjs";
import { layer } from '@fortawesome/fontawesome-svg-core';

type Target = {
    id: string;
    x: number;
    y: number;
    value: string,
  };
  
  type Connector = {
    id: string;
    from: string;
    to: string;
  };
  


//const MindMap = forwardRef((ref: RefObject<Konva.Stage>) => {
export const MindMap = (({ stageRef, currentTool, yDocRef }: { stageRef: React.RefObject<Konva.Stage>, currentTool: Tools 
, yDocRef: React.MutableRefObject<Y.Doc>}) => {
    console.log(yDocRef)
    const [nodeTargets, setNodeTargets] = useState<Target[]>([]);
    const [connectors, setConnectors] = useState<Connector[]>([]);
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
              if (currentTool === Tools.MINDMAP && yTargets.size === 0) {
                  const stage = stageRef.current;
                  const pointerPosition = stage?.getPointerPosition();
  
                  if (stage && pointerPosition) {
                      const newNodeId = `target-${yTargets.size}`;
                      const newNode = {
                          id: newNodeId,
                          x: pointerPosition.x,  
                          y: pointerPosition.y,  
                          value: "new-node",
                      };
                      yTargets.set(newNodeId, newNode);
                  }
              }
          });
      }
    });


    const handleClick = (event:any) => {
      console.log("!!!!targets, and connectors", yTargets, yConnectors);
        if (currentTool === Tools.MINDMAP && yTargets.size === 0) {
            const stage = stageRef.current;
            const pointerPosition = stage?.getPointerPosition();
            if (stage && pointerPosition) {
                const newNodeId = `target-${yTargets.size}`;
                const newNode = {
                    id: newNodeId,
                    x: pointerPosition.x,
                    y: pointerPosition.y,
                    value: "new-node",
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
  
      const newTargetId = `target-${yTargets.size}`;
      const newTarget = { id: newTargetId, x: newX, y: newY, value: `new-node${yTargets.size}` };
      yTargets.set(newTargetId, newTarget);
  
      const newConnectorId = `connector-${yConnectors.size}`;
      const newConnector = { id: newConnectorId, from: targetId, to: newTargetId };
      yConnectors.set(newConnectorId, newConnector);
        
    };


    const handleCircleClick = (event: any, targetId: string) => {
      event.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const targetText = layerRef.current?.findOne("#text-"+targetId);
      targetText?.hide();
      const targetTextPosition = targetText?.absolutePosition();
  
      const areaPos = {
        x: stage.container().offsetLeft + (targetTextPosition?.x??0),
        y: stage.container().offsetTop + (targetTextPosition?.y??0),
      };
  
      var textArea = document.createElement('textarea');
      document.body.appendChild(textArea);
      const target = yTargets.get(targetId);
      if (!target) {
        console.error("Target not found:", targetId);
        return;
      }



      textArea.value = target.value;
      textArea.style.position = 'absolute';
      textArea.style.left = areaPos.x + 'px';
      textArea.style.top = areaPos.y + 'px';
      textArea.style.border = 'none';
      textArea.style.padding = '0px';
      textArea.style.margin = '0px';
      textArea.style.overflow = 'hidden';
      textArea.style.background = 'none';
      textArea.style.outline = 'none';
      textArea.style.resize = 'none';
      textArea.style.transformOrigin = 'left top';
  
      
      textArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            yTargets.set(targetId, { ...target, value: textArea.value });
            textArea.parentNode?.removeChild(textArea);
            targetText?.show();
            console.log(targetText, targetText?.attrs.text, "targetText!!!!!!!!!!");//TEST
            //layerRef.current?.add(targetText);
          }
      });
        //console.log(targetText);
        //targetText?.attrs.text(textArea.value);
    textArea.focus();
  };



  // const deleteTarget = (targetId: string) => {



  // }




  const updateConnectors = (targetId:string) => {

    yConnectors.forEach((connector, connectorId) => {
      if (connector.from === targetId || connector.to === targetId) {
        const fromNode = yTargets.get(connector.from);
        const toNode = yTargets.get(connector.to);
        
        if (fromNode && toNode) {
          const foundLine = layerRef.current?.findOne('#' + connectorId) as Konva.Arrow;
          if (foundLine) {
            foundLine.points([fromNode.x, fromNode.y, toNode.x, toNode.y]);
            // Optionally, update connector positions in yConnectors if needed
            // This depends on whether your yConnectors map stores positional data or just relationships
            layerRef.current?.add(foundLine);
          }
        }
      }
    });

  }

  
  
    

  const updateCanvas = () => {

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
                fill: '#A9A9A9',
                radius: 20,
                //innerRadius: 20,
                //outerRadius: 0,
                draggable: true,
                stroke: 'black',
                strokeWidth: 2,
            });
            layerRef.current?.add(node as Konva.Circle);
            
        } else {
            node.position({ x: target.x, y: target.y });
        }
        node.off('dblclick').on('dblclick', (event) => {
          if (currentTool === Tools.MINDMAP) {
              //addNewCircleAndConnector(id);
              handleCircleClick(event, id);
          }
          
      });
  
      node.off('contextmenu').on('contextmenu', (event) => {
        event.evt.preventDefault();
          if (currentTool === Tools.MINDMAP) {

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
                  deleteTarget(id);
                  menu.style.display = 'none';
                }
                
                
                menu.appendChild(createButton);
                menu.appendChild(deleteButton);
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
          });
          
      node.on('dragmove', () => {
        if(currentTool === Tools.MINDMAP){

          const target = yTargets.get(id);
          if(target){
            const updatedTarget: Target = {
              ...target, 
              x: node?.x()??target.x,
              y: node?.y()??target.y,
            }
            yTargets.set(id, updatedTarget);
            layerRef.current?.add(target);
          }
          //need to update yTarget and yconnector code
          
          updateConnectors(id);
        }
      });

      const fontSize = 12; 

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
          });
          layerRef.current?.add(textNode as Konva.Text);
        } 
        else {
          textNode.position({ x: textX, y: textY });
          textNode.text(textValue);
        }

        if (node) {
          //node.zIndex(100);
      }
        if (textNode) {
          //textNode.zIndex(200);
      }
    });
  };


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
      console.log("!!!!upedate",yTargets, yConnectors);     //TEST
    return () => {
            // yTargets.unobserve(updateCanvas);
            // yConnectors.unobserve(updateCanvas);
    };
}, [yTargets, yConnectors, currentTool, stageRef]);



    console.log("!!!!!!!target, connector",yTargets, yConnectors);  //TEST
    console.log("!!!!!!!!!!!!!!!!!!!!!!come out");//TEST




   


  // return {nodeTargets, setNodeTargets};
  return (<></>);
});

export default MindMap;