import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/material/IconButton';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { VoteResult } from './VoteResult';

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
      <IconButton size="large" aria-label="Postit vote" color="inherit" onClick={toggleDrawer(setOpen, true)}>
        <HowToVoteIcon fontSize='large' />
      </IconButton>

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