import monaLisaImg from '../assets/images/mona_lisa_painting_1794118258327.jpg';
import pearlEarringImg from '../assets/images/pearl_earring_1794118271851.jpg';
import starryNightImg from '../assets/images/starry_night_1794118293783.jpg';
import theScreamImg from '../assets/images/the_scream_1794118310733.jpg';
import greatWaveImg from '../assets/images/great_wave_1794118325655.jpg';
import { PresetArtwork } from '../types';

export const PRESET_ARTWORKS: PresetArtwork[] = [
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503',
    period: 'High Renaissance',
    src: monaLisaImg,
    description: 'Masterclass in sfumato—smoke-soft transitions across facial planes with no harsh lines.',
    focusTip: 'Study contours and flat values to observe the soft graduation around the cheeks and eyes.'
  },
  {
    id: 'pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: '1665',
    period: 'Dutch Golden Age',
    src: pearlEarringImg,
    description: 'Chiaroscuro study of glancing light and single-point specular reflection on pearl and lips.',
    focusTip: 'Notice how only 4 to 6 flat tonal values define the entire facial volume against black.'
  },
  {
    id: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    period: 'Post-Impressionism',
    src: starryNightImg,
    description: 'Rhythmic, directional brushwork unifying the sky spirals with the vertical cypress tree.',
    focusTip: 'Use Blueprint phase to trace the rhythmic contours and sweeping concentric wave arcs.'
  },
  {
    id: 'the-scream',
    title: 'The Scream',
    artist: 'Edvard Munch',
    year: '1893',
    period: 'Expressionism',
    src: theScreamImg,
    description: 'Emotional distortion using steep diagonal linear perspective opposed against swirling sky waves.',
    focusTip: 'Observe the intense tonal clash between the warm orange sky bands and deep fjord blues.'
  },
  {
    id: 'great-wave',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    period: 'Edo Ukiyo-e',
    src: greatWaveImg,
    description: 'Fractal wave claws framing Mount Fuji in an iconic study of dynamic geometry.',
    focusTip: 'Perfect for the Blueprint and Contours phases to reveal the crisp linework of woodblock prints.'
  }
];
