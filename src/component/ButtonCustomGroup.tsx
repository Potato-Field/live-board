import { ChangeEvent, useState } from 'react';

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

import { ButtonGroup, IconButton, Tooltip } from '@mui/material';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import CircleIcon from '@mui/icons-material/Circle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faHighlighter, faStamp, faShapes } from '@fortawesome/free-solid-svg-icons'

import styles from './ButtonCustomGroup.module.css';

interface ButtonCustomGroupProps {
    handleIconBtnClick: (id: string) => void;
    handleUndo: () => void;
    handleRedo: () => void;
}

export const ButtonCustomGroup = ({handleIconBtnClick, handleUndo, handleRedo}: ButtonCustomGroupProps) =>{
    const { currentColor, setCurrentColor } = useColor();

    // 색상 변경
    const handleColorClick = (e: string | ChangeEvent<HTMLInputElement> ) => {
        // single color 클릭시
        if (typeof e === 'string'){
            setCurrentColor(e);
        } 
        // 팔레트에서 선택시
        else {
            const customColor = e.target.value;
            setCurrentColor(customColor); 
        }
    };

    const [isAllStamp, setIsAllStamp] = useState<boolean>(false);
    function toggleStamp() {
        setIsAllStamp((isAllStamp) => !isAllStamp);
    }

    const [isAllShape, setIsAllShape] = useState<boolean>(false);
    function toggleShape() {
        setIsAllShape((isAllShape) => !isAllShape);
    }

    return(
        <>
            <ButtonGroup id='btnGroupContained' variant="contained">
                <ButtonGroup id='btnGroupCursor'>
                    <Tooltip arrow placement="top" title="Undo">
                        <IconButton onClick={handleUndo} className={styles.BtnGroupContainer}><UndoRoundedIcon /></IconButton>
                    </Tooltip>
                    <Tooltip arrow placement="top" title="Redo">
                        <IconButton onClick={handleRedo} className={styles.BtnGroupContainer}><RedoRoundedIcon /></IconButton>
                    </Tooltip>
                </ButtonGroup>

                <ButtonGroup className='cursorBox BtnGroup' orientation="vertical">
                    <Cursor props = {Tools.CURSOR}/>
                    <Hand props = {Tools.HAND}/>
                </ButtonGroup>

                <ButtonGroup id="btnGroupTools">
                    <Text   props = {Tools.TEXT}/>
                    <Pen    props = {Tools.PEN} icon = {faPen}/>
                    <Pen    props = {Tools.HIGHLIGHTER} icon = {faHighlighter}/>
                    <Eraser props = {Tools.ERASER} />
                    <PostIt props={Tools.POSTIT}/>

                    <IconButton id='btnStamp'  onClick={() => { toggleStamp(); setIsAllShape(false); }}>
                        <Tooltip arrow placement="top" title="Stamp">
                            <FontAwesomeIcon icon={faStamp} size='lg'/>
                        </Tooltip>

                        {isAllStamp && 
                        <ButtonGroup id='btnAllStamp' variant="contained">
                            <Stamp handleIconBtnClick={handleIconBtnClick} props={Tools.STAMP}/>
                        </ButtonGroup>
                        }
                    </IconButton>

                    <IconButton id='btnShape' onClick={() => { toggleShape(); setIsAllStamp(false); }}>
                        <Tooltip arrow placement="top" title="Shape">
                            <FontAwesomeIcon icon={faShapes} size='lg'/>
                        </Tooltip>
                        
                        {isAllShape && 
                        <ButtonGroup id='btnAllShape' variant="contained">
                            <Shape handleIconBtnClick={handleIconBtnClick} props={Tools.SHAPE}/>
                        </ButtonGroup>
                        }
                    </IconButton>

                    <MindMap props = {Tools.MINDMAP}/>
                </ButtonGroup>

                <ButtonGroup id='btnGroupColors' orientation="vertical">
                    <ButtonGroup>
                        <Tooltip arrow placement="top" title="Black">
                            <IconButton onClick={()=>{handleColorClick('#000000')}}><CircleIcon className={styles.circle} style={{color: '000000'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Red">
                            <IconButton onClick={()=>{handleColorClick('#E7464B')}}><CircleIcon className={styles.circle} style={{color: 'E7464B'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Blue">
                            <IconButton onClick={()=>{handleColorClick('#3B7EF2')}}><CircleIcon className={styles.circle} style={{color: '3B7EF2'}}/></IconButton>
                        </Tooltip>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Tooltip arrow placement="top" title="Green">
                            <IconButton onClick={()=>{handleColorClick('#79D375')}}><CircleIcon className={styles.circle} style={{color: '79D375'}}/></IconButton>
                        </Tooltip>

                        <Tooltip arrow placement="top" title="Yellow">
                            <IconButton onClick={()=>{handleColorClick('#F7D054')}}><CircleIcon className={styles.circle} style={{color: 'F7D054'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Custom">
                            <IconButton id='customColorBtn' style={{width: '40px'}}>
                                <input type="color" id={styles.customColor} className={styles.circle} name="customColor" value={currentColor} onChange={handleColorClick}/>
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                </ButtonGroup>
            </ButtonGroup>
        </>
    );
}