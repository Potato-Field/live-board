import IconButton from '@mui/material/Button';
import { useTool } from './ToolContext';
import { Tools } from './Tools';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import ChangeHistoryRoundedIcon from '@mui/icons-material/ChangeHistoryRounded';
import CircleIcon from '@mui/icons-material/Circle';

interface ShapeProps {
    handleIconBtnClick: (e: any) => void;
    props: Tools;
}

export default function Shape({ handleIconBtnClick, props }: ShapeProps){
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
            <IconButton aria-label="arrow" id={componentElem.id} onClick={()=>{handleIconBtnClick("arrow"); setTool(props);}}>
                <CallMadeRoundedIcon></CallMadeRoundedIcon>
            </IconButton>
        
            <IconButton aria-label="rectangle" id={componentElem.id} onClick={()=>{handleIconBtnClick("rect"); setTool(props);}}>
                <SquareRoundedIcon></SquareRoundedIcon>
            </IconButton>
        
            <IconButton aria-label="circle" id={componentElem.id} onClick={()=>{handleIconBtnClick("cir"); setTool(props);}}>
                <CircleIcon></CircleIcon>
            </IconButton>
        
            <IconButton aria-label="triangle" id={componentElem.id} onClick={()=>{handleIconBtnClick("tri"); setTool(props);}}>
                <ChangeHistoryRoundedIcon></ChangeHistoryRoundedIcon>
            </IconButton>
        </>
    );

}
