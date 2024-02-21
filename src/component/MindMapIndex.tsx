import { useTool } from './ToolContext';
import { Tools } from './Tools';
import { IconButton, Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSitemap } from '@fortawesome/free-solid-svg-icons';

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
        <Tooltip arrow placement="top" title="Mind map">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faSitemap} size='lg' />
            </IconButton>
        </Tooltip>
        </>
    );
}