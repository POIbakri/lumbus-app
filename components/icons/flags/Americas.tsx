import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, ClipPath, Polygon } from 'react-native-svg';

interface FlagProps {
  size?: number;
}

// United States
export function FlagUS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="usClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#usClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <G fill="#B22234">
          <Rect width="512" height="39" /><Rect y="78" width="512" height="39" />
          <Rect y="156" width="512" height="39" /><Rect y="234" width="512" height="39" />
          <Rect y="312" width="512" height="39" /><Rect y="390" width="512" height="39" />
          <Rect y="468" width="512" height="44" />
        </G>
        <Rect fill="#3C3B6E" width="205" height="273" />
        <G fill="#FFF">
          <Circle cx="20" cy="22" r="7" /><Circle cx="54" cy="22" r="7" /><Circle cx="88" cy="22" r="7" />
          <Circle cx="122" cy="22" r="7" /><Circle cx="156" cy="22" r="7" /><Circle cx="190" cy="22" r="7" />
          <Circle cx="37" cy="44" r="7" /><Circle cx="71" cy="44" r="7" /><Circle cx="105" cy="44" r="7" />
          <Circle cx="139" cy="44" r="7" /><Circle cx="173" cy="44" r="7" />
        </G>
      </G>
    </Svg>
  );
}

// Canada
export function FlagCA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="caClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#caClip)">
        <Rect fill="#FF0000" width="128" height="512" />
        <Rect fill="#FFF" x="128" width="256" height="512" />
        <Rect fill="#FF0000" x="384" width="128" height="512" />
        <Path fill="#FF0000" d="M256 100l-30 60-60-20 30 60-50 40h60l-6 60 56-40 56 40-6-60h60l-50-40 30-60-60 20-30-60z" />
      </G>
    </Svg>
  );
}

// Mexico
export function FlagMX({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="mxClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#mxClip)">
        <Rect fill="#006847" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#CE1126" x="341" width="171" height="512" />
        <Circle fill="#6D3D17" cx="256" cy="256" r="50" />
        <Circle fill="#006847" cx="256" cy="256" r="30" />
      </G>
    </Svg>
  );
}

// Brazil
export function FlagBR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#009B3A" width="512" height="512" rx="64" />
      <Path fill="#FEDF00" d="M256 80l180 176-180 176-180-176z" />
      <Circle fill="#002776" cx="256" cy="256" r="90" />
      <Path d="M170 256a86 86 0 0 1 172 0" stroke="#FFF" strokeWidth="12" fill="none" />
    </Svg>
  );
}

// Argentina
export function FlagAR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="arClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#arClip)">
        <Rect fill="#74ACDF" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#74ACDF" y="341" width="512" height="171" />
        <Circle fill="#F6B40E" cx="256" cy="256" r="45" />
        <Circle fill="#FFF" cx="256" cy="256" r="30" />
      </G>
    </Svg>
  );
}

// Chile
export function FlagCL({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="clClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#clClip)">
        <Rect fill="#FFF" width="512" height="256" />
        <Rect fill="#D52B1E" y="256" width="512" height="256" />
        <Rect fill="#0039A6" width="171" height="256" />
        <Path fill="#FFF" d="M85 128l12 36-30-22h36l-30 22z" />
      </G>
    </Svg>
  );
}

// Colombia
export function FlagCO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="coClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#coClip)">
        <Rect fill="#FCD116" width="512" height="256" />
        <Rect fill="#003893" y="256" width="512" height="128" />
        <Rect fill="#CE1126" y="384" width="512" height="128" />
      </G>
    </Svg>
  );
}

// Peru
export function FlagPE({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="peClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#peClip)">
        <Rect fill="#D91023" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#D91023" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}

// Ecuador
export function FlagEC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ecClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ecClip)">
        <Rect fill="#FFD100" width="512" height="256" />
        <Rect fill="#0072CE" y="256" width="512" height="128" />
        <Rect fill="#EF3340" y="384" width="512" height="128" />
        <Circle fill="#8B4513" cx="256" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// Uruguay
export function FlagUY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="uyClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#uyClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <G fill="#0038A8">
          <Rect y="57" width="512" height="57" /><Rect y="171" width="512" height="57" />
          <Rect y="285" width="512" height="57" /><Rect y="399" width="512" height="57" />
        </G>
        <Rect fill="#FFF" width="180" height="228" />
        <Circle fill="#FCD116" cx="90" cy="114" r="50" />
      </G>
    </Svg>
  );
}

// Paraguay
export function FlagPY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="pyClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#pyClip)">
        <Rect fill="#D52B1E" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0038A8" y="341" width="512" height="171" />
        <Circle fill="#FFF" cx="256" cy="256" r="50" stroke="#000" strokeWidth="3" />
      </G>
    </Svg>
  );
}

// Bolivia
export function FlagBO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="boClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#boClip)">
        <Rect fill="#D52B1E" width="512" height="171" />
        <Rect fill="#F9E300" y="171" width="512" height="170" />
        <Rect fill="#007934" y="341" width="512" height="171" />
      </G>
    </Svg>
  );
}

// Costa Rica
export function FlagCR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="crClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#crClip)">
        <Rect fill="#002B7F" width="512" height="102" />
        <Rect fill="#FFF" y="102" width="512" height="103" />
        <Rect fill="#CE1126" y="205" width="512" height="102" />
        <Rect fill="#FFF" y="307" width="512" height="103" />
        <Rect fill="#002B7F" y="410" width="512" height="102" />
      </G>
    </Svg>
  );
}

// Panama
export function FlagPA({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="paClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#paClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <Rect fill="#DA121A" x="256" width="256" height="256" />
        <Rect fill="#072357" y="256" width="256" height="256" />
        <Path fill="#072357" d="M128 128l15 46-39-28h48l-39 28z" />
        <Path fill="#DA121A" d="M384 384l15 46-39-28h48l-39 28z" />
      </G>
    </Svg>
  );
}

// Guatemala
export function FlagGT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gtClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gtClip)">
        <Rect fill="#4997D0" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#4997D0" x="341" width="171" height="512" />
        <Circle fill="#FFF" cx="256" cy="256" r="60" />
      </G>
    </Svg>
  );
}

// Honduras
export function FlagHN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="hnClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#hnClip)">
        <Rect fill="#0073CF" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0073CF" y="341" width="512" height="171" />
        <G fill="#0073CF">
          <Path d="M180 256l8 24-21-15h26l-21 15z" />
          <Path d="M256 200l8 24-21-15h26l-21 15z" />
          <Path d="M332 256l8 24-21-15h26l-21 15z" />
          <Path d="M210 300l8 24-21-15h26l-21 15z" />
          <Path d="M302 300l8 24-21-15h26l-21 15z" />
        </G>
      </G>
    </Svg>
  );
}

// Nicaragua
export function FlagNI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="niClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#niClip)">
        <Rect fill="#0067C6" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0067C6" y="341" width="512" height="171" />
        <Circle fill="#FFF" cx="256" cy="256" r="50" stroke="#0067C6" strokeWidth="5" />
      </G>
    </Svg>
  );
}

// El Salvador
export function FlagSV({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="svClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#svClip)">
        <Rect fill="#0F47AF" width="512" height="171" />
        <Rect fill="#FFF" y="171" width="512" height="170" />
        <Rect fill="#0F47AF" y="341" width="512" height="171" />
        <Circle fill="#FFF" cx="256" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// Belize
export function FlagBZ({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bzClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bzClip)">
        <Rect fill="#CE1126" width="512" height="50" />
        <Rect fill="#003F87" y="50" width="512" height="412" />
        <Rect fill="#CE1126" y="462" width="512" height="50" />
        <Circle fill="#FFF" cx="256" cy="256" r="80" />
      </G>
    </Svg>
  );
}

// Dominican Republic
export function FlagDO({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="doClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#doClip)">
        <Rect fill="#002D62" width="256" height="256" />
        <Rect fill="#CE1126" x="256" width="256" height="256" />
        <Rect fill="#CE1126" y="256" width="256" height="256" />
        <Rect fill="#002D62" x="256" y="256" width="256" height="256" />
        <Rect fill="#FFF" x="206" width="100" height="512" />
        <Rect fill="#FFF" y="206" width="512" height="100" />
      </G>
    </Svg>
  );
}

// Jamaica
export function FlagJM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="jmClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#jmClip)">
        <Rect fill="#009B3A" width="512" height="512" />
        <Path fill="#000" d="M0 0l256 256L0 512zM512 0L256 256l256 256z" />
        <Path d="M0 0l512 512M512 0L0 512" stroke="#FED100" strokeWidth="60" />
      </G>
    </Svg>
  );
}

// Trinidad and Tobago
export function FlagTT({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="ttClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#ttClip)">
        <Rect fill="#CE1126" width="512" height="512" />
        <Path fill="#000" d="M0 0l512 512" stroke="#FFF" strokeWidth="120" />
        <Path fill="#000" d="M0 0l512 512" stroke="#000" strokeWidth="80" />
      </G>
    </Svg>
  );
}

// Bahamas
export function FlagBS({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bsClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bsClip)">
        <Rect fill="#00778B" width="512" height="171" />
        <Rect fill="#FFC72C" y="171" width="512" height="170" />
        <Rect fill="#00778B" y="341" width="512" height="171" />
        <Path fill="#000" d="M0 0l200 256L0 512z" />
      </G>
    </Svg>
  );
}

// Barbados
export function FlagBB({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bbClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bbClip)">
        <Rect fill="#00267F" width="171" height="512" />
        <Rect fill="#FFC726" x="171" width="170" height="512" />
        <Rect fill="#00267F" x="341" width="171" height="512" />
        <Path fill="#000" d="M256 150l-30 80h-50l40 50-20 70 60-40 60 40-20-70 40-50h-50z" />
      </G>
    </Svg>
  );
}

// Grenada
export function FlagGD({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gdClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gdClip)">
        <Rect fill="#CE1126" width="512" height="512" />
        <Rect fill="#007A5E" x="40" y="40" width="432" height="432" />
        <Rect fill="#FCD116" x="80" y="80" width="352" height="352" />
        <G fill="#CE1126">
          <Path d="M0 0l256 256L0 512z" />
          <Path d="M512 0L256 256l256 256z" />
        </G>
        <Circle fill="#FCD116" cx="256" cy="256" r="50" />
      </G>
    </Svg>
  );
}

// Saint Lucia
export function FlagLC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Rect fill="#65CFFF" width="512" height="512" rx="64" />
      <Path fill="#FCD116" d="M256 120l120 280H136z" />
      <Path fill="#000" d="M256 170l80 200H176z" />
      <Path fill="#FFF" d="M256 220l50 130H206z" />
    </Svg>
  );
}

// Saint Vincent and the Grenadines
export function FlagVC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="vcClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#vcClip)">
        <Rect fill="#0072C6" width="154" height="512" />
        <Rect fill="#FCD116" x="154" width="204" height="512" />
        <Rect fill="#009E49" x="358" width="154" height="512" />
        <G fill="#009E49">
          <Path d="M200 200l56 100-56 100z" />
          <Path d="M256 200l56 100-56 100z" />
          <Path d="M312 200l-56 100 56 100z" />
        </G>
      </G>
    </Svg>
  );
}

// Saint Kitts and Nevis
export function FlagKN({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="knClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#knClip)">
        <Rect fill="#009E49" width="512" height="256" />
        <Rect fill="#CE1126" y="256" width="512" height="256" />
        <Path fill="#000" d="M0 0l512 512" stroke="#FCD116" strokeWidth="120" />
        <Path fill="#000" d="M0 0l512 512" stroke="#000" strokeWidth="80" />
        <G fill="#FFF">
          <Path d="M140 290l20 60-52-38h64l-52 38z" />
          <Path d="M320 180l20 60-52-38h64l-52 38z" />
        </G>
      </G>
    </Svg>
  );
}

// Antigua and Barbuda
export function FlagAG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="agClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#agClip)">
        <Rect fill="#000" width="512" height="512" />
        <Path fill="#CE1126" d="M0 0l256 200L512 0z" />
        <Path fill="#CE1126" d="M0 512l256-200 256 200z" />
        <Path fill="#FCD116" d="M140 200h232l-116 100z" />
        <Rect fill="#0072C6" y="200" width="512" height="112" />
        <Rect fill="#FFF" y="256" width="512" height="56" />
      </G>
    </Svg>
  );
}

// Dominica
export function FlagDM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="dmClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#dmClip)">
        <Rect fill="#006B3F" width="512" height="512" />
        <Rect fill="#FCD116" x="206" width="100" height="512" />
        <Rect fill="#FCD116" y="206" width="512" height="100" />
        <Rect fill="#000" x="220" width="72" height="512" />
        <Rect fill="#000" y="220" width="512" height="72" />
        <Rect fill="#FFF" x="234" width="44" height="512" />
        <Rect fill="#FFF" y="234" width="512" height="44" />
        <Circle fill="#D41C30" cx="256" cy="256" r="70" />
      </G>
    </Svg>
  );
}

// Anguilla
export function FlagAI({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="aiClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#aiClip)">
        <Rect fill="#012169" width="512" height="512" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
        <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#C8102E" strokeWidth="25" />
        <Path d="M128 0v192M0 96h256" stroke="#C8102E" strokeWidth="30" />
        <Circle fill="#FFF" cx="400" cy="350" r="60" />
      </G>
    </Svg>
  );
}

// Bermuda
export function FlagBM({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="bmClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#bmClip)">
        <Rect fill="#CF142B" width="512" height="512" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
        <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#CF142B" strokeWidth="25" />
        <Path d="M128 0v192M0 96h256" stroke="#CF142B" strokeWidth="30" />
        <Rect fill="#FFF" x="300" y="150" width="160" height="212" />
      </G>
    </Svg>
  );
}

// Cayman Islands
export function FlagKY({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="kyClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#kyClip)">
        <Rect fill="#012169" width="512" height="512" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
        <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#C8102E" strokeWidth="25" />
        <Path d="M128 0v192M0 96h256" stroke="#C8102E" strokeWidth="30" />
        <Circle fill="#FFF" cx="400" cy="350" r="80" />
      </G>
    </Svg>
  );
}

// Turks and Caicos
export function FlagTC({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="tcClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#tcClip)">
        <Rect fill="#012169" width="512" height="512" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
        <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#C8102E" strokeWidth="25" />
        <Path d="M128 0v192M0 96h256" stroke="#C8102E" strokeWidth="30" />
        <Rect fill="#FCD116" x="340" y="200" width="120" height="160" />
      </G>
    </Svg>
  );
}

// British Virgin Islands
export function FlagVG({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="vgClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#vgClip)">
        <Rect fill="#012169" width="512" height="512" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#FFF" strokeWidth="40" />
        <Path d="M128 0v192M0 96h256" stroke="#FFF" strokeWidth="50" />
        <Path d="M0 0l256 192M256 0L0 192" stroke="#C8102E" strokeWidth="25" />
        <Path d="M128 0v192M0 96h256" stroke="#C8102E" strokeWidth="30" />
        <Rect fill="#006B3F" x="320" y="180" width="150" height="180" />
      </G>
    </Svg>
  );
}

// Puerto Rico
export function FlagPR({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="prClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#prClip)">
        <Rect fill="#FFF" width="512" height="512" />
        <G fill="#EF3340">
          <Rect width="512" height="102" /><Rect y="205" width="512" height="102" />
          <Rect y="410" width="512" height="102" />
        </G>
        <Path fill="#0050F0" d="M0 0l220 256L0 512z" />
        <Path fill="#FFF" d="M80 256l25 77-65-47h80l-65 47z" />
      </G>
    </Svg>
  );
}

// Guadeloupe
export function FlagGP({ size = 24 }: FlagProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs><ClipPath id="gpClip"><Rect width="512" height="512" rx="64" /></ClipPath></Defs>
      <G clipPath="url(#gpClip)">
        <Rect fill="#002395" width="171" height="512" />
        <Rect fill="#FFF" x="171" width="170" height="512" />
        <Rect fill="#ED2939" x="341" width="171" height="512" />
      </G>
    </Svg>
  );
}
