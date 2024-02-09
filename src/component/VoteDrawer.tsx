import * as React from 'react';
import { useState } from 'react';
import Konva from 'konva';

import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Divider from '@mui/joy/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { Card, CardContent, Typography, CardActions, Grid, IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';

import styles from './VoteDrawer.module.css';

interface PostItData {
  id: string,
  text: string,
  thumbUp : number,
  thumbDown : number,
};

export function toggleDrawer(setOpen: React.Dispatch<React.SetStateAction<boolean>>, inOpen: boolean, stageRef: React.RefObject<Konva.Stage>, setPostIt: React.Dispatch<React.SetStateAction<PostItData[]>>) {
  
  const getThumbs = (id: string) => {
    if(!stageRef.current) return;

    let thumbsUpCnt = 0;
    let thumbsDownCnt = 0;

    const postIt: any = stageRef.current.getLayers()[0].findOne('#'+id);
    let shapes = stageRef.current.find('Image');
    let box = postIt.getClientRect();

    const rowSelected: Konva.Node[] = shapes.filter((shape:any) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
    );

    rowSelected.forEach((node)=>{
      if(node.name() === 'thumbUp'){
        thumbsUpCnt++;
      } else {
        thumbsDownCnt++;
      }
    })

    const returnData = {
      thumbUp : thumbsUpCnt,
      thumbDown : thumbsDownCnt
    }
    
    return returnData
  }
  return (event: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    setOpen(inOpen)
    if (event.type !== 'click' && event.type !== 'touch' && event.type !== 'keydown') {
      return;
    }
    
    const postItData: PostItData[] = [];
    if(!stageRef.current) return;

    let allPostIt:any = stageRef.current.getLayers()[0].find(".postIt")

    for (let i=0; i<allPostIt.length; i++) {
      const id: string = allPostIt[i].attrs.id;
      const text: string = allPostIt[i].findOne('.postItText').attrs.text;
      const thumbUpData = getThumbs(id);
      
      let thumbUpCnt = 0
      let thumbDownCnt = 0
      
      if(thumbUpData){
        thumbUpCnt = thumbUpData.thumbUp;
        thumbDownCnt = thumbUpData.thumbDown;
      }
      
      postItData.push({ id, text, thumbUp:thumbUpCnt, thumbDown:thumbDownCnt});
    }
    
    setPostIt(postItData)
  };
}

export function VoteDrawer({stageRef}:{stageRef:React.RefObject<Konva.Stage>}) {
  const [open, setOpen] = useState(false);
  const [postItData, setPostItData] = useState<PostItData[]>([]);

  const viewPostIt = (id: string, stageRef: React.RefObject<Konva.Stage>) => {
    if (!stageRef.current) return;

    const postIt: any = stageRef.current.getLayers()[0].findOne("#"+id);
    
    if (!postIt) return;

    // const scaleX = stageRef.current.scaleX();
    // const scaleY = stageRef.current.scaleY();

    const postItWidth = postIt.find('.postItText')[0].attrs.width;
    const postItHeight = postIt.find('.postItText')[0].attrs.height;
    const postItX = postIt.attrs.x;
    const postItY = postIt.attrs.y;

    /* 포스트잇 중앙 좌표 */
    const centerX = postItX + postItWidth / 2;
    const centerY = postItY + postItHeight / 2;

    const stageWidth = stageRef.current.width();
    const stageHeight = stageRef.current.height();
    const stageCenterX = stageWidth / 2;
    const stageCenterY = stageHeight / 2; // TODO: 네비바 높이 빼야함 (네비바 배치 수정 먼저 하기)

    const deltaX = stageCenterX - centerX;
    const deltaY = stageCenterY - centerY;

    /* 포스트잇 중심으로 Stage 이동 */
    stageRef.current.x(deltaX);
    stageRef.current.y(deltaY);
  }

  return (
    <>
      <IconButton size="large" aria-label="Postit vote" color="inherit" onClick={toggleDrawer(setOpen, true, stageRef, setPostItData)}>
        <HowToVoteIcon fontSize='large' />
      </IconButton>

      <Drawer open={open} onClose={()=>{setOpen(false)}} size='sm'>
        <h2>Vote results with postit</h2>
        <Divider />
        <Box role="presentation"> 
        

          {postItData.length !== 0 ? postItData.map((postItData) => (
            
            <Card variant="outlined" sx={{width: '90%'}} style={{margin: 'auto', backgroundColor: '#FFD966', marginTop: '1rem'}}>
              <CardContent style={{padding: '1.5rem'}}>
                <Typography variant="body1" component="div" className={styles.cardText}>
                  {postItData.text}
                </Typography>
              </CardContent>

              {/* TODO: div style css 파일에 분리 */}
              <CardActions>
                <Grid container spacing={0} columns={16} alignItems={'center'}>
                  <Grid item xs={4}>
                    <div className="upNum" style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }}>
                      <ThumbUpAltRoundedIcon fontSize='small' />
                      <Typography variant='body2' ml={1}>{postItData.thumbUp}</Typography>
                    </div>
                  </Grid>

                    <Grid item xs={4}>
                      <div className="downNum" style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }}>
                        <ThumbDownRoundedIcon fontSize='small' />
                        <Typography variant='body2' ml={1}>{postItData.thumbDown}</Typography>
                      </div>
                    </Grid>

                    <Grid item xs={4}></Grid>

                    {/* 클릭시 포스트잇 위치로 이동 */}
                    <Grid item xs={4}>
                      <IconButton 
                        onClick={() => {
                          viewPostIt(postItData.id, stageRef);
                          setOpen(false);
                           // 작동 안함
                        }}
                        onTouchStart={() => {
                          viewPostIt(postItData.id, stageRef);
                          setOpen(false);
                        }}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Grid>
                </Grid>
              </CardActions>
            </Card>
          )) : (
            <p className={styles.notice}>포스트잇을 생성하고<br/>스탬프(👍👎)로 투표해보세요!<br/><br/>이 공간에서 모든 포스트잇의 투표 결과를 확인할 수 있습니다.</p>
          )
          }
        </Box>
      </Drawer>
    </>
  );
}