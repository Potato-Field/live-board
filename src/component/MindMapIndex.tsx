import Button from '@mui/material/Button';
import { useTool } from './ToolContext';
import { Tools } from './Tools';

interface MindMapProps {
    props: Tools;
}

export default function MindMap({ props }:MindMapProps){
    const { setTool } = useTool();
    
    interface components {
        name : string
        id : string
    }

    const componentElem : components = {
        name : Tools[props].toString(),
        id : Tools[props].toString()
    }

    return(
        <>
            <Button id={componentElem.id} onClick={()=>{setTool(props)}}>{componentElem.name}</Button>
        </>
    );

}