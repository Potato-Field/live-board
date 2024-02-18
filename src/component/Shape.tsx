import { useTool } from './ToolContext';
import { Tools } from './Tools';
// import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import CircleIcon from '@mui/icons-material/Circle';
import { IconButton, Tooltip } from '@mui/material';
import { BsTriangleFill } from "react-icons/bs";

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
        {/* <Tooltip arrow placement="top" title="Arrow">
            <IconButton aria-label="arrow" id={componentElem.id} onClick={()=>{handleIconBtnClick("arrow"); setTool(props);}}>
                <CallMadeRoundedIcon />
            </IconButton>
        </Tooltip> */}
        
        <Tooltip arrow placement="top" title="Rectangle">
            <IconButton aria-label="rectangle" id={componentElem.id} onClick={()=>{handleIconBtnClick("rect"); setTool(props);}}>
                <SquareRoundedIcon style={{height: "1.5rem"}} />
            </IconButton>
        </Tooltip>

        <Tooltip arrow placement="top" title="Circle">
            <IconButton aria-label="circle" id={componentElem.id} onClick={()=>{handleIconBtnClick("cir"); setTool(props);}}>
                <CircleIcon style={{height: "1.5rem"}} />
            </IconButton>
        </Tooltip>
        
        <Tooltip arrow placement="top" title="Triangle">
            <IconButton aria-label="triangle" id={componentElem.id} onClick={()=>{handleIconBtnClick("tri"); setTool(props);}}>
                <BsTriangleFill style={{height: "1.3rem"}} />
            </IconButton>
        </Tooltip>
        </>
    );

}
