import { useTool } from './ToolContext';
import { Tools } from './Tools';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
import { IconButton, Tooltip } from '@mui/material';

interface StampProps {
    handleIconBtnClick: (e: any) => void;
    props: Tools;
}

export default function Stamp({ handleIconBtnClick, props }: StampProps){
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
        <Tooltip arrow placement="top" title="Thumb up">
            <IconButton aria-label="thumb up" id={componentElem.id} onClick={()=>{handleIconBtnClick("thumbUp"); setTool(props);}}>
                <ThumbUpAltRoundedIcon />
            </IconButton>
        </Tooltip>

        <Tooltip arrow placement="top" title="Thumb down">
            <IconButton aria-label="thumb down" id={componentElem.id} onClick={()=>{handleIconBtnClick("thumbDown"); setTool(props);}}>
                <ThumbDownRoundedIcon />
            </IconButton>
        </Tooltip>
        </>
    );
}