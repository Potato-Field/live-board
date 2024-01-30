import React, {useRef, useEffect, useState} from 'react';
import Konva from 'konva';

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
const MindMap = (({ stageRef }: { stageRef: React.RefObject<Konva.Stage> }) => {
    const [nodeTargets, setNodeTargets] = useState<Target[]>([]);
    //const [isCreatingNode, setIsCreatingNode] = useState();
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



    //클릭하면 생성하는 걸로 하려 했는데 변경 - 안쓰는 함수
    const addNodeAtPosition = (x: number, y: number) =>{
        const newTarget = {
            id: 'target-' + nodeTargets.length,
            x: x,
            y: y,
            value: "new-node",
        };
        setNodeTargets([...nodeTargets, newTarget]);
        //setIsCreatingNode(false);
        console.log("new Target");
        console.log(newTarget);

    }

    //초기 설정 useEffect app.tsx로 이동해야 할 로직

    useEffect(() => {
      if(nodeTargets.length === 0)
        setNodeTargets([{ id: 'target-0', x: 50, y: 50, value: "new-node" }]);
    });



    /*************************************************** */
    //더블클릭시 생성 
    const addNewCircleAndConnector = (targetId: string) => {
        const baseTarget = nodeTargets.find(t => t.id === targetId);
        if (!baseTarget) return;
    
        const newX = baseTarget.x + 100;
        const newY = baseTarget.y + 100; 
    
        const newTargetId = 'target-' + nodeTargets.length;
        const newTarget = { id: newTargetId, x: newX, y: newY, value: "new-node" };
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
    
        const areaPos = {
          x: stage.container().offsetLeft + target.x,
          y: stage.container().offsetTop + target.y
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
          }
        });
    
        textArea.focus();
      };

      
    /*************************************************** */
    //update하는 방식으로 새로 구현한 코드 - line
    const updateConnectors = ((draggedNodeId:string) => {
      //console.log("!!!!!!!!!!!!!!imhere!!!!!!!!!!!!!!!!!!!!!!!!!!");//TEST
      connectors.forEach((connector) => {
        if (connector.from === draggedNodeId || connector.to === draggedNodeId) {
          const fromNode = nodeTargets.find(n => n.id === connector.from);
          const toNode = nodeTargets.find(n => n.id === connector.to);
          
          if (fromNode && toNode) {
            const line = layerRef.current?.findOne('#' + connector.id) as Konva.Arrow;
            // console.log(layerRef.current?.getChildren().map(child => child.id())); 
            // // This will log the IDs of all children in the layer
            // console.log(connector);//TEST
            // console.log(line)//TEST
            if (line) {
              line?.points([fromNode.x, fromNode.y, toNode.x, toNode.y]);
              layerRef.current?.add(line);
              //console.log("!!!!!!!!!!!! test drag new ways", draggedNodeId, line);    //TEST
            }
          }
        }
      });
      
    });


    



    /*************************************************** */
    //useEffect  추후 코드 다시 정리해야 함

      useEffect(() => {
        if (!layerRef.current) return;
        layerRef.current.removeChildren();
    
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
            //zindex: 998,
          });

          const text = new Konva.Text({
            id:'text-'+target.id,
            x: target.x,
            y: target.y,
            text: target.value,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: 'black',
            //zindex: 999,
          });
          
    
          node.on('dragmove', () => {
            //////////////////////////////////////////////////////////////
            /////version3
            const draggedNodeId = node.id();
            const draggedNode = nodeTargets.find(t => t.id === draggedNodeId);
            if(draggedNode){
              draggedNode.x = node.x();
              draggedNode.y = node.y();
            }
            updateConnectors(draggedNodeId);

            //text 이동추가
            const targetNode = layerRef.current?.findOne('#text-'+node.id());
            targetNode?.x(node.x());
            targetNode?.y(node.y());

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

    
          layerRef.current?.add(node);
          layerRef.current?.add(text);
         
        });
    
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
    
        //layerRef.current.batchDraw();
      }, [nodeTargets, connectors]);
    



      
    /*************************************************** */

  return (<></>);
});

export default MindMap;
