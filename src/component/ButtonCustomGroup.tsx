import { Tools } from './Tools';
import { useColor } from './ColorContext';
import Stamp from './Stamp';
import Shape from './Shape';
import Pen from './Pen';
import Text from './Text';
import Corser from './Cursor';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { MuiColorInput } from 'mui-color-input'
import { IconButton } from '@mui/material';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import CircleIcon from '@mui/icons-material/Circle';
import Hand from './Hand';

export const ButtonCustomGroup = () =>{
    const { currentColor, setCurrentColor } = useColor();

    // 색상 변경
    const handleColorClick = (e: string) => {
        setCurrentColor(e);
    };

    return(
        <div className = "ToolBtnGroup" style={{position: "absolute", bottom: "2%", left: "50%", transform: "translate(-50%, 0)", backgroundColor: "white"}}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <IconButton><UndoRoundedIcon /></IconButton>
                <IconButton><RedoRoundedIcon /></IconButton>
                {
                    /* 
                        [NOTE]
                        props 넘기는 형식은 자유롭게 하되, 
                        자식 컴포넌트에서는 오브젝트와 같은 형식으로 받음에 유의
                        ex) <Pen tool="pen" func = {setTool}
                        props = {
                            isTool : "pen"
                        } 
                    */
                }
                <Hand props = {Tools.HAND}/>
                <Corser props = {Tools.CURSOR}/>
                <Text   props = {Tools.TEXT}/>
                <Pen    props = {Tools.PEN}/>
                <Pen    props = {Tools.HIGHLIGHTER}/>

                <Button id='eraser'>eraser</Button>
                <Button id='postit'>postit</Button>
                <div className='shapeBox'>
                    <Stamp props={Tools.STAMP} />
                    <Shape />
                </div>
                <Button id='mindmap'>mindmap</Button>
                <Button className='singleColor' onClick={()=>{handleColorClick('#000000')}}><CircleIcon style={{color: '000000'}}/></Button>
                <Button className='singleColor' onClick={()=>{handleColorClick('#E7464B')}}><CircleIcon style={{color: 'E7464B'}}/></Button>
                <Button className='singleColor' onClick={()=>{handleColorClick('#3B7EF2')}}><CircleIcon style={{color: '3B7EF2'}}/></Button>
                <Button className='singleColor' onClick={()=>{handleColorClick('#79D375')}}><CircleIcon style={{color: '79D375'}}/></Button>
                <Button className='singleColor' onClick={()=>{handleColorClick('#F7D054')}}><CircleIcon style={{color: 'F7D054'}}/></Button>
                <Button><MuiColorInput value={currentColor} onChange={handleColorClick} /></Button>
            </ButtonGroup>
        </div>
    );
}