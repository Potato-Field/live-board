import { Tools } from './Tools';
import { useTool } from './ToolContext';
import IconButton from '@mui/material/Button';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';

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
            <IconButton id={componentElem.id} onClick={()=>{setTool(props);}}>
                <StickyNote2RoundedIcon fontSize='large'/>
            </IconButton>
        </>                                                               
    );
}