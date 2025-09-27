import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface AGTurIconProps {
  size?: number;
  backgroundColor?: string;
  busColor?: string;
}

export const AGTurIcon: React.FC<AGTurIconProps> = ({ 
  size = 100, 
  backgroundColor = '#FFC107',
  busColor = '#1A1A1A' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Circle cx="512" cy="512" r="512" fill={backgroundColor} />
      <Path
        d="M 256 320 
           Q 256 256, 320 256
           L 704 256
           Q 768 256, 768 320
           L 768 640
           Q 768 704, 704 704
           L 680 704
           L 680 832
           Q 680 896, 616 896
           L 584 896
           Q 520 896, 520 832
           L 520 704
           L 504 704
           L 504 832
           Q 504 896, 440 896
           L 408 896
           Q 344 896, 344 832
           L 344 704
           L 320 704
           Q 256 704, 256 640
           Z
           M 400 200
           L 624 200
           Q 640 200, 640 216
           Q 640 232, 624 232
           L 400 232
           Q 384 232, 384 216
           Q 384 200, 400 200
           Z
           M 320 320
           L 704 320
           L 704 512
           Q 704 528, 688 528
           L 336 528
           Q 320 528, 320 512
           Z
           M 360 608
           Q 392 608, 392 640
           Q 392 672, 360 672
           Q 328 672, 328 640
           Q 328 608, 360 608
           Z
           M 664 608
           Q 696 608, 696 640
           Q 696 672, 664 672
           Q 632 672, 632 640
           Q 632 608, 664 608
           Z"
        fill={busColor}
      />
    </Svg>
  );
};

export default AGTurIcon;
