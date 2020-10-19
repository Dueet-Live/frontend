import { IconButton, Snackbar, SnackbarProps } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import { Notification } from '../types/Notification';
import { NotificationContext } from './Notification/NotificationContext';

const NotificationShell: React.FC = ({ children }) => {
  const [notification, setNotification] = useState<Notification>({
    message: '',
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notification.message === '') return;

    setOpen(true);
  }, [notification]);

  const handleClose = () => setOpen(false);

  const snackbarProps: SnackbarProps = {
    anchorOrigin: { vertical: 'top', horizontal: 'center' },
    autoHideDuration: 6000,
    open: open,
    onClose: handleClose,
    action: (
      <IconButton size="small" onClick={handleClose}>
        <Close fontSize="small" />
      </IconButton>
    ),
  };

  const whichSnackbar = () => {
    if (!notification.severity) {
      return <Snackbar {...snackbarProps} message={notification.message} />;
    }

    return (
      <Snackbar {...snackbarProps}>
        <Alert
          onClose={handleClose}
          elevation={6}
          variant="filled"
          severity={notification.severity}
          style={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    );
  };

  return (
    <NotificationContext.Provider value={setNotification}>
      {whichSnackbar()}
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationShell;
