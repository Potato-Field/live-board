import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons'
import { useTool } from './ToolContext';
import { Tools } from './Tools';

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
            <Button id={componentElem.id} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={faArrowPointer} size='xl' />
            </Button>
        </>
    );
}