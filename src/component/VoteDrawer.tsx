import * as React from 'react';
import { useState } from 'react';
import Konva from 'konva';

import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Divider from '@mui/joy/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { Button, ButtonGroup, Card, CardContent, Typography, CardActions, Grid } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';

interface PostItData {
  id: string
  text: string,
};

export function toggleDrawer(setOpen: React.Dispatch<React.SetStateAction<boolean>>, inOpen: boolean, stageRef:React.RefObject<Konva.Stage>, setPostIt:React.Dispatch<React.SetStateAction<PostItData[]>>) {
  return (event: React.MouseEvent | React.TouchEvent) => {
    if (event.type !== 'click' && event.type !== 'touch') {
      return;
    }
    setOpen(inOpen);

    const postItData: PostItData[] = [];
    if(!stageRef.current) return;

    let allPostIt:any = stageRef.current.getLayers()[0].find(".postIt")

    for (let i=0; i<allPostIt.length; i++) {
      const id: string = allPostIt[i].attrs.id;
      const text: string = allPostIt[i].findOne('.postItText').attrs.text;
      postItData.push({ id, text });
    }

    setPostIt(postItData)
  };
}

export function VoteDrawer({stageRef}:{stageRef:React.RefObject<Konva.Stage>}) {
  const [open, setOpen] = useState(false);
  const [postItData, setPostItData] = useState<PostItData[]>([]);
  
  return (
    <>
      <HowToVoteIcon fontSize='large' />
      <ButtonGroup aria-label="medium secondary button group" variant='contained' style={{marginLeft:'1rem'}}>
        <Button style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 시작</Button>,
        <Button style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 종료</Button>,
        <Button onClick={toggleDrawer(setOpen, true, stageRef, setPostItData)} style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 결과</Button>,
      </ButtonGroup>

      <Drawer open={open} onClose={toggleDrawer(setOpen, false, stageRef, setPostItData)} size='sm'>
        <h2>Vote results with postit</h2>
        <Divider />
        <Box
          role="presentation"
          onClick={toggleDrawer(setOpen, false, stageRef, setPostItData)}
          onTouchStart={toggleDrawer(setOpen, false, stageRef, setPostItData)}
        >

          {postItData.map((postItData) => (
            <Card variant="outlined" sx={{width: '90%'}} style={{margin: 'auto', backgroundColor: '#FFD966', marginTop: '20px'}}>
              <CardContent>
                <Typography variant="body1" component="div">
                  {postItData.text}
                </Typography>
              </CardContent>

              {/* TODO: div style css 파일에 분리 */}
              <CardActions>
                <Grid container spacing={0} columns={16} alignItems={'center'}>
                  <Grid item xs={4}>
                    <div className="upNum" style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }}>
                      <ThumbUpAltRoundedIcon fontSize='small' />
                      {/* 좋아요 수 */}
                      <Typography variant='body2' ml={1}>3</Typography>
                    </div>
                  </Grid>

                    <Grid item xs={4}>
                      <div className="downNum" style={{ display: 'flex', alignItems: 'center', justifyContent:'center' }}>
                        <ThumbDownRoundedIcon fontSize='small' />
                        {/* 싫어요 수 */}
                        <Typography variant='body2' ml={1}>5</Typography>
                      </div>
                    </Grid>

                    <Grid item xs={4}></Grid>

                    {/* 클릭시 포스트잇 위치로 이동 */}
                    <Grid item xs={4}>
                      <IconButton>
                        <ZoomInIcon />
                      </IconButton>
                    </Grid>
                </Grid>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Drawer>
    </>
  );
}