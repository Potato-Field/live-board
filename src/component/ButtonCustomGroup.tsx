import { ChangeEvent } from 'react';

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

import { faPen, faHighlighter } from '@fortawesome/free-solid-svg-icons'

import styles from './ButtonCustomGroup.module.css';

interface ButtonCustomGroupProps {
    handleIconBtnClick: (id: string) => void;
}

export const ButtonCustomGroup = ({handleIconBtnClick}: ButtonCustomGroupProps) =>{
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

    return(
        <>
            <ButtonGroup className={styles.BtnGroupContainer} variant="contained" aria-label="outlined primary button group" style={{position: "absolute", bottom: "10%", left: "50%", transform: "translate(-50%, 0)", maxWidth: "100%", zIndex: '9999'}}>
                <Tooltip arrow placement="top" title="Undo">
                    <IconButton className={styles.BtnGroupContainer}><UndoRoundedIcon /></IconButton>
                </Tooltip>
                <Tooltip arrow placement="top" title="Redo">
                    <IconButton className={styles.BtnGroupContainer}><RedoRoundedIcon /></IconButton>
                </Tooltip>

                <ButtonGroup className='cursorBox BtnGroup' orientation="vertical" style={{margin:0}}>
                    <Cursor props = {Tools.CURSOR}/>
                    <Hand props = {Tools.HAND}/>
                </ButtonGroup>

                <Text   props = {Tools.TEXT}/>
                <Pen    props = {Tools.PEN} icon = {faPen}/>
                <Pen    props = {Tools.HIGHLIGHTER} icon = {faHighlighter}/>
                <Eraser props = {Tools.ERASER} />
                <PostIt props={Tools.POSTIT}/>

                <ButtonGroup className='shapeBox'>
                    <Stamp handleIconBtnClick={handleIconBtnClick} props={Tools.STAMP}/>
                    <Shape handleIconBtnClick={handleIconBtnClick} props={Tools.SHAPE}/>
                </ButtonGroup>

                <MindMap props = {Tools.MINDMAP}/>

                <ButtonGroup className='shapeBox'  orientation="vertical" style={{margin:0}}>
                    <ButtonGroup className='colorBox'>
                        <Tooltip arrow placement="top" title="Black">
                            <IconButton className={styles.colorBtn} onClick={()=>{handleColorClick('#000000')}}><CircleIcon className={styles.circle} style={{color: '000000'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Red">
                            <IconButton className={styles.colorBtn} onClick={()=>{handleColorClick('#E7464B')}}><CircleIcon className={styles.circle} style={{color: 'E7464B'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Blue">
                            <IconButton className={styles.colorBtn} onClick={()=>{handleColorClick('#3B7EF2')}}><CircleIcon className={styles.circle} style={{color: '3B7EF2'}}/></IconButton>
                        </Tooltip>
                    </ButtonGroup>
                    <ButtonGroup  className={styles.BtnGroupContainer} style={{margin:0}}>
                        <Tooltip arrow placement="top" title="Green">
                            <IconButton className={styles.colorBtn} onClick={()=>{handleColorClick('#79D375')}}><CircleIcon className={styles.circle} style={{color: '79D375'}}/></IconButton>
                        </Tooltip>

                        <Tooltip arrow placement="top" title="Yellow">
                            <IconButton className={styles.colorBtn} onClick={()=>{handleColorClick('#F7D054')}}><CircleIcon className={styles.circle} style={{color: 'F7D054'}}/></IconButton>
                        </Tooltip>
                        <Tooltip arrow placement="top" title="Custom">
                            <IconButton className={styles.colorBtn}>
                                <input type="color" id={styles.customColor} className={styles.circle} name="customColor" value={currentColor} onChange={handleColorClick} style={{borderRadius: '50%'}}/>
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                </ButtonGroup>
            </ButtonGroup>
        </>
    );
}