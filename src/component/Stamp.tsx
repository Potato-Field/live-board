// import { useTool } from './ToolContext';
import { Tools } from './Tools';
// import { useState } from 'react';
import IconButton from '@mui/material/Button';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';
// import { Image, Stage } from 'react-konva';
// import thumbUpImg from '../thumbup.png';
// import thumbDownImg from '../thumbdown.png'
import { useTool } from './ToolContext';

interface StampProps {
    props: Tools;
}

export default function Stamp({ props }: StampProps){
    const { setTool } = useTool();

    return(
        <>
            <IconButton aria-label="thumb up" id="thumbUp" onClick={()=>{setTool(props)}}>
                <ThumbUpAltRoundedIcon />
            </IconButton>

            <IconButton aria-label="thumb down" id="thumbDown" onClick={()=>{setTool(props)}}>
                <ThumbDownRoundedIcon />
            </IconButton>
        </>
    );
}