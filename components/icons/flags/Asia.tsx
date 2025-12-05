import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, ClipPath, Polygon } from 'react-native-svg';

interface FlagProps {
  size?: number;
}

// Japan
export function FlagJP({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Circle fill="#BC002D" cx="256" cy="256" r="120" />
    </Svg>
  );
}

// China
export function FlagCN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#DE2910" width="512" height="512" rx="64" />
      <G fill="#FFDE00">
        <Path d="M140 120l15 46-39-28h48l-39 28z" />
        <Path d="M220 80l9 28-24-17h30l-24 17z" />
        <Path d="M260 115l9 28-24-17h30l-24 17z" />
        <Path d="M260 175l9 28-24-17h30l-24 17z" />
        <Path d="M220 210l9 28-24-17h30l-24 17z" />
      </G>
    </Svg>
  );
}

// South Korea
export function FlagKR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Circle fill="#C60C30" cx="256" cy="256" r="100" />
      <Path fill="#003478" d="M256 156a100 100 0 0 0 0 200" />
      <G stroke="#000" strokeWidth="24">
        <Path d="M105 105l80 80M130 105l80 80M155 105l80 80" />
        <Path d="M277 327l80 80M302 327l80 80M327 327l80 80" />
      </G>
    </Svg>
  );
}

// Indonesia
export function FlagID({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="idClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#idClip)">
        <Rect fill="#FF0000" width="512" height="256" />
        <Rect fill="#FFF" y="256" width="512" height="256" />
      </G>
    </Svg>
  );
}

// Thailand
export function FlagTH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="thClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#thClip)">
        <Rect fill="#A51931" width="512" height="512" />
        <Rect fill="#F4F5F8" y="85" width="512" height="342" />
        <Rect fill="#2D2A4A" y="170" width="512" height="172" />
      </G>
    </Svg>
  );
}

// Malaysia
export function FlagMY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="myClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#myClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <G fill="#CC0001">
          <Rect width="512" height="37" />
          <Rect y="73" width="512" height="37" />
          <Rect y="146" width="512" height="37" />
          <Rect y="219" width="512" height="37" />
          <Rect y="292" width="512" height="37" />
          <Rect y="365" width="512" height="37" />
          <Rect y="438" width="512" height="37" />
        </G>
        <Rect fill="#010066" width="256" height="256" />
        <Circle fill="#FC0" cx="115" cy="128" r="70" />
        <Circle fill="#010066" cx="135" cy="128" r="55" />
        <Path fill="#FC0" d="M180 128l20-15-25 5 10-22-15 20-15-20 10 22-25-5 20 15-20 15 25-5-10 22 15-20 15 20-10-22 25 5z" />
      </G>
    </Svg>
  );
}

// Singapore
export function FlagSG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="sgClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#sgClip)">
        <Rect fill="#ED2939" width="512" height="256" />
        <Rect fill="#FFF" y="256" width="512" height="256" />
        <Circle fill="#FFF" cx="150" cy="128" r="60" />
        <Circle fill="#ED2939" cx="170" cy="128" r="50" />
        <G fill="#FFF">
          <Circle cx="200" cy="80" r="8" />
          <Circle cx="240" cy="100" r="8" />
          <Circle cx="250" cy="140" r="8" />
          <Circle cx="220" cy="170" r="8" />
          <Circle cx="180" cy="160" r="8" />
        </G>
      </G>
    </Svg>
  );
}

// Vietnam
export function FlagVN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#DA251D" width="512" height="512" rx="64" />
      <Path fill="#FFFF00" d="M256 120l30 92-79-57h98l-79 57z" />
    </Svg>
  );
}

// Philippines
export function FlagPH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="phClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#phClip)">
        <Rect fill="#0038A8" width="512" height="256" />
        <Rect fill="#CE1126" y="256" width="512" height="256" />
        <Path fill="#FFF" d="M0 0l256 256L0 512z" />
        <Circle fill="#FCD116" cx="100" cy="256" r="35" />
        <Path fill="#FCD116" d="M50 130l10 30-26-19h32l-26 19zM50 382l10-30-26 19h32l-26-19zM175 256l-30 10 19-26v32l-19-26z" />
      </G>
    </Svg>
  );
}

// Hong Kong
export function FlagHK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#DE2910" width="512" height="512" rx="64" />
      <G fill="#FFF">
        <Path d="M256 150c-20 30-10 60 20 70-40-5-60 20-50 55 0-40-30-55-65-40 35-15 40-50 15-75 30 20 65 10 80-10z" />
      </G>
    </Svg>
  );
}

// Macau
export function FlagMO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#00785E" width="512" height="512" rx="64" />
      <Circle fill="#FFF" cx="256" cy="200" r="60" />
      <Path fill="#FFF" d="M180 300h152v30H180z" />
    </Svg>
  );
}

// Sri Lanka
export function FlagLK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="lkClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#lkClip)">
        <Rect fill="#8D153A" width="512" height="512" />
        <Rect fill="#FFBE29" x="40" y="40" width="432" height="432" />
        <Rect fill="#00544E" x="60" width="80" height="512" />
        <Rect fill="#FF7F00" x="140" width="80" height="512" />
        <Rect fill="#8D153A" x="260" y="60" width="192" height="392" />
      </G>
    </Svg>
  );
}

// India
export function FlagIN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="inClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#inClip)">
        <Rect fill="#FF9933" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#138808" y="341" width="512" height="171" />
        <Circle fill="#000080" cx="256" cy="256" r="50" />
        <Circle fill="#FFF" cx="256" cy="256" r="40" />
        <Circle fill="#000080" cx="256" cy="256" r="12" />
      </G>
    </Svg>
  );
}

// Pakistan
export function FlagPK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="pkClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#pkClip)">
        <Rect fill="#01411C" width="512" height="512" />
        <Rect fill="#FFF" width="128" height="512" />
        <Circle fill="#FFF" cx="320" cy="256" r="90" />
        <Circle fill="#01411C" cx="340" cy="256" r="75" />
        <Path fill="#FFF" d="M380 200l15 46-39-28h48l-39 28z" />
      </G>
    </Svg>
  );
}

// Bangladesh
export function FlagBD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#006A4E" width="512" height="512" rx="64" />
      <Circle fill="#F42A41" cx="230" cy="256" r="120" />
    </Svg>
  );
}

// Cambodia
export function FlagKH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="khClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#khClip)">
        <Rect fill="#032EA1" width="512" height="128" />
        <Rect fill="#E00025" y="128" width="512" height="256" />
        <Rect fill="#032EA1" y="384" width="512" height="128" />
        <Rect fill="#FFF" x="180" y="180" width="152" height="152" />
      </G>
    </Svg>
  );
}

// Laos
export function FlagLA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="laClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#laClip)">
        <Rect fill="#CE1126" width="512" height="128" />
        <Rect fill="#002868" y="128" width="512" height="256" />
        <Rect fill="#CE1126" y="384" width="512" height="128" />
        <Circle fill="#FFF" cx="256" cy="256" r="80" />
      </G>
    </Svg>
  );
}

// Mongolia
export function FlagMN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="mnClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#mnClip)">
        <Rect fill="#C4272F" width="171" height="512" />
        <Rect fill="#015197" x="171" width="170" height="512" />
        <Rect fill="#C4272F" x="341" width="171" height="512" />
        <Circle fill="#F9CF02" cx="85" cy="256" r="40" />
      </G>
    </Svg>
  );
}

// Myanmar
export function FlagMM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="mmClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#mmClip)">
        <Rect fill="#FECB00" width="512" height="171" />
        <Rect fill="#34B233" y="171" width="512" height="170" />
        <Rect fill="#EA2839" y="341" width="512" height="171" />
        <Path fill="#FFF" d="M256 100l40 123-105-76h130l-105 76z" />
      </G>
    </Svg>
  );
}

// Nepal
export function FlagNP({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Path fill="#DC143C" d="M80 80l200 176L80 432V80z" />
      <Path fill="#003893" d="M85 85l190 171L85 427V85z" />
      <Circle fill="#FFF" cx="150" cy="180" r="35" />
      <Circle fill="#FFF" cx="150" cy="320" r="25" />
    </Svg>
  );
}

// Brunei
export function FlagBN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="bnClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#bnClip)">
        <Rect fill="#F7E017" width="512" height="512" />
        <Path fill="#FFF" d="M0 170h512v172H0z" />
        <Path fill="#000" d="M0 200h512v112H0z" />
        <Circle fill="#CE1126" cx="256" cy="256" r="60" />
      </G>
    </Svg>
  );
}

// Maldives
export function FlagMV({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#D21034" width="512" height="512" rx="64" />
      <Rect fill="#007E3A" x="80" y="100" width="352" height="312" />
      <Circle fill="#FFF" cx="256" cy="256" r="70" />
      <Circle fill="#007E3A" cx="280" cy="256" r="60" />
    </Svg>
  );
}

// Tajikistan
export function FlagTJ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="tjClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#tjClip)">
        <Rect fill="#CC0000" width="512" height="146" />
        <Rect fill="#FFF" y="146" width="512" height="220" />
        <Rect fill="#006600" y="366" width="512" height="146" />
        <Circle fill="#F8C300" cx="256" cy="256" r="30" />
      </G>
    </Svg>
  );
}

// Kyrgyzstan
export function FlagKG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#E8112D" width="512" height="512" rx="64" />
      <Circle fill="#FFEF00" cx="256" cy="256" r="100" />
      <Circle fill="#E8112D" cx="256" cy="256" r="70" />
    </Svg>
  );
}

// Kazakhstan
export function FlagKZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#00AFCA" width="512" height="512" rx="64" />
      <Circle fill="#FEC50C" cx="256" cy="256" r="80" />
      <Path fill="#FEC50C" d="M60 100h40v312H60z" />
    </Svg>
  );
}

// Uzbekistan
export function FlagUZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="uzClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#uzClip)">
        <Rect fill="#1EB53A" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0099B5" y="341" width="512" height="171" />
        <Rect fill="#CE1126" y="160" width="512" height="11" />
        <Rect fill="#CE1126" y="341" width="512" height="11" />
        <Circle fill="#FFF" cx="120" cy="85" r="35" />
        <Circle fill="#0099B5" cx="135" cy="85" r="30" />
      </G>
    </Svg>
  );
}

// Armenia
export function FlagAM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="amClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#amClip)">
        <Rect fill="#D90012" width="512" height="171" />
        <Rect fill="#0033A0" y="171" width="512" height="170" />
        <Rect fill="#F2A800" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Azerbaijan
export function FlagAZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="azClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#azClip)">
        <Rect fill="#3F9C35" width="512" height="171" />
        <Rect fill="#ED2939" y="171" width="512" height="170" />
        <Rect fill="#00B9E4" y="341" width="512" height="171" />
        <Circle fill="#FFF" cx="256" cy="256" r="50" />
        <Circle fill="#ED2939" cx="270" cy="256" r="40" />
        <Path fill="#FFF" d="M300 256l15-10-12 5v-15l-8 13-8-13v15l-12-5z" />
      </G>
    </Svg>
  );
}

// Georgia
export function FlagGE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Path fill="#FF0000" d="M220 0h72v512h-72zM0 220h512v72H0z" />
      <G fill="#FF0000">
        <Path d="M80 80h40v40H80zM80 160h40v40H80zM160 80h40v40h-40zM160 160h40v40h-40z" />
        <Path d="M312 80h40v40h-40zM312 160h40v40h-40zM392 80h40v40h-40zM392 160h40v40h-40z" />
        <Path d="M80 312h40v40H80zM80 392h40v40H80zM160 312h40v40h-40zM160 392h40v40h-40z" />
        <Path d="M312 312h40v40h-40zM312 392h40v40h-40zM392 312h40v40h-40zM392 392h40v40h-40z" />
      </G>
    </Svg>
  );
}

// Afghanistan
export function FlagAF({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <ClipPath id="afClip"><Rect width="512" height="512" rx="64" /></ClipPath>
      </Defs>
      <G clipPath="url(#afClip)">
        <Rect fill="#000" width="171" height="512" />
        <Rect fill="#BF0000" x="171" width="170" height="512" />
        <Rect fill="#009900" x="341" width="171" height="512" />
        <Circle fill="#FFF" cx="256" cy="256" r="60" stroke="#FFF" strokeWidth="5" />
      </G>
    </Svg>
  );
}
