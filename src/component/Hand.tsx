import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHand } from '@fortawesome/free-regular-svg-icons'
import { useTool } from './ToolContext';
import { Tools } from './Tools';
import { IconButton, Tooltip } from '@mui/material';

interface HandProps {
    props: Tools;
}

export default function Hand({ props }:HandProps){
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
        <Tooltip arrow placement="top" title="Hand tool">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faHand} />    
            </IconButton>
        </Tooltip>
        </>
    );
}