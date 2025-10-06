import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface AGTurLogoProps {
  width?: number;
  height?: number;
}

export const AGTurLogo: React.FC<AGTurLogoProps> = ({ width = 300, height = 160 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 160">
      {/* Arco roxo */}
      <Path
        d="M10 80 C 40 30, 140 20, 220 40"
        stroke="#5A2CA0"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      {/* Arco vermelho */}
      <Path
        d="M200 20 C 270 10, 300 40, 280 70"
        stroke="#E11D48"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      {/* Arco amarelo */}
      <Path
        d="M40 70 C 70 110, 180 120, 260 90"
        stroke="#FACC15"
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      {/* Texto AG TUR */}
      <SvgText
        x={90}
        y={95}
        fontSize={28}
        fontWeight="700"
        fill="#321B66"
      >
        AG TUR
      </SvgText>
    </Svg>
  );
};

export default AGTurLogo;