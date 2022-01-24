import * as React from 'react';
import Svg, { SvgProps, Path } from 'react-native-svg';

function SvgFaceId(props: SvgProps) {
  return (
    <Svg width={24} height={24} fill="none" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5a1 1 0 00-1 1v2a1 1 0 01-2 0V6a3 3 0 013-3h2a1 1 0 010 2H6zM4 15a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 110 2H6a3 3 0 01-3-3v-2a1 1 0 011-1zM15 4a1 1 0 011-1h2a3 3 0 013 3v2a1 1 0 11-2 0V6a1 1 0 00-1-1h-2a1 1 0 01-1-1zM20 15a1 1 0 011 1v2a3 3 0 01-3 3h-2a1 1 0 110-2h2a1 1 0 001-1v-2a1 1 0 011-1zM15.5 8a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zM8.5 8a1 1 0 011 1v1a1 1 0 11-2 0V9a1 1 0 011-1zM9.647 14.363a1 1 0 00-1.305 1.515L9 15.125l-.658.753h.001l.002.002.003.003.008.007.022.018.061.049c.05.037.116.086.2.14.167.11.404.248.71.382.615.269 1.5.521 2.651.521 1.15 0 2.036-.252 2.65-.521.307-.134.544-.271.711-.381a3.344 3.344 0 00.261-.19l.022-.018.008-.007.003-.003.002-.001c.001-.001.002-.001-.657-.754l.659.753a1 1 0 00-1.306-1.515l-.008.006a2.827 2.827 0 01-.496.278c-.385.168-1 .353-1.849.353-.85 0-1.464-.185-1.85-.354a2.824 2.824 0 01-.495-.277l-.008-.006zM12 8a1 1 0 011 1v3a1.5 1.5 0 01-1.5 1.5H11a1 1 0 110-2V9a1 1 0 011-1z"
        fill="#8C8CA1"
      />
    </Svg>
  );
}

export default SvgFaceId;