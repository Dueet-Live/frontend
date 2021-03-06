import React from 'react';
import { Notification } from '../types/Notification';

export type NotificationContextProps = (notification: Notification) => void;

export const NotificationContext = React.createContext<
  NotificationContextProps
>(() => {});
