import React, {useRef, useEffect, useState} from 'react';
import Konva from 'konva';
import { Tools } from './Tools';


import * as Y from "yjs";

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
    const [nodeTargets, setNodeTargets] = useState<Target[]>([]);
    const [connectors, setConnectors] = useState<Connector[]>([]);
    const layerRef = useRef<Konva.Layer>();

    useEffect(() => {
        if(stageRef.current && !layerRef.current){
            const layer = new Konva.Layer();
            layerRef.current = layer;
            stageRef.current.add(layer);
        }
        
    }, [stageRef]);
    

    /*************************************************** */
    //초기 설정 useEffect app.tsx로 이동해야 할 로직

   //주의 할 점 root 노드는 total 한 개다
   //여러개 생성하고 싶은면 조건을 추가 해야 할 듯 단순한 클릭으로 작동하면 더블클릭 등의 기능이 작동하지 않는 문제점이 있다.

    useEffect(() => {
     
      if (stageRef.current) {
        stageRef.current.on('click', () => {
          if (currentTool === Tools.MINDMAP && nodeTargets.length === 0) {
              const stage = stageRef.current;
              const pointerPosition = stage?.getPointerPosition();
  
              if (stage && pointerPosition) {
                  const newNode = {
                      id: `target-${nodeTargets.length}`,
                      x: pointerPosition.x,  
                      y: pointerPosition.y,  
                      value: "new-node",
                  };
                  setNodeTargets([...nodeTargets, newNode]);
              }
          }
      });
      }

      return () => {
          if (stageRef.current) {
              stageRef.current.off('click');
          }
      };
  }, [nodeTargets, currentTool, stageRef]);



    /*************************************************** */
    //더블클릭시 생성 
    const addNewCircleAndConnector = (targetId: string) => {
        const baseTarget = nodeTargets.find(t => t.id === targetId);
        if (!baseTarget) return;
        
        const nowCircle = layerRef.current?.findOne('#' + targetId);
        const nowRadius = nowCircle?.attrs.radius;

        let randomX = Math.random() * (nowRadius * 5);
        let randomY = Math.random() * (nowRadius * 5);

        if(randomX < nowRadius*2 && randomY < nowRadius*2){
          randomX += nowRadius*2;
          randomY += nowRadius*2;

        }

        const dx = [1, 1, -1, -1];
        const dy = [1, -1, 1, -1];
    
        const quadrant = nodeTargets.length % 4;
        randomX *= dx[quadrant];
        randomY *= dy[quadrant];

       
        const newX = baseTarget.x + randomX;
        const newY = baseTarget.y + randomY; 
    
        const newTargetId = 'target-' + nodeTargets.length;
        const newTarget = { id: newTargetId, x: newX, y: newY, value: "new-node"+nodeTargets.length };
        setNodeTargets([...nodeTargets, newTarget]);
    
        const newConnector = { id: 'connector-' + connectors.length, from: targetId, to: newTargetId };
        setConnectors([...connectors, newConnector]);
      };

      const getConnectorPoints = (from: Target, to: Target): number[] => {
        return [from.x, from.y, to.x, to.y]; // Simple line from one node to another
      };



    /*************************************************** */
      //click -> change text 텍스트 변경용 -> 수정해야 함 
      const handleCircleClick = (target: Target) => {
        const stage = stageRef.current;
        if (!stage) return;

        const targetText = layerRef.current?.findOne("#text-"+target.id);
        targetText?.hide();
        const targetTextPosition = targetText?.absolutePosition();
        //console.log("!!!!! targetText", targetText, targetTextPosition?.x, targetTextPosition?.y);//TEST
    
        const areaPos = {
          x: stage.container().offsetLeft + (targetTextPosition?.x??0),
          y: stage.container().offsetTop + (targetTextPosition?.y??0),
        };
    
        var textArea = document.createElement('textarea');
        document.body.appendChild(textArea);
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
            setNodeTargets(currentTargets => 
              currentTargets.map(t => 
                t.id === target.id ? { ...t, value: textArea.value } : t
              )
            );
    
            textArea.parentNode?.removeChild(textArea);
            targetText?.show();
          }
        });
    
        textArea.focus();
      };

      
    /*************************************************** */
    //update하는 방식으로 새로 구현한 코드 - line
    const updateConnectors = ((draggedNodeId:string) => {
      connectors.forEach((connector) => {
        if (connector.from === draggedNodeId || connector.to === draggedNodeId) {
          const fromNode = nodeTargets.find(n => n.id === connector.from);
          const toNode = nodeTargets.find(n => n.id === connector.to);
          
          if (fromNode && toNode) {
            const line = layerRef.current?.findOne('#' + connector.id) as Konva.Arrow;
            if (line) {
              line?.points([fromNode.x, fromNode.y, toNode.x, toNode.y]);
              layerRef.current?.add(line);
            }
          }
        }
      });
    });

    
    /*************************************************** */


    /*************************************************** */
    //useEffect  추후 코드 다시 정리해야 함

      useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.removeChildren();

          // //Create connectors
          connectors.forEach((connector) => {
            const fromNode = nodeTargets.find(n => n.id === connector.from);
            const toNode = nodeTargets.find(n => n.id === connector.to);
      
            if (fromNode && toNode) {
              //const points = [fromNode.x, fromNode.y, toNode.x, toNode.y];
              const points = getConnectorPoints(fromNode, toNode);
              const line = new Konva.Arrow({
                id: connector.id,
                points: points,
                stroke: 'black',
                fill: 'black',
                strokeWidth: 2,
              });
              layerRef.current?.add(line);
            }
          });
      
    
        // Create nodes
        nodeTargets.forEach((target) => {
          const node = new Konva.Circle({
            id: target.id,
            x: target.x,
            y: target.y,
            //fill: Konva.Util.getRandomColor(),
            fill: '#A9A9A9',
            radius: 20, 
            draggable: true,
            stroke: 'black', 
            strokeWidth: 2, 
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

          const text = new Konva.Text({
            id:'text-'+target.id,
            x: textX,
            y: textY,
            text: target.value,
            fontSize: fontSize,
            fontFamily: 'Arial',
            fill: 'black',
          });
          
    
          
          if(currentTool === Tools.MINDMAP){
            node.on('dragmove', () => {
              const draggedNodeId = node.id();
              const draggedNode = nodeTargets.find(t => t.id === draggedNodeId);
              if(draggedNode){
                draggedNode.x = node.x();
                draggedNode.y = node.y();
              }
              updateConnectors(draggedNodeId);
  
              //text 이동추가
              const targetNode = layerRef.current?.findOne('#text-'+node.id());
              targetNode?.x(node.x() - offsetX);
              targetNode?.y(node.y() - offsetY);
  
            });
            //node.on('click', () => handleCircleClick(target));
            ////우클릭해야 변경하는 방향으로 수정
            node.on('contextmenu', (e) => {
              e.evt.preventDefault();
              handleCircleClick(target);
            });
      
            node.on('dblclick', () => {
              addNewCircleAndConnector(target.id);
            });
            text.on('contextmenu', (e) => {
              e.evt.preventDefault();
              handleCircleClick(target);
            });
        
            text.on('dblclick', () => {
              addNewCircleAndConnector(target.id);
            });
          }
          


    
          layerRef.current?.add(node);
          layerRef.current?.add(text);
         
        });
    
      
        //layerRef.current.batchDraw();
      }, [nodeTargets, connectors, currentTool]);
    



      
    /*************************************************** */

  // return {nodeTargets, setNodeTargets};
  return (<></>);
});

export default MindMap;