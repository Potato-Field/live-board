import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Divider from '@mui/joy/Divider';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { VoteResult } from './VoteResult';
import { Button, ButtonGroup } from '@mui/material';

export function toggleDrawer(setOpen: React.Dispatch<React.SetStateAction<boolean>>, inOpen: boolean) {
  return (event: React.MouseEvent | React.TouchEvent) => {
    if (event.type !== 'click' && event.type !== 'touch') {
      return;
    }
    setOpen(inOpen);
  };
}

export function VoteDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <HowToVoteIcon fontSize='large' />
      <ButtonGroup aria-label="medium secondary button group" variant='contained' style={{marginLeft:'1rem'}}>
        <Button key="one" style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 시작</Button>,
        <Button key="two" style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 종료</Button>,
        <Button key="three" onClick={toggleDrawer(setOpen, true)} style={{backgroundColor: 'white', color: 'black', fontWeight: 'bold'}}>투표 결과</Button>,
      </ButtonGroup>

      {/* <IconButton size="large" aria-label="Postit vote" color="inherit">
      </IconButton> */}

      <Drawer open={open} onClose={toggleDrawer(setOpen, false)} size='sm'>
        <h2>Vote results with postit</h2>
        <Divider />
        <Box
          role="presentation"
          onClick={toggleDrawer(setOpen, false)}
          onTouchStart={toggleDrawer(setOpen, false)}
        >
          <VoteResult />
        </Box>
      </Drawer>
    </>
  );
}