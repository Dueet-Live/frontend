import {
  Box,
  BoxProps,
  ButtonBase,
  makeStyles,
  SvgIcon,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { ReactComponent as RealisticPiano } from '../../svg/realistic-piano.svg';
import { ReactComponent as SmartPianoIcon } from '../../svg/smart-piano.svg';
import useSharedLobbyStyles from './LobbySharedStyles';

const useStyles = makeStyles(theme => ({
  pianoIcon: {
    height: '100%',
    width: '100%',
  },
  pianoIconSelected: {
    borderRadius: '10px',
    backgroundColor: '#C4C4C4',
  },
  selectPianoButtonBase: {
    display: 'flex',
    maxWidth: '40%',
    flexDirection: 'column',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = BoxProps & {
  useSmartPiano: boolean;
  setUseSmartPiano: (newValue: boolean) => void;
};

const LobbyKeyboardTypeSelector: React.FC<Props> = ({
  useSmartPiano,
  setUseSmartPiano,
  ...boxProps
}) => {
  const classes = useStyles();
  const lobbySharedStyles = useSharedLobbyStyles();

  return (
    <Box display="flex" justifyContent="space-between" {...boxProps}>
      <Box flex="0 0 30%" display="flex" alignItems="center">
        <Typography variant="body1" className={lobbySharedStyles.optionLabel}>
          Keyboard type
        </Typography>
      </Box>
      <Box display="flex" flexGrow={1} justifyContent="space-around">
        <ButtonBase
          className={classes.selectPianoButtonBase}
          onClick={() => setUseSmartPiano(true)}
          disabled={useSmartPiano}
        >
          <Box
            textAlign="center"
            p={1}
            className={useSmartPiano ? classes.pianoIconSelected : ''}
          >
            <SvgIcon
              component={SmartPianoIcon}
              viewBox="0 0 200 125"
              className={classes.pianoIcon}
            />
          </Box>
          <Typography variant="body1">Smart</Typography>
        </ButtonBase>
        <ButtonBase
          className={classes.selectPianoButtonBase}
          onClick={() => setUseSmartPiano(false)}
          disabled={!useSmartPiano}
        >
          <Box
            textAlign="center"
            p={1}
            className={!useSmartPiano ? classes.pianoIconSelected : ''}
          >
            <SvgIcon
              component={RealisticPiano}
              viewBox="0 0 200 125"
              className={classes.pianoIcon}
            />
          </Box>
          <Typography variant="body1">Realistic</Typography>
        </ButtonBase>
      </Box>
    </Box>
  );
};

export default LobbyKeyboardTypeSelector;
