import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useTool } from './ToolContext';
import { Tools } from './Tools';

interface PenProps {
    /*
        [XXX]
        맞게 쓴지 모르겠음
        props={Tools.PEN} 형태로 넘겼기 때문에 넘긴 파라미터를 
        바로 쓰려면 interface를 생성해서 타입 지정해주고 받아야 하는 듯
    */
    props: Tools;
    icon: IconProp;
}

export default function Pen({ props, icon }:PenProps){
    const { setTool } = useTool();
    
    interface components {
        name : string
        id : string
    }

    const componentElem : components = {
        name : Tools[props].toString(),
        id : Tools[props].toString(),
    }

    return(
        <>
            <Button id={componentElem.id} onTouchEnd={()=>{setTool(props)}} onClick={()=>{setTool(props)}}>
                <FontAwesomeIcon icon={icon} size='2xl' />
            </Button>
        </>
    );
}