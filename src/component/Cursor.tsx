import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons'
import { useTool } from './ToolContext';
import { Tools } from './Tools';
import { IconButton, Tooltip } from '@mui/material';

interface CursorProps {
    props: Tools;
}

export default function Cursor({ props }:CursorProps){
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
        <Tooltip arrow placement="top" title="Select tool">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faArrowPointer}/>
            </IconButton>
        </Tooltip>
        </>
    );
}