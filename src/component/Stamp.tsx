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
}

export default function Stamp({ handleIconBtnClick }: StampProps){
    const { setTool } = useTool();

    return(
        <>
            <IconButton aria-label="thumb up" id="thumbUp" onClick={()=>{handleIconBtnClick("thumbUp")}}>
                <ThumbUpAltRoundedIcon />
            </IconButton>

            <IconButton aria-label="thumb down" id="thumbDown" onClick={()=>{handleIconBtnClick("thumbDown")}}>
                <ThumbDownRoundedIcon />
            </IconButton>
        </>
    );
}