import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './fonts';
import {FPS, TOTAL_FRAMES} from './theme';
import {Video} from './Video';

loadFonts();

export const Root: React.FC = () => (
  <>
    <Composition id="Teaser16x9" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{withAudio: true}} />
    <Composition id="Teaser9x16" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{withAudio: true}} />
  </>
);
