import { makeStyles } from '@material-ui/core';

const useSharedLobbyStyles = makeStyles(theme => ({
  optionLabel: {
    [theme.breakpoints.up('md')]: {
      fontSize: theme.typography.h5.fontSize,
    },
  },
  roundedBorder: {
    borderColor: theme.palette.primary.main,
    borderStyle: 'solid',
    borderRadius: '3vh',
    borderWidth: '2px',
  },
}));

export default useSharedLobbyStyles;
