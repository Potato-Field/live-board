import { Tools } from './Tools';
import { useTool } from './ToolContext';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import { IconButton, Tooltip } from '@mui/material';

interface PostItProps {
    // handleIconBtnClick: (e: any) => void;
    props: Tools;
}

export default function PostIt({ props }:PostItProps) {
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
        <Tooltip arrow placement="top" title="Sticky note">
            <IconButton id={componentElem.id} onClick={()=>{setTool(props);}}>
                <StickyNote2RoundedIcon fontSize='large'/>
            </IconButton>
        </Tooltip>
        </>                                                               
    );
}