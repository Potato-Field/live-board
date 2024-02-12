import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEraser } from '@fortawesome/free-solid-svg-icons'
import { useTool } from './ToolContext';
import { Tools } from './Tools';
import { IconButton, Tooltip } from '@mui/material';

interface EraserProps {
    props: Tools;
}

export default function Eraser({ props }:EraserProps){
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
        <Tooltip arrow placement="top" title="Eraser">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faEraser} size='xl' />
            </IconButton>
        </Tooltip>
        </>
    );
}