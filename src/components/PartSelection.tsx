import { Box, Button, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import PlayerIcon from '../icons/PlayerIcon';
import { Part } from '../types/messages';
import { getReady } from '../utils/roomInfo';
import { PlayerContext } from './PlayerContext';
import { RoomContext } from './RoomContext';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
    justifyContent: 'center',
  },
  paper: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: theme.spacing(10),
    height: theme.spacing(10),
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  box: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // TODO: put in theme colors
  primo: {
    backgroundColor: '#B0A3F9',
  },
  secondo: {
    backgroundColor: '#F2BC92',
  },
  label: {
    color: theme.palette.primary.main,
  },
}));

type Props = {
  primo: number[];
  secondo: number[];
  didSelect(part: Part): void;
};

export const PartSelection: React.FC<Props> = ({
  primo,
  secondo,
  didSelect,
}) => {
  const classes = useStyles();
  const { me: myPlayerId } = useContext(PlayerContext);
  const { roomInfo } = useContext(RoomContext);
  const ready = getReady(roomInfo, myPlayerId);

  // TODO make it apparent that part selection cannot be changed after ready
  const generateButton = (part: Part, className: string, players: number[]) => {
    return (
      <Box className={classes.box}>
        <Button onClick={() => didSelect(part)} disabled={ready.me}>
          <Paper elevation={5} className={`${classes.paper} ${className}`}>
            {players.map(id => (
              <PlayerIcon num={id} key={id} myPlayerId={myPlayerId} />
            ))}
          </Paper>
        </Button>
        <Typography variant="body1" className={classes.label}>
          {part.charAt(0).toUpperCase() + part.slice(1)}
        </Typography>
      </Box>
    );
  };

  return (
    <div className={classes.root}>
      {generateButton('primo', classes.primo, primo)}
      {generateButton('secondo', classes.secondo, secondo)}
    </div>
  );
};
