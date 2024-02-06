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
    var shapes = stageRef.current.find('Image');
    var box = postIt.getClientRect();

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
  
  return (
    <>
      <IconButton size="large" aria-label="Postit vote" color="inherit" onClick={toggleDrawer(setOpen, true, stageRef, setPostItData)}>
        <HowToVoteIcon fontSize='large' />
      </IconButton>

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