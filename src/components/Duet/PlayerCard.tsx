import { Box, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';
import PlayerIcon from '../../icons/PlayerIcon';
import { Part } from '../../types/messages';
import { getDisplayNameForPart } from '../../utils/partNames';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: '#F0F0F0',
    height: 'calc(1vw * 20)',
    width: 'calc(1vw * 20)',
    '@media (orientation: portrait)': {
      height: 'calc(1vw * 40)',
      width: 'calc(1vw * 40)',
    },
  },
  mainBox: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(2),
    },
  },
  playerCardIdentifier: {
    fontSize: theme.typography.body1.fontSize,
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h4.fontSize,
    },
  },
  pill: {
    borderRadius: '9999px',
    textAlign: 'center',
    padding: theme.spacing(0.5),
  },
  partPill: {
    background: '#FC7B66',
    color: 'white',
  },
  readyPill: {
    background: '#66E7FC',
  },
}));

type Props = {
  myPlayerId: number;
} & (
  | { playerId: null }
  | { playerId: number; isReady: boolean; part: Part | null }
);

const PlayerCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { myPlayerId } = props;

  const playerDetails = () => {
    if (props.playerId === null) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          flex="1"
          justifyContent="center"
          alignContent="center"
          textAlign="center"
        >
          <Typography variant="body1">
            Invite your friend using the Room PIN!
          </Typography>
        </Box>
      );
    }

    let { isReady, part } = props;

    return (
      <>
        {/* pills and avatar */}
        <Box
          display="flex"
          justifyContent="space-around"
          width="100%"
          visibility={part === null ? 'hidden' : 'visible'}
        >
          {/* part pill */}
          <Box flexGrow={1} display="flex" justifyContent="center">
            <Box width="90%" className={`${classes.pill} ${classes.partPill}`}>
              <Typography variant="body2">
                {part ? getDisplayNameForPart(part) : ''}
              </Typography>
            </Box>
          </Box>
          {/* ready pill */}
          <Box
            flexGrow={1}
            display="flex"
            justifyContent="center"
            visibility={isReady ? 'visible' : 'hidden'}
          >
            <Box width="90%" className={`${classes.pill} ${classes.readyPill}`}>
              <Typography variant="body2">ready</Typography>
            </Box>
          </Box>
        </Box>

        {/* player icon */}
        <Box height="50%" width="50%" display="flex" justifyContent="center">
          <PlayerIcon num={props.playerId} myPlayerId={myPlayerId} />
        </Box>
      </>
    );
  };

  return (
    <Paper elevation={3} className={classes.root}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        height="100%"
        className={classes.mainBox}
      >
        {playerDetails()}
        {/* name */}
        <Box textAlign="center">
          <Typography variant="body1" className={classes.playerCardIdentifier}>
            {myPlayerId === props.playerId ? 'Me' : 'Partner'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PlayerCard;
