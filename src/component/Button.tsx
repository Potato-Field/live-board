import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import * as React from 'react';
export default function BasicButtonGroup(props:any) {
  const [tool, setTool] = React.useState()
  setTool(props);

  return (
    <ButtonGroup variant="contained" aria-label="outlined primary button group">
      <Button >pen</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  );
}