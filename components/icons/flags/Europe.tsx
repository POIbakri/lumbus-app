import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, ClipPath, Line } from 'react-native-svg';

interface FlagProps {
  size?: number;
}

// France
export function FlagFR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="frClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#frClip)">
        <Rect fill="#002395" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Germany
export function FlagDE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="deClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#deClip)">
        <Rect fill="#000" width="512" height="171" />
        <Rect fill="#DD0000" y="171" width="512" height="170" />
        <Rect fill="#FFCE00" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// United Kingdom
export function FlagGB({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gbClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gbClip)">
        <Rect fill="#012169" width="512" height="512" />
        <Path d="M0 0l512 512M512 0L0 512" stroke="#FFF" strokeWidth="100" />
        <Path d="M0 0l512 512M512 0L0 512" stroke="#C8102E" strokeWidth="65" />
        <Path d="M256 0v512M0 256h512" stroke="#FFF" strokeWidth="170" />
        <Path d="M256 0v512M0 256h512" stroke="#C8102E" strokeWidth="100" />
      </G>
    </Svg>
  );
}

// UK alias
export function FlagUK({ size = 24 }: FlagProps) {
  return <FlagGB size={size} />;
}

// Italy
export function FlagIT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="itClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#itClip)">
        <Rect fill="#009246" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#CE2B37" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Spain
export function FlagES({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="esClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#esClip)">
        <Rect fill="#AA151B" width="512" height="512" />
        <Rect fill="#F1BF00" y="128" width="512" height="256" />
      </G>
    </Svg>
  );
}

// Switzerland
export function FlagCH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FF0000" width="512" height="512" rx="64" />
      <G fill="#FFF">
        <Rect x="176" y="96" width="160" height="320" />
        <Rect x="96" y="176" width="320" height="160" />
      </G>
    </Svg>
  );
}

// Netherlands
export function FlagNL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="nlClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#nlClip)">
        <Rect fill="#AE1C28" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#21468B" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Greece
export function FlagGR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="grClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#grClip)">
        <Rect fill="#0D5EAF" width="512" height="512" />
        <G fill="#FFF">
          <Rect y="57" width="512" height="57" />
          <Rect y="171" width="512" height="57" />
          <Rect y="285" width="512" height="57" />
          <Rect y="399" width="512" height="57" />
        </G>
        <Rect fill="#0D5EAF" width="190" height="228" />
        <Rect fill="#FFF" x="67" width="57" height="228" />
        <Rect fill="#FFF" y="85" width="190" height="57" />
      </G>
    </Svg>
  );
}

// Austria
export function FlagAT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="atClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#atClip)">
        <Rect fill="#ED2939" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#ED2939" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Belgium
export function FlagBE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="beClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#beClip)">
        <Rect fill="#000" width="171" height="512" />
        <Rect fill="#FAE042" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Portugal
export function FlagPT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ptClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ptClip)">
        <Rect fill="#006600" width="205" height="512" />
        <Rect fill="#FF0000" x="205" width="307" height="512" />
        <Circle fill="#FFCC00" cx="205" cy="256" r="80" />
        <Circle fill="#FF0000" cx="205" cy="256" r="60" />
        <Circle fill="#FFF" cx="205" cy="256" r="40" />
      </G>
    </Svg>
  );
}

// Sweden
export function FlagSE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="seClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#seClip)">
        <Rect fill="#006AA7" width="512" height="512" />
        <Rect fill="#FECC00" x="140" width="90" height="512" />
        <Rect fill="#FECC00" y="211" width="512" height="90" />
      </G>
    </Svg>
  );
}

// Norway
export function FlagNO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="noClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#noClip)">
        <Rect fill="#EF2B2D" width="512" height="512" />
        <Rect fill="#FFF" x="125" width="120" height="512" />
        <Rect fill="#FFF" y="196" width="512" height="120" />
        <Rect fill="#002868" x="155" width="60" height="512" />
        <Rect fill="#002868" y="226" width="512" height="60" />
      </G>
    </Svg>
  );
}

// Denmark
export function FlagDK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="dkClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#dkClip)">
        <Rect fill="#C60C30" width="512" height="512" />
        <Rect fill="#FFF" x="140" width="90" height="512" />
        <Rect fill="#FFF" y="211" width="512" height="90" />
      </G>
    </Svg>
  );
}

// Finland
export function FlagFI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="fiClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#fiClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Rect fill="#003580" x="140" width="90" height="512" />
        <Rect fill="#003580" y="211" width="512" height="90" />
      </G>
    </Svg>
  );
}

// Poland
export function FlagPL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="plClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#plClip)">
        <Rect fill="#FFF" width="512" height="256" />
        <Rect fill="#DC143C" y="256" width="512" height="256" />
      </G>
    </Svg>
  );
}

// Czech Republic
export function FlagCZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="czClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#czClip)">
        <Rect fill="#FFF" width="512" height="256" />
        <Rect fill="#D7141A" y="256" width="512" height="256" />
        <Path fill="#11457E" d="M0 0l256 256L0 512z" />
      </G>
    </Svg>
  );
}

// Hungary
export function FlagHU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="huClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#huClip)">
        <Rect fill="#CE2939" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#477050" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Romania
export function FlagRO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="roClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#roClip)">
        <Rect fill="#002B7F" width="171" height="512" />
        <Rect fill="#FCD116" x="171" width="170" height="512" />
        <Rect fill="#CE1126" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Bulgaria
export function FlagBG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bgClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bgClip)">
        <Rect fill="#FFF" width="512" height="171" />
        <Rect fill="#00966E" y="171" width="512" height="170" />
        <Rect fill="#D62612" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Croatia
export function FlagHR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="hrClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#hrClip)">
        <Rect fill="#FF0000" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#171796" y="341" width="512" height="171" />
        <Rect fill="#FF0000" x="196" y="120" width="120" height="150" />
      </G>
    </Svg>
  );
}

// Serbia
export function FlagRS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="rsClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#rsClip)">
        <Rect fill="#C6363C" width="512" height="171" />
        <Rect fill="#0C4076" y="171" width="512" height="170" />
        <Rect fill="#FFF" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Slovenia
export function FlagSI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="siClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#siClip)">
        <Rect fill="#FFF" width="512" height="171" />
        <Rect fill="#0000FF" y="171" width="512" height="170" />
        <Rect fill="#FF0000" y="341" width="512" height="171" />
        <Path fill="#0000FF" d="M80 80l60 80H20z" />
      </G>
    </Svg>
  );
}

// Slovakia
export function FlagSK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="skClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#skClip)">
        <Rect fill="#FFF" width="512" height="171" />
        <Rect fill="#0B4EA2" y="171" width="512" height="170" />
        <Rect fill="#EE1C25" y="341" width="512" height="171" />
        <Path fill="#FFF" d="M60 140h150v220H60z" />
        <Path fill="#EE1C25" d="M75 155h120v190H75z" />
      </G>
    </Svg>
  );
}

// Lithuania
export function FlagLT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ltClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ltClip)">
        <Rect fill="#FDB913" width="512" height="171" />
        <Rect fill="#006A44" y="171" width="512" height="170" />
        <Rect fill="#C1272D" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Latvia
export function FlagLV({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="lvClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#lvClip)">
        <Rect fill="#9E3039" width="512" height="512" />
        <Rect fill="#FFF" y="205" width="512" height="102" />
      </G>
    </Svg>
  );
}

// Estonia
export function FlagEE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="eeClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#eeClip)">
        <Rect fill="#0072CE" width="512" height="171" />
        <Rect fill="#000" y="171" width="512" height="170" />
        <Rect fill="#FFF" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Ireland
export function FlagIE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ieClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ieClip)">
        <Rect fill="#169B62" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#FF883E" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Cyprus
export function FlagCY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Path fill="#D47600" d="M150 180h212v100H150z" />
      <G fill="#4E5B31">
        <Circle cx="180" cy="350" r="20" />
        <Circle cx="256" cy="370" r="20" />
        <Circle cx="332" cy="350" r="20" />
      </G>
    </Svg>
  );
}

// Luxembourg
export function FlagLU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="luClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#luClip)">
        <Rect fill="#EF3340" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#00A3E0" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Malta
export function FlagMT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mtClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mtClip)">
        <Rect fill="#FFF" width="256" height="512" />
        <Rect fill="#CF142B" x="256" width="256" height="512" />
        <Rect fill="#7C7C7C" x="50" y="50" width="80" height="100" stroke="#7C7C7C" strokeWidth="5" />
      </G>
    </Svg>
  );
}

// Iceland
export function FlagIS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="isClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#isClip)">
        <Rect fill="#003897" width="512" height="512" />
        <Rect fill="#FFF" x="125" width="120" height="512" />
        <Rect fill="#FFF" y="196" width="512" height="120" />
        <Rect fill="#D72828" x="155" width="60" height="512" />
        <Rect fill="#D72828" y="226" width="512" height="60" />
      </G>
    </Svg>
  );
}

// Albania
export function FlagAL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#E41E20" width="512" height="512" rx="64" />
      <Path fill="#000" d="M256 120l-80 80 20 20-60 60v40l60-60 60 60 60-60-60 60v-40l-60-60 20-20z" />
    </Svg>
  );
}

// Bosnia and Herzegovina
export function FlagBA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="baClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#baClip)">
        <Rect fill="#002395" width="512" height="512" />
        <Path fill="#FECB00" d="M120 0l392 512H120z" />
        <G fill="#FFF">
          <Circle cx="150" cy="90" r="20" />
          <Circle cx="200" cy="160" r="20" />
          <Circle cx="250" cy="230" r="20" />
          <Circle cx="300" cy="300" r="20" />
          <Circle cx="350" cy="370" r="20" />
          <Circle cx="400" cy="440" r="20" />
        </G>
      </G>
    </Svg>
  );
}

// North Macedonia
export function FlagMK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#D20000" width="512" height="512" rx="64" />
      <Circle fill="#FFE600" cx="256" cy="256" r="80" />
      <G fill="#FFE600">
        <Path d="M256 0v512M0 256h512" strokeWidth="40" stroke="#FFE600" />
        <Path d="M0 0l512 512M512 0L0 512" strokeWidth="30" stroke="#FFE600" />
      </G>
    </Svg>
  );
}

// Montenegro
export function FlagME({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#C40308" width="512" height="512" rx="64" />
      <Rect x="20" y="20" width="472" height="472" rx="50" stroke="#D4AF37" strokeWidth="20" fill="none" />
      <Circle fill="#D4AF37" cx="256" cy="256" r="60" />
    </Svg>
  );
}

// Kosovo
export function FlagXK({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#244AA5" width="512" height="512" rx="64" />
      <Path fill="#D0A650" d="M180 200h152v150H180z" />
      <G fill="#FFF">
        <Circle cx="160" cy="120" r="15" />
        <Circle cx="210" cy="100" r="15" />
        <Circle cx="256" cy="90" r="15" />
        <Circle cx="302" cy="100" r="15" />
        <Circle cx="352" cy="120" r="15" />
      </G>
    </Svg>
  );
}

// Moldova
export function FlagMD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mdClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mdClip)">
        <Rect fill="#003DA5" width="171" height="512" />
        <Rect fill="#FFD200" x="171" width="170" height="512" />
        <Rect fill="#AD1519" x="341" width="171" height="512" />
        <Circle fill="#8B4513" cx="256" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// Belarus
export function FlagBY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="byClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#byClip)">
        <Rect fill="#C8313E" width="512" height="341" />
        <Rect fill="#4AA657" y="341" width="512" height="171" />
        <Rect fill="#FFF" width="80" height="512" />
        <G fill="#C8313E">
          <Rect x="20" y="40" width="40" height="40" />
          <Rect x="20" y="120" width="40" height="40" />
          <Rect x="20" y="200" width="40" height="40" />
          <Rect x="20" y="280" width="40" height="40" />
          <Rect x="20" y="360" width="40" height="40" />
          <Rect x="20" y="440" width="40" height="40" />
        </G>
      </G>
    </Svg>
  );
}

// Ukraine
export function FlagUA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="uaClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#uaClip)">
        <Rect fill="#005BBB" width="512" height="256" />
        <Rect fill="#FFD500" y="256" width="512" height="256" />
      </G>
    </Svg>
  );
}

// Andorra
export function FlagAD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="adClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#adClip)">
        <Rect fill="#10069F" width="154" height="512" />
        <Rect fill="#FEDD00" x="154" width="204" height="512" />
        <Rect fill="#D50032" x="358" width="154" height="512" />
      </G>
    </Svg>
  );
}

// Monaco
export function FlagMC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mcClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mcClip)">
        <Rect fill="#CE1126" width="512" height="256" />
        <Rect fill="#FFF" y="256" width="512" height="256" />
      </G>
    </Svg>
  );
}

// Liechtenstein
export function FlagLI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="liClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#liClip)">
        <Rect fill="#002B7F" width="512" height="256" />
        <Rect fill="#CE1126" y="256" width="512" height="256" />
        <Circle fill="#FFD83D" cx="140" cy="140" r="50" />
      </G>
    </Svg>
  );
}

// Gibraltar
export function FlagGI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="giClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#giClip)">
        <Rect fill="#FFF" width="512" height="341" />
        <Rect fill="#DA000C" y="341" width="512" height="171" />
        <Rect fill="#DA000C" x="200" y="120" width="112" height="180" />
      </G>
    </Svg>
  );
}

// Isle of Man
export function FlagIM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#CF142B" width="512" height="512" rx="64" />
      <Circle fill="#FFF" cx="256" cy="256" r="100" />
    </Svg>
  );
}

// Jersey
export function FlagJE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Path d="M0 0l512 512M512 0L0 512" stroke="#DF112D" strokeWidth="60" />
    </Svg>
  );
}

// Guernsey
export function FlagGG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#FFF" width="512" height="512" rx="64" />
      <Rect fill="#E8112D" x="200" width="112" height="512" />
      <Rect fill="#E8112D" y="200" width="512" height="112" />
      <Rect fill="#F9DD16" x="220" y="220" width="72" height="72" />
    </Svg>
  );
}

// Aland Islands
export function FlagAX({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="axClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#axClip)">
        <Rect fill="#0053A5" width="512" height="512" />
        <Rect fill="#FFCE00" x="120" width="130" height="512" />
        <Rect fill="#FFCE00" y="191" width="512" height="130" />
        <Rect fill="#DA0E15" x="150" width="70" height="512" />
        <Rect fill="#DA0E15" y="221" width="512" height="70" />
      </G>
    </Svg>
  );
}

// Faroe Islands
export function FlagFO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="foClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#foClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Rect fill="#003897" x="120" width="130" height="512" />
        <Rect fill="#003897" y="191" width="512" height="130" />
        <Rect fill="#EF303E" x="150" width="70" height="512" />
        <Rect fill="#EF303E" y="221" width="512" height="70" />
      </G>
    </Svg>
  );
}

// Turkey
export function FlagTR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#E30A17" width="512" height="512" rx="64" />
      <Circle fill="#FFF" cx="200" cy="256" r="100" />
      <Circle fill="#E30A17" cx="230" cy="256" r="80" />
      <Path fill="#FFF" d="M320 256l-50-35 20 55-50-35h60l-50 35 20-55z" />
    </Svg>
  );
}

// European Union
export function FlagEU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#003399" width="512" height="512" rx="64" />
      <G fill="#FFCC00">
        <Path d="M256 80l6 18-16-11h20l-16 11z" />
        <Path d="M311 100l6 18-16-11h20l-16 11z" />
        <Path d="M351 140l6 18-16-11h20l-16 11z" />
        <Path d="M371 195l6 18-16-11h20l-16 11z" />
        <Path d="M371 261l6 18-16-11h20l-16 11z" />
        <Path d="M351 316l6 18-16-11h20l-16 11z" />
        <Path d="M311 356l6 18-16-11h20l-16 11z" />
        <Path d="M256 376l6 18-16-11h20l-16 11z" />
        <Path d="M201 356l6 18-16-11h20l-16 11z" />
        <Path d="M161 316l6 18-16-11h20l-16 11z" />
        <Path d="M141 261l6 18-16-11h20l-16 11z" />
        <Path d="M141 195l6 18-16-11h20l-16 11z" />
        <Path d="M161 140l6 18-16-11h20l-16 11z" />
        <Path d="M201 100l6 18-16-11h20l-16 11z" />
      </G>
    </Svg>
  );
}
