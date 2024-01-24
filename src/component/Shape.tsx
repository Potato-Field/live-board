import IconButton from '@mui/material/Button';
// import { useTool } from './ToolContext';
// import { Tools } from './Tools';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import ChangeHistoryRoundedIcon from '@mui/icons-material/ChangeHistoryRounded';
import CircleIcon from '@mui/icons-material/Circle';

export default function Shape(){

    return(
        <>
            <IconButton aria-label="arrow" id="arrow">
                <CallMadeRoundedIcon></CallMadeRoundedIcon>
            </IconButton>
        
            <IconButton aria-label="square" id="square">
                <SquareRoundedIcon></SquareRoundedIcon>
            </IconButton>
        
            <IconButton aria-label="circle" id="circle">
                <CircleIcon></CircleIcon>
            </IconButton>
        
            <IconButton aria-label="triangle" id="triangle">
                <ChangeHistoryRoundedIcon></ChangeHistoryRoundedIcon>
            </IconButton>
        </>
    );

}
