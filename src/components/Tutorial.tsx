import { useMediaQuery, useTheme, withStyles } from '@material-ui/core';
import { AutoRotatingCarousel, Slide } from 'material-auto-rotating-carousel';
import React, { useEffect } from 'react';
import AddToHomeScreen from '../svg/add-to-home-screen.svg';
import Headset from '../svg/headset.svg';
import Keyboard from '../svg/keyboard.svg';
import RealisticPiano from '../svg/realistic-piano.svg';
import TouchApp from '../svg/touchapp.svg';
import localforage from '../utils/extendedLocalForage';

const SEEN_TUTORIAL = 'seen_tutorial';

type Props = {
  showTutorial: boolean;
  setShowTutorial: (showTutorial: React.SetStateAction<boolean>) => void;
};

const StyledSlide = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.primary.dark,
  },
  mediaBackground: {
    backgroundColor: theme.palette.primary.light,
  },
  mediaBackgroundMobile: {
    height: 'calc(100% - 280px)',
  },
  mediaBackgroundMobileLandscape: {
    height: '100%',
    flex: '1 1',
    alignSelf: 'stretch',
  },
  title: {
    whiteSpace: 'normal',
  },
}))(Slide);

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
      autoplay={false}
      open={showTutorial}
      mobile={isMobile}
      landscape={isLandscape}
      label="Let's play!"
      onClose={() => setShowTutorial(false)}
      onStart={() => setShowTutorial(false)}
    >
      <StyledSlide
        media={<>GIF showing clicking on duet and copying link</>}
        title="Play a duet with your friend"
        subtitle="Collaborate with your friend to complete a piece! Oh, your friend is busy now? Don't worry, try our solo mode first."
      />
      <StyledSlide
        media={<>GIF showing picking options</>}
        title="Customize your playing options"
        subtitle="Pick your song, speed, and part of the duet to play and have some fun!"
      />
      <StyledSlide
        media={
          <>
            <img src={TouchApp} alt="Touch screen" />
            <img src={Keyboard} alt="Keyboard" />
          </>
        }
        title="Easy to play on all devices"
        subtitle="We support both touch screen and keyboard input. No app downloading required."
      />
      <StyledSlide
        media={
          <>
            <img src={RealisticPiano} alt="Realistic Keyboard" />
          </>
        }
        mediaBackgroundStyle={{ padding: theme.spacing(4) }}
        title="You are playing real music"
        subtitle="The realistic keyboard work best on touch screen devices."
      />
      <StyledSlide
        media={
          <>
            <img src={Headset} alt="Headset" />
            <img src={AddToHomeScreen} alt="Add to home screen" />
          </>
        }
        title="Game Tips"
        subtitle="For the best experience, use headphones and add Dueet Live to your home screen"
      />
    </AutoRotatingCarousel>
  );
};

export default Tutorial;
