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
    
        // Calculate position for new circle
        const newX = baseTarget.x + 100; // Adjust as needed
        const newY = baseTarget.y + 100; // Adjust as needed
    
        // Create new target
        const newTargetId = 'target-' + nodeTargets.length;
        const newTarget = { id: newTargetId, x: newX, y: newY, value: "new-node" };
        setNodeTargets([...nodeTargets, newTarget]);
    
        // Create connector
        const newConnector = { id: 'connector-' + connectors.length, from: targetId, to: newTargetId };
        setConnectors([...connectors, newConnector]);

        console.log("dbclick new circle and connectors");
        console.log(newTarget);     //TEST
        console.log(newConnector);
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
            fill: Konva.Util.getRandomColor(),
            radius: 20, // Adjustable
            draggable: true,
          });

          const text = new Konva.Text({
            x: target.x,
            y: target.y,
            text: target.value,
            fontSize: 12,
            fontFamily: 'Arial',
            fill: 'black',
          });

    
          node.on('dragmove', () => {
            //////////////////////////////////////////
            // ////drag 새로 수정 version 1
            target.x = node.x();
            target.y = node.y();
            nodeTargets.forEach((target) => {
              const node = layerRef.current?.findOne(target.id) as Konva.Circle;
              if(node){
                node.x(target.x);
                node.y(target.y);
                
                text.x(node.x()+20);
                text.y(node.y()+20);

                layerRef.current?.add(node);
                layerRef.current?.add(text);
              }

            });

           
            connectors.forEach((connector) => {
              const fromNode = nodeTargets.find(n => n.id === connector.from);
              const toNode = nodeTargets.find(n => n.id === connector.to);

              // const before_line = layerRef.current?.findOne(connector.id);
              // before_line?.remove();
        
              if (fromNode && toNode) {
                //const points = [fromNode.x, fromNode.y, toNode.x, toNode.y];
                const points = getConnectorPoints(fromNode, toNode);
                const line = new Konva.Arrow({
                  points: points,
                  stroke: 'black',
                  fill: 'black',
                  strokeWidth: 2,
                });
                layerRef.current?.add(line);
                console.log("!!!!!connectors test!!!!!");
                console.log(connectors);        //TEST
              }
            });

            //////////////////////////////////////////////////////////
            // //version2 -> 
            // const updatedTargets = nodeTargets.map(t => 
            //   t.id === target.id ? { ...t, x: node.x(), y: node.y() } : t
            // );
          
            // // Update the state
            // setNodeTargets(updatedTargets);
            

            
            //////////////////////////////////////////////////////////



             console.log("drag move");
             console.log(target.x, target.y);      //TEST
             console.log(nodeTargets);
          });

          
          node.on('click', () => handleCircleClick(target));
          
    
          node.on('dblclick', () => {
            addNewCircleAndConnector(target.id);
          });

    
          layerRef.current?.add(node);
        });
    
        //Create connectors
        connectors.forEach((connector) => {
          const fromNode = nodeTargets.find(n => n.id === connector.from);
          const toNode = nodeTargets.find(n => n.id === connector.to);
    
          if (fromNode && toNode) {
            //const points = [fromNode.x, fromNode.y, toNode.x, toNode.y];
            const points = getConnectorPoints(fromNode, toNode);
            const line = new Konva.Arrow({
              points: points,
              stroke: 'black',
              fill: 'black',
              strokeWidth: 2,
            });
            layerRef.current?.add(line);
          }
        });
    
        layerRef.current.batchDraw();
      }, [nodeTargets, connectors]);
    



      
    /*************************************************** */

  return (<></>);
});

export default MindMap;
