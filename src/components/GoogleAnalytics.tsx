import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

const GOOGLE_ANALYTICS_ID = process.env.REACT_APP_GA_ID;

export function sendGAEvent(event: ReactGA.EventArgs) {
  if (GOOGLE_ANALYTICS_ID && GOOGLE_ANALYTICS_ID !== '') {
    ReactGA.initialize(GOOGLE_ANALYTICS_ID);
    ReactGA.event(event);
  }
}

const GoogleAnalytics: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = `${pathname}`;

    if (GOOGLE_ANALYTICS_ID && GOOGLE_ANALYTICS_ID !== '') {
      ReactGA.initialize(GOOGLE_ANALYTICS_ID);
      ReactGA.pageview(path);
    }
  }, [pathname]); // trigger only if path changes

  return <></>;
};

export default GoogleAnalytics;
