import { useMediaQuery, useTheme } from '@material-ui/core';
import { AutoRotatingCarousel, Slide } from 'material-auto-rotating-carousel';
import React, { useEffect } from 'react';
import localforage from '../utils/extendedLocalForage';

const SEEN_TUTORIAL = 'seen_tutorial';

type Props = {
  showTutorial: boolean;
  setShowTutorial: (showTutorial: React.SetStateAction<boolean>) => void;
};

const Tutorial: React.FC<Props> = ({ showTutorial, setShowTutorial }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape)');

  useEffect(() => {
    async function checkLocalForage() {
      const seen = await localforage.getItem(SEEN_TUTORIAL);

      if (seen === null) {
        setShowTutorial(true);
        localforage.setItem(SEEN_TUTORIAL, 1);
      }
    }
    checkLocalForage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AutoRotatingCarousel
      open={showTutorial}
      mobile={isMobile}
      landscape={isLandscape}
      label="Let's play!"
      onClose={() => setShowTutorial(false)}
      onStart={() => setShowTutorial(false)}
    >
      <Slide
        title="Play a duet with your friend"
        subtitle="Collaborate with your friend to complete a piece! Your friend is busy now? Don't worry, try our solo mode first."
      />
      <Slide
        title="Easy to play on all devices"
        subtitle="We support both touch screen and keyboard input. No app downloading required."
      />
      <Slide
        title="You are playing real music"
        subtitle="The realistic keyboard work best on touch screen devices."
      />
      <Slide
        title="Game Tips"
        subtitle="For the best experience, use headphones and add Dueet Live to your home screen"
      />
    </AutoRotatingCarousel>
  );
};

export default Tutorial;
