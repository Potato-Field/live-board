import IconButton from '@mui/material/IconButton';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownRoundedIcon from '@mui/icons-material/ThumbDownRounded';

import { Card, CardContent, CardActions, Typography, Grid } from '@mui/material';

export function VoteResult() {
    return (
        <>
            {/* TODO: 포스트잇 생성될 때마다 card 추가 */}
            {/* TODO: 포스트잇 내용/투표결과 변할 때마다 계속 update */}
            <Card variant="outlined" sx={{width: '90%'}} style={{margin: 'auto', backgroundColor: '#FFD966', marginTop: '20px'}}>
                <CardContent>
                    <Typography variant="body1" component="div">
                        포스트잇 내용d d dddd ddd d ddddd d ddddddddd ddddddddddddddd
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
        </>
    );
}