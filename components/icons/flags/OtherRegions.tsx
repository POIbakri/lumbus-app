import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, ClipPath, Polygon } from 'react-native-svg';

interface FlagProps {
  size?: number;
}

// ==================== OCEANIA ====================

// Australia
export function FlagAU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="auClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#auClip)">
        <Rect fill="#00008B" width="512" height="512" />
        <G>
          <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
          <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
          <Path d="M0 0l256 192M256 0L0 192" stroke="#FF0000" strokeWidth="25" />
          <Path d="M128 0v192M0 96h256" stroke="#FF0000" strokeWidth="30" />
        </G>
        <G fill="#FFF">
          <Path d="M100 350l12 36-30-22h36l-30 22z" />
          <Circle cx="400" cy="380" r="18" />
          <Circle cx="450" cy="200" r="14" />
          <Circle cx="380" cy="280" r="14" />
          <Circle cx="330" cy="350" r="12" />
          <Circle cx="470" cy="300" r="12" />
        </G>
      </G>
    </Svg>
  );
}

// New Zealand
export function FlagNZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="nzClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#nzClip)">
        <Rect fill="#00247D" width="512" height="512" />
        <G>
          <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
          <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
          <Path d="M0 0l256 192M256 0L0 192" stroke="#CC142B" strokeWidth="25" />
          <Path d="M128 0v192M0 96h256" stroke="#CC142B" strokeWidth="30" />
        </G>
        <G fill="#CC142B">
          <Path d="M400 140l8 24-20-15h24l-20 15z" />
          <Path d="M440 240l8 24-20-15h24l-20 15z" />
          <Path d="M400 340l8 24-20-15h24l-20 15z" />
          <Path d="M340 280l8 24-20-15h24l-20 15z" />
        </G>
      </G>
    </Svg>
  );
}

// Guam
export function FlagGU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#002F6C" width="512" height="512" rx="64" />
      <Rect x="15" y="15" width="482" height="482" rx="50" stroke="#BE0027" strokeWidth="30" fill="none" />
      <Path fill="#002F6C" d="M150 180h212v180H150z" />
      <Circle fill="#87CEEB" cx="256" cy="270" r="80" />
    </Svg>
  );
}

// ==================== MIDDLE EAST ====================

// United Arab Emirates
export function FlagAE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="aeClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#aeClip)">
        <Rect fill="#00732F" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
        <Rect fill="#FF0000" width="128" height="512" />
      </G>
    </Svg>
  );
}

// Saudi Arabia
export function FlagSA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#006C35" width="512" height="512" rx="64" />
      <G fill="#FFF">
        <Path d="M128 280h256v24H128z" />
        <Path d="M256 160c-50 0-90 40-90 90h24c0-36.5 29.5-66 66-66s66 29.5 66 66h24c0-50-40-90-90-90z" />
        <Rect x="244" y="230" width="24" height="74" />
      </G>
    </Svg>
  );
}

// Qatar
export function FlagQA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="qaClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#qaClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Path fill="#8D1B3D" d="M150 0l50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28 50 28-50 28h362V0z" />
      </G>
    </Svg>
  );
}

// Kuwait
export function FlagKW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="kwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#kwClip)">
        <Rect fill="#007A3D" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#CE1126" y="341" width="512" height="171" />
        <Path fill="#000" d="M0 0l170 256L0 512z" />
      </G>
    </Svg>
  );
}

// Bahrain
export function FlagBH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bhClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bhClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Path fill="#CE1126" d="M150 0l40 51-40 51 40 51-40 51 40 51-40 51 40 51-40 51 40 51-40 52h362V0z" />
      </G>
    </Svg>
  );
}

// Oman
export function FlagOM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="omClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#omClip)">
        <Rect fill="#FFF" width="512" height="171" />
        <Rect fill="#009A00" y="171" width="512" height="170" />
        <Rect fill="#EF2B2D" y="341" width="512" height="171" />
        <Rect fill="#EF2B2D" width="130" height="512" />
        <Rect fill="#FFF" x="40" y="100" width="50" height="60" />
      </G>
    </Svg>
  );
}

// Israel
export function FlagIL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ilClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ilClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Rect fill="#0038B8" y="70" width="512" height="60" />
        <Rect fill="#0038B8" y="382" width="512" height="60" />
        <Path fill="none" stroke="#0038B8" strokeWidth="20" d="M256 160l70 120-70 120-70-120z" />
        <Path fill="none" stroke="#0038B8" strokeWidth="20" d="M256 400l70-120-70-120-70 120z" />
      </G>
    </Svg>
  );
}

// Jordan
export function FlagJO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="joClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#joClip)">
        <Rect fill="#000" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#007A3D" y="341" width="512" height="171" />
        <Path fill="#CE1126" d="M0 0l256 256L0 512z" />
        <Path fill="#FFF" d="M80 256l12 36-30-22h36l-30 22z" />
      </G>
    </Svg>
  );
}

// Iraq
export function FlagIQ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="iqClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#iqClip)">
        <Rect fill="#CE1126" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
        <Path fill="#007A3D" d="M180 230h152v52H180z" />
      </G>
    </Svg>
  );
}

// ==================== AFRICA ====================

// South Africa
export function FlagZA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="zaClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#zaClip)">
        <Rect fill="#E03C31" width="512" height="171" />
        <Rect fill="#001489" y="341" width="512" height="171" />
        <Rect fill="#FFF" y="140" width="512" height="60" />
        <Rect fill="#FFF" y="312" width="512" height="60" />
        <Path fill="#007749" d="M0 140h512v232H0z" />
        <Path fill="#FFB81C" d="M0 0l180 256L0 512z" />
        <Path fill="#000" d="M0 50l130 206L0 462z" />
        <Path fill="#007749" d="M0 100l80 156L0 412z" />
      </G>
    </Svg>
  );
}

// Egypt
export function FlagEG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="egClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#egClip)">
        <Rect fill="#CE1126" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
        <Path fill="#C09300" d="M220 220h72v72h-72z" />
      </G>
    </Svg>
  );
}

// Morocco
export function FlagMA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#C1272D" width="512" height="512" rx="64" />
      <Path fill="none" stroke="#006233" strokeWidth="20" d="M256 140l30 92-79-57h98l-79 57z" />
    </Svg>
  );
}

// Algeria
export function FlagDZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="dzClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#dzClip)">
        <Rect fill="#006233" width="256" height="512" />
        <Rect fill="#FFF" x="256" width="256" height="512" />
        <Circle fill="#D21034" cx="280" cy="256" r="80" />
        <Circle fill="#FFF" cx="300" cy="256" r="65" />
        <Path fill="#D21034" d="M320 256l25-18-10 28 25 18h-30l-10 28-10-28h-30l25-18-10-28z" />
      </G>
    </Svg>
  );
}

// Tunisia
export function FlagTN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#E70013" width="512" height="512" rx="64" />
      <Circle fill="#FFF" cx="256" cy="256" r="100" />
      <Circle fill="#E70013" cx="275" cy="256" r="80" />
      <Path fill="#E70013" d="M300 256l30-22-12 35 30 22h-36l-12 35-12-35h-36l30-22-12-35z" />
    </Svg>
  );
}

// Kenya
export function FlagKE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="keClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#keClip)">
        <Rect fill="#000" width="512" height="154" />
        <Rect fill="#BB0000" y="154" width="512" height="204" />
        <Rect fill="#006600" y="358" width="512" height="154" />
        <Rect fill="#FFF" y="134" width="512" height="20" />
        <Rect fill="#FFF" y="358" width="512" height="20" />
        <Path fill="#BB0000" d="M256 100l-60 156 60 156 60-156z" />
      </G>
    </Svg>
  );
}

// Nigeria
export function FlagNG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ngClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ngClip)">
        <Rect fill="#008751" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#008751" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Tanzania
export function FlagTZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="tzClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#tzClip)">
        <Rect fill="#00A3DD" width="512" height="256" />
        <Rect fill="#1EB53A" y="256" width="512" height="256" />
        <Path fill="#FCD116" d="M0 0l512 512" stroke="#FCD116" strokeWidth="100" />
        <Path fill="#000" d="M0 0l512 512" stroke="#000" strokeWidth="60" />
      </G>
    </Svg>
  );
}

// Uganda
export function FlagUG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ugClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ugClip)">
        <Rect fill="#000" width="512" height="85" />
        <Rect fill="#FCDC04" y="85" width="512" height="85" />
        <Rect fill="#D90000" y="170" width="512" height="85" />
        <Rect fill="#000" y="255" width="512" height="85" />
        <Rect fill="#FCDC04" y="340" width="512" height="85" />
        <Rect fill="#D90000" y="425" width="512" height="87" />
        <Circle fill="#FFF" cx="256" cy="256" r="70" />
      </G>
    </Svg>
  );
}

// Rwanda
export function FlagRW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="rwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#rwClip)">
        <Rect fill="#00A1DE" width="512" height="256" />
        <Rect fill="#FAD201" y="256" width="512" height="128" />
        <Rect fill="#1A8012" y="384" width="512" height="128" />
        <Circle fill="#FAD201" cx="400" cy="100" r="50" />
      </G>
    </Svg>
  );
}

// Mauritius
export function FlagMU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="muClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#muClip)">
        <Rect fill="#EA2839" width="512" height="128" />
        <Rect fill="#1A206D" y="128" width="512" height="128" />
        <Rect fill="#FFD500" y="256" width="512" height="128" />
        <Rect fill="#00A551" y="384" width="512" height="128" />
      </G>
    </Svg>
  );
}

// Seychelles
export function FlagSC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="scClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#scClip)">
        <Rect fill="#003F87" width="512" height="512" />
        <Path fill="#FCD856" d="M0 512l512-200V512z" />
        <Path fill="#D62828" d="M0 512l512-400V312L0 512z" />
        <Path fill="#FFF" d="M0 512l512 0V512L0 200z" />
        <Path fill="#007A3D" d="M0 512V340l512 172z" />
      </G>
    </Svg>
  );
}

// Zambia
export function FlagZM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="zmClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#zmClip)">
        <Rect fill="#198A00" width="512" height="512" />
        <Rect fill="#EF7D00" x="300" y="341" width="70" height="171" />
        <Rect fill="#000" x="370" y="341" width="70" height="171" />
        <Rect fill="#DE2010" x="440" y="341" width="72" height="171" />
      </G>
    </Svg>
  );
}

// Botswana
export function FlagBW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bwClip)">
        <Rect fill="#6DA9D2" width="512" height="185" />
        <Rect fill="#FFF" y="185" width="512" height="25" />
        <Rect fill="#000" y="210" width="512" height="92" />
        <Rect fill="#FFF" y="302" width="512" height="25" />
        <Rect fill="#6DA9D2" y="327" width="512" height="185" />
      </G>
    </Svg>
  );
}

// Mozambique
export function FlagMZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mzClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mzClip)">
        <Rect fill="#009A44" width="512" height="171" />
        <Rect fill="#000" y="171" width="512" height="170" />
        <Rect fill="#FCE100" y="341" width="512" height="171" />
        <Rect fill="#FFF" y="160" width="512" height="11" />
        <Rect fill="#FFF" y="341" width="512" height="11" />
        <Path fill="#D21034" d="M0 0l200 256L0 512z" />
      </G>
    </Svg>
  );
}

// Malawi
export function FlagMW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mwClip)">
        <Rect fill="#000" width="512" height="171" />
        <Rect fill="#CE1126" y="171" width="512" height="170" />
        <Rect fill="#339E35" y="341" width="512" height="171" />
        <Circle fill="#CE1126" cx="256" cy="80" r="60" />
      </G>
    </Svg>
  );
}

// Eswatini (Swaziland)
export function FlagSZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="szClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#szClip)">
        <Rect fill="#3E5EB9" width="512" height="100" />
        <Rect fill="#FFD900" y="100" width="512" height="50" />
        <Rect fill="#B10C0C" y="150" width="512" height="212" />
        <Rect fill="#FFD900" y="362" width="512" height="50" />
        <Rect fill="#3E5EB9" y="412" width="512" height="100" />
      </G>
    </Svg>
  );
}

// Senegal
export function FlagSN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="snClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#snClip)">
        <Rect fill="#00853F" width="171" height="512" />
        <Rect fill="#FDEF42" x="171" width="170" height="512" />
        <Rect fill="#E31B23" x="341" width="171" height="512" />
        <Path fill="#00853F" d="M256 180l20 60-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Cameroon
export function FlagCM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cmClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cmClip)">
        <Rect fill="#007A5E" width="171" height="512" />
        <Rect fill="#CE1126" x="171" width="170" height="512" />
        <Rect fill="#FCD116" x="341" width="171" height="512" />
        <Path fill="#FCD116" d="M256 180l20 60-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Ivory Coast (Cote d'Ivoire)
export function FlagCI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ciClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ciClip)">
        <Rect fill="#F77F00" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#009E60" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Gabon
export function FlagGA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gaClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gaClip)">
        <Rect fill="#009E60" width="512" height="171" />
        <Rect fill="#FCD116" y="171" width="512" height="170" />
        <Rect fill="#3A75C4" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Republic of the Congo
export function FlagCG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cgClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cgClip)">
        <Rect fill="#009543" width="512" height="512" />
        <Path fill="#FBDE4A" d="M0 0l512 512" stroke="#FBDE4A" strokeWidth="180" />
        <Path fill="#DC241F" d="M512 0v512" />
      </G>
    </Svg>
  );
}

// Chad
export function FlagTD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="tdClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#tdClip)">
        <Rect fill="#002664" width="171" height="512" />
        <Rect fill="#FECB00" x="171" width="170" height="512" />
        <Rect fill="#C60C30" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Central African Republic
export function FlagCF({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cfClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cfClip)">
        <Rect fill="#003082" width="512" height="128" />
        <Rect fill="#FFF" y="128" width="512" height="128" />
        <Rect fill="#289728" y="256" width="512" height="128" />
        <Rect fill="#FFCE00" y="384" width="512" height="128" />
        <Rect fill="#D21034" x="220" width="72" height="512" />
        <Path fill="#FFCE00" d="M80 50l10 30-26-19h32l-26 19z" />
      </G>
    </Svg>
  );
}

// Burkina Faso
export function FlagBF({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bfClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bfClip)">
        <Rect fill="#EF2B2D" width="512" height="256" />
        <Rect fill="#009E49" y="256" width="512" height="256" />
        <Path fill="#FCD116" d="M256 160l25 77-65-47h80l-65 47z" />
      </G>
    </Svg>
  );
}

// Mali
export function FlagML({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mlClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mlClip)">
        <Rect fill="#14B53A" width="171" height="512" />
        <Rect fill="#FCD116" x="171" width="170" height="512" />
        <Rect fill="#CE1126" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Niger
export function FlagNE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="neClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#neClip)">
        <Rect fill="#E05206" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0DB02B" y="341" width="512" height="171" />
        <Circle fill="#E05206" cx="256" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// Liberia
export function FlagLR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="lrClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#lrClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <G fill="#BF0A30">
          <Rect width="512" height="46" /><Rect y="93" width="512" height="46" />
          <Rect y="186" width="512" height="46" /><Rect y="279" width="512" height="46" />
          <Rect y="372" width="512" height="46" /><Rect y="465" width="512" height="47" />
        </G>
        <Rect fill="#002868" width="186" height="232" />
        <Path fill="#FFF" d="M93 116l18 55-47-34h58l-47 34z" />
      </G>
    </Svg>
  );
}

// Sudan
export function FlagSD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="sdClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#sdClip)">
        <Rect fill="#D21034" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
        <Path fill="#007229" d="M0 0l200 256L0 512z" />
      </G>
    </Svg>
  );
}

// Madagascar
export function FlagMG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mgClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mgClip)">
        <Rect fill="#FC3D32" x="130" width="382" height="256" />
        <Rect fill="#007E3A" x="130" y="256" width="382" height="256" />
        <Rect fill="#FFF" width="130" height="512" />
      </G>
    </Svg>
  );
}

// Reunion
export function FlagRE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="reClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#reClip)">
        <Rect fill="#002395" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// ==================== ADDITIONAL MIDDLE EAST ====================

// Yemen
export function FlagYE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="yeClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#yeClip)">
        <Rect fill="#CE1126" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Lebanon
export function FlagLB({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="lbClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#lbClip)">
        <Rect fill="#ED1C24" width="512" height="128" />
        <Rect fill="#FFF" y="128" width="512" height="256" />
        <Rect fill="#ED1C24" y="384" width="512" height="128" />
        <Path fill="#00A651" d="M256 150l40 120h-80z" />
        <Rect fill="#00A651" x="240" y="270" width="32" height="60" />
      </G>
    </Svg>
  );
}

// Palestine
export function FlagPS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="psClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#psClip)">
        <Rect fill="#000" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#009736" y="341" width="512" height="171" />
        <Path fill="#CE1126" d="M0 0l200 256L0 512z" />
      </G>
    </Svg>
  );
}

// Syria
export function FlagSY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="syClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#syClip)">
        <Rect fill="#CE1126" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#000" y="341" width="512" height="171" />
        <G fill="#007A3D">
          <Path d="M180 256l15 46-39-28h48l-39 28z" />
          <Path d="M332 256l15 46-39-28h48l-39 28z" />
        </G>
      </G>
    </Svg>
  );
}

// Iran
export function FlagIR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="irClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#irClip)">
        <Rect fill="#239F40" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#DA0000" y="341" width="512" height="171" />
        <Circle fill="#DA0000" cx="256" cy="256" r="60" />
      </G>
    </Svg>
  );
}

// ==================== ADDITIONAL OCEANIA ====================

// Fiji
export function FlagFJ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="fjClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#fjClip)">
        <Rect fill="#68BFE5" width="512" height="512" />
        <G>
          <Path d="M0 0l192 144M192 0L0 144" stroke="#FFF" strokeWidth="30" />
          <Path d="M96 0v144M0 72h192" stroke="#FFF" strokeWidth="40" />
          <Path d="M0 0l192 144M192 0L0 144" stroke="#CE1126" strokeWidth="18" />
          <Path d="M96 0v144M0 72h192" stroke="#CE1126" strokeWidth="24" />
        </G>
        <Rect fill="#FFF" x="300" y="180" width="150" height="150" />
        <Rect fill="#CE1126" x="320" y="200" width="110" height="110" />
      </G>
    </Svg>
  );
}

// Papua New Guinea
export function FlagPG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="pgClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#pgClip)">
        <Rect fill="#000" width="512" height="512" />
        <Path fill="#CE1126" d="M0 0h512v512z" />
        <G fill="#FCD116">
          <Path d="M400 200l12 36-30-22h36l-30 22z" />
          <Path d="M450 280l8 24-20-14h24l-20 14z" />
          <Path d="M420 360l8 24-20-14h24l-20 14z" />
          <Path d="M360 320l8 24-20-14h24l-20 14z" />
          <Path d="M380 400l8 24-20-14h24l-20 14z" />
        </G>
        <Path fill="#FCD116" d="M100 150l60 80-80-20 80 20-60 80z" />
      </G>
    </Svg>
  );
}

// Samoa
export function FlagWS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="wsClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#wsClip)">
        <Rect fill="#CE1126" width="512" height="512" />
        <Rect fill="#002B7F" width="280" height="280" />
        <G fill="#FFF">
          <Path d="M140 80l8 24-20-14h24l-20 14z" />
          <Path d="M180 120l6 18-15-11h18l-15 11z" />
          <Path d="M200 180l6 18-15-11h18l-15 11z" />
          <Path d="M140 160l6 18-15-11h18l-15 11z" />
          <Path d="M100 200l8 24-20-14h24l-20 14z" />
        </G>
      </G>
    </Svg>
  );
}

// Tonga
export function FlagTO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="toClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#toClip)">
        <Rect fill="#C10000" width="512" height="512" />
        <Rect fill="#FFF" width="200" height="200" />
        <Path fill="#C10000" d="M70 60h60v80H70zM100 60v-30h0v30z" />
        <Rect fill="#C10000" x="85" y="40" width="30" height="100" />
        <Rect fill="#C10000" x="55" y="75" width="90" height="30" />
      </G>
    </Svg>
  );
}

// Vanuatu
export function FlagVU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="vuClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#vuClip)">
        <Rect fill="#D21034" width="512" height="256" />
        <Rect fill="#009543" y="256" width="512" height="256" />
        <Path fill="#000" d="M0 200h512v112H0z" />
        <Path fill="#FDCE12" d="M0 210h512v92H0z" />
        <Path fill="#000" d="M0 0l250 256L0 512z" />
        <Circle fill="#FDCE12" cx="100" cy="256" r="60" />
      </G>
    </Svg>
  );
}

// ==================== ADDITIONAL AFRICA ====================

// Ghana
export function FlagGH({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ghClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ghClip)">
        <Rect fill="#CE1126" width="512" height="171" />
        <Rect fill="#FCD116" y="171" width="512" height="170" />
        <Rect fill="#006B3F" y="341" width="512" height="171" />
        <Path fill="#000" d="M256 170l20 62-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Ethiopia
export function FlagET({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="etClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#etClip)">
        <Rect fill="#078930" width="512" height="171" />
        <Rect fill="#FCDD09" y="171" width="512" height="170" />
        <Rect fill="#DA121A" y="341" width="512" height="171" />
        <Circle fill="#0F47AF" cx="256" cy="256" r="90" />
        <Path fill="#FCDD09" d="M256 180l20 62-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Congo DRC
export function FlagCD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cdClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cdClip)">
        <Rect fill="#007FFF" width="512" height="512" />
        <Path fill="#F7D618" d="M0 0l512 512" stroke="#F7D618" strokeWidth="80" />
        <Path fill="#CE1021" d="M0 50l512 512" stroke="#CE1021" strokeWidth="40" />
        <Path fill="#F7D618" d="M80 80l15 46-39-28h48l-39 28z" />
      </G>
    </Svg>
  );
}

// Angola
export function FlagAO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="aoClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#aoClip)">
        <Rect fill="#CE1126" width="512" height="256" />
        <Rect fill="#000" y="256" width="512" height="256" />
        <Circle cx="256" cy="256" r="70" stroke="#FFEC00" strokeWidth="10" fill="none" />
      </G>
    </Svg>
  );
}

// Zimbabwe
export function FlagZW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="zwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#zwClip)">
        <Rect fill="#319208" width="512" height="73" />
        <Rect fill="#FFD200" y="73" width="512" height="73" />
        <Rect fill="#DE2010" y="146" width="512" height="73" />
        <Rect fill="#000" y="219" width="512" height="74" />
        <Rect fill="#DE2010" y="293" width="512" height="73" />
        <Rect fill="#FFD200" y="366" width="512" height="73" />
        <Rect fill="#319208" y="439" width="512" height="73" />
        <Path fill="#FFF" d="M0 0l180 256L0 512z" />
        <Path fill="#FFD200" d="M80 256l20 60-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Namibia
export function FlagNA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="naClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#naClip)">
        <Rect fill="#003580" width="512" height="256" />
        <Rect fill="#009543" y="256" width="512" height="256" />
        <Path fill="#D21034" d="M0 0l512 512M0 512l512-512" stroke="#D21034" strokeWidth="100" />
        <Path fill="#FFF" d="M0 0l512 512M0 512l512-512" stroke="#FFF" strokeWidth="60" />
        <Circle fill="#FFD100" cx="140" cy="140" r="60" />
        <Circle fill="#003580" cx="160" cy="120" r="50" />
      </G>
    </Svg>
  );
}

// ==================== ASIA ADDITIONS ====================

// Taiwan
export function FlagTW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="twClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#twClip)">
        <Rect fill="#FE0000" width="512" height="512" />
        <Rect fill="#000095" width="256" height="256" />
        <Circle fill="#FFF" cx="128" cy="128" r="60" />
        <Circle fill="#000095" cx="128" cy="128" r="40" />
      </G>
    </Svg>
  );
}

// Timor-Leste (East Timor)
export function FlagTL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="tlClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#tlClip)">
        <Rect fill="#DC241F" width="512" height="512" />
        <Path fill="#FFC726" d="M0 0l350 256L0 512z" />
        <Path fill="#000" d="M0 0l250 256L0 512z" />
        <Path fill="#FFF" d="M80 256l30 92-79-57h98l-79 57z" />
      </G>
    </Svg>
  );
}

// ==================== REGIONAL FLAGS ====================

// GCC Flag (Gulf Cooperation Council)
export function FlagGCC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gccClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gccClip)">
        <Rect fill="#006233" width="512" height="512" />
        <Circle cx="256" cy="256" r="150" stroke="#006233" strokeWidth="20" fill="none" />
        <Circle fill="#006233" cx="256" cy="256" r="80" />
        <G fill="#FFF">
          <Rect x="246" y="140" width="20" height="40" />
          <Rect x="246" y="332" width="20" height="40" />
          <Rect x="140" y="246" width="40" height="20" />
          <Rect x="332" y="246" width="40" height="20" />
          <Rect x="175" y="175" width="20" height="30" transform="rotate(45 185 190)" />
          <Rect x="317" y="175" width="20" height="30" transform="rotate(-45 327 190)" />
        </G>
      </G>
    </Svg>
  );
}

// Global/World Flag
export function FlagGlobal({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="globalClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#globalClip)">
        <Rect fill="#4A90D9" width="512" height="512" />
        <Circle fill="none" stroke="#FFF" strokeWidth="8" cx="256" cy="256" r="180" />
        <Path fill="none" stroke="#FFF" strokeWidth="8" d="M76 256h360" />
        <Path fill="none" stroke="#FFF" strokeWidth="8" d="M256 76v360" />
        <Path fill="none" stroke="#FFF" strokeWidth="6" d="M120 150c70-50 152-50 222 0" />
        <Path fill="none" stroke="#FFF" strokeWidth="6" d="M120 362c70 50 152 50 222 0" />
        <Path fill="#7EC850" d="M150 200c30-20 80-20 110 0l-55 80z" />
        <Path fill="#7EC850" d="M252 200c30-20 80-20 110 0l-55 80z" />
        <Path fill="#7EC850" d="M200 300c25 15 65 15 90 0l-45 60z" />
      </G>
    </Svg>
  );
}

// ASEAN Flag
export function FlagASEAN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="aseanClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#aseanClip)">
        <Rect fill="#003580" width="512" height="512" />
        <Circle fill="#FFF" cx="256" cy="256" r="160" />
        <Circle fill="#003580" cx="256" cy="256" r="120" />
        <G fill="#F7D618">
          <Path d="M256 120l10 30-26-19h32l-26 19z" />
          <Path d="M336 180l-26 19 10-30-26 19h32z" transform="rotate(72 256 256)" />
          <Path d="M370 280l-26 19 10-30-26 19h32z" transform="rotate(144 256 256)" />
          <Path d="M310 360l-26 19 10-30-26 19h32z" transform="rotate(216 256 256)" />
          <Path d="M200 360l-26 19 10-30-26 19h32z" transform="rotate(288 256 256)" />
        </G>
      </G>
    </Svg>
  );
}

// Africa Union Flag
export function FlagAU_Union({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="auuClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#auuClip)">
        <Rect fill="#009639" width="512" height="512" />
        <Circle fill="#FFF" cx="256" cy="256" r="160" stroke="#009639" strokeWidth="10" />
        <Circle fill="#009639" cx="256" cy="256" r="100" />
        <Path fill="#D4AF37" d="M256 170l20 62-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Caribbean Community (CARICOM) Flag
export function FlagCARICOM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="caricomClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#caricomClip)">
        <Rect fill="#002868" width="512" height="256" />
        <Rect fill="#009E49" y="256" width="512" height="256" />
        <Circle fill="#FCD116" cx="256" cy="256" r="100" />
        <Circle fill="#002868" cx="256" cy="256" r="70" />
      </G>
    </Svg>
  );
}

// Martinique
export function FlagMQ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mqClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mqClip)">
        <Rect fill="#002395" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Curacao
export function FlagCW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cwClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cwClip)">
        <Rect fill="#002B7F" width="512" height="512" />
        <Rect fill="#F9E814" y="340" width="512" height="50" />
        <Path fill="#FFF" d="M100 120l15 46-39-28h48l-39 28z" />
        <Path fill="#FFF" d="M160 180l10 30-26-19h32l-26 19z" />
      </G>
    </Svg>
  );
}

// Aruba
export function FlagAW({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="awClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#awClip)">
        <Rect fill="#418FDE" width="512" height="512" />
        <Rect fill="#F9D616" y="340" width="512" height="30" />
        <Rect fill="#F9D616" y="390" width="512" height="30" />
        <Path fill="#FFF" d="M100 120l20 62-52-38h64l-52 38z" stroke="#D21034" strokeWidth="4" />
      </G>
    </Svg>
  );
}

// Sint Maarten
export function FlagSX({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="sxClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#sxClip)">
        <Rect fill="#ED2939" width="512" height="256" />
        <Rect fill="#002395" y="256" width="512" height="256" />
        <Path fill="#FFF" d="M0 0l256 256L0 512z" />
        <Circle fill="#F9D616" cx="100" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// US Virgin Islands
export function FlagVI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="viClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#viClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Circle fill="#003580" cx="256" cy="256" r="120" />
        <Path fill="#FFF" d="M256 160l20 62-52-38h64l-52 38z" />
        <Path fill="#F9D616" d="M200 300h112v60H200z" />
      </G>
    </Svg>
  );
}

// French Guiana
export function FlagGF({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gfClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gfClip)">
        <Rect fill="#002395" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Suriname
export function FlagSR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="srClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#srClip)">
        <Rect fill="#377E3F" width="512" height="102" />
        <Rect fill="#FFF" y="102" width="512" height="51" />
        <Rect fill="#B40A2D" y="153" width="512" height="206" />
        <Rect fill="#FFF" y="359" width="512" height="51" />
        <Rect fill="#377E3F" y="410" width="512" height="102" />
        <Path fill="#ECC81D" d="M256 180l20 62-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}

// Guyana
export function FlagGY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gyClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gyClip)">
        <Rect fill="#009E49" width="512" height="512" />
        <Path fill="#FFF" d="M0 0l512 256L0 512z" />
        <Path fill="#FCD116" d="M0 30l460 226L0 482z" />
        <Path fill="#000" d="M0 0l256 256L0 512z" />
        <Path fill="#CE1126" d="M0 30l226 226L0 482z" />
      </G>
    </Svg>
  );
}

// Venezuela
export function FlagVE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="veClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#veClip)">
        <Rect fill="#FFCC00" width="512" height="171" />
        <Rect fill="#00247D" y="171" width="512" height="170" />
        <Rect fill="#CF142B" y="341" width="512" height="171" />
        <G fill="#FFF">
          <Circle cx="200" cy="256" r="8" />
          <Circle cx="230" cy="250" r="8" />
          <Circle cx="256" cy="240" r="8" />
          <Circle cx="282" cy="250" r="8" />
          <Circle cx="312" cy="256" r="8" />
          <Circle cx="230" cy="270" r="8" />
          <Circle cx="282" cy="270" r="8" />
          <Circle cx="256" cy="280" r="8" />
        </G>
      </G>
    </Svg>
  );
}

// Haiti
export function FlagHT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="htClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#htClip)">
        <Rect fill="#00209F" width="512" height="256" />
        <Rect fill="#D21034" y="256" width="512" height="256" />
        <Rect fill="#FFF" x="180" y="180" width="152" height="152" />
      </G>
    </Svg>
  );
}

// Cuba
export function FlagCU({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="cuClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#cuClip)">
        <Rect fill="#002A8F" width="512" height="102" />
        <Rect fill="#FFF" y="102" width="512" height="103" />
        <Rect fill="#002A8F" y="205" width="512" height="102" />
        <Rect fill="#FFF" y="307" width="512" height="103" />
        <Rect fill="#002A8F" y="410" width="512" height="102" />
        <Path fill="#CF142B" d="M0 0l256 256L0 512z" />
        <Path fill="#FFF" d="M100 256l20 62-52-38h64l-52 38z" />
      </G>
    </Svg>
  );
}
