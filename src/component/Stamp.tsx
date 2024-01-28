import { useTool } from './ToolContext';
import { Tools } from './Tools';
// import { useState } from 'react';
import IconButton from '@mui/material/Button';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
// import { Image, Stage } from 'react-konva';
// import thumbUpImg from '../thumbup.png';
// import thumbDownImg from '../thumbdown.png'

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
            <IconButton aria-label="thumb up" id={componentElem.id} onClick={()=>{handleIconBtnClick("thumbUp"); setTool(props);}}>
                <ThumbUpAltRoundedIcon />
            </IconButton>

            <IconButton aria-label="thumb down" id={componentElem.id} onClick={()=>{handleIconBtnClick("thumbDown"); setTool(props);}}>
                <ThumbDownRoundedIcon />
            </IconButton>
        </>
    );
}