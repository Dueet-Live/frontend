// Refer to https://github.com/TeamWertarbyte/material-auto-rotating-carousel for complete definition
declare module 'material-auto-rotating-carousel' {
  import { ModalProps } from '@material-ui/core';
  import React from 'react';
  export interface AutoRotatingCarouselProps {
    // If false, the auto play behavior is disabled.
    autoplay?: boolean;

    // Properties applied to the Button element.
    ButtonProps?: ButtonProps;

    // Override the inline-styles of the carousel container.
    containerStyle?: { [className: string]: React.CSSProperties };

    // Properties applied to the Modal element.
    ModalProps?: ModalProps;

    // Controls whether the AutoRotatingCarousel is opened or not. Default false
    open?: boolean;

    // Delay between auto play transitions (in ms). Default 3000
    interval?: number;

    // Button text. If not supplied, the button will be hidden.
    label?: string;

    // If true, slide will adjust content for wide mobile screens.
    landscape?: boolean;

    // If true, the screen width and height is filled.
    mobile?: boolean;

    // Fired when the gray background of the popup is pressed when it is open.
    onClose?: () => void;

    // Fired when the user clicks the getting started button.
    onStart?: () => void;
  }
  let AutoRotatingCarousel: React.ComponentClass<AutoRotatingCarouselProps>;

  export interface SlideProps {
    media?: JSX.Element;

    // Override the inline-styles of the media container.
    mediaBackgroundStyle?: React.CSSProperties;

    // Override the inline-styles of the slide.
    style?: React.CSSProperties;
    title?: string;
    subtitle?: string;
  }

  let Slide: React.ComponentClass<SlideProps>;
}
