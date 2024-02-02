import { Tools } from './Tools';
import { useColor } from './ColorContext';
import Hand from './Hand';
import Cursor from './Cursor';
import Text from './Text';
import Pen from './Pen';
import Eraser from './Eraser';
import PostIt from './PostIt';
import Stamp from './Stamp';
import Shape from './Shape';
import MindMap from './MindMapIndex';

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { MuiColorInput } from 'mui-color-input'
import { IconButton } from '@mui/material';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import { faPen, faHighlighter } from '@fortawesome/free-solid-svg-icons'
import CircleIcon from '@mui/icons-material/Circle';
import { useRef } from 'react'

interface ButtonCustomGroupProps {
    handleIconBtnClick: (id: string) => void;
    setUserId : (userId:any) =>any;
}

export const ButtonCustomGroup = ({handleIconBtnClick, setUserId}: ButtonCustomGroupProps) =>{
    const userIdBox:any = useRef(null);

    const { currentColor, setCurrentColor } = useColor();

    // 색상 변경
    const handleColorClick = (e: string) => {
        setCurrentColor(e);
    };

    const addUserId = ()=>{
        if(userIdBox.current){
            setUserId(userIdBox.current.value)
        }
    };
    return(
        <div className = "ToolBtnGroup" style={{position: "absolute", bottom: "10%", left: "50%", transform: "translate(-50%, 0)", backgroundColor: "white", maxWidth: "100%"}}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
                <input type="text" id="userId" placeholder='Input your ID' ref={userIdBox}></input>
                <button type="button" onClick={addUserId}>submit</button>
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
                <div className='cursorBox'>
                    <Hand props = {Tools.HAND}/>
                    <Cursor props = {Tools.CURSOR}/>
                </div>
                <Text   props = {Tools.TEXT}/>
                <Pen    props = {Tools.PEN} icon = {faPen}/>
                <Pen    props = {Tools.HIGHLIGHTER} icon = {faHighlighter}/>
                <Eraser props = {Tools.ERASER} />
                <PostIt props={Tools.POSTIT}/>
                <div className='shapeBox'>
                    <Stamp handleIconBtnClick={handleIconBtnClick} props={Tools.STAMP}/>
                    <Shape handleIconBtnClick={handleIconBtnClick} props={Tools.SHAPE}/>
                </div>
                <MindMap props = {Tools.MINDMAP}/>
           
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