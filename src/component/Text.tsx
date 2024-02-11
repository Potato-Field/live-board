import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFont } from '@fortawesome/free-solid-svg-icons'
import { useTool } from './ToolContext';
import { Tools } from './Tools';
import { IconButton, Tooltip } from '@mui/material';

interface TextProps {
    props: Tools;
}

export default function Text({ props }:TextProps){
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
        <Tooltip arrow placement="top" title="Text">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faFont} size='xl' />
            </IconButton>
        </Tooltip>
        </>
    );
}