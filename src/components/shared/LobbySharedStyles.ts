import { makeStyles } from '@material-ui/core';

const useSharedLobbyStyles = makeStyles(theme => ({
  optionLabel: {
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h5.fontSize,
    },
  },
}));

export default useSharedLobbyStyles;
