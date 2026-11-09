import monaLisaImg from '../assets/images/mona_lisa_painting_1794118258327.jpg';
import pearlEarringImg from '../assets/images/pearl_earring_1794118271851.jpg';
import starryNightImg from '../assets/images/starry_night_1794118293783.jpg';
import theScreamImg from '../assets/images/the_scream_1794118310733.jpg';
import greatWaveImg from '../assets/images/great_wave_1794118325655.jpg';
import theKissImg from '../assets/images/the_kiss_1794141522679.jpg';
import cafeTerraceImg from '../assets/images/cafe_terrace_1794141585263.jpg';
import birthVenusImg from '../assets/images/birth_of_venus_1794141608566.jpg';
import nightWatchImg from '../assets/images/night_watch_1794141626872.jpg';
import sundayJatteImg from '../assets/images/sunday_jatte_1794141644102.jpg';
import waterLiliesImg from '../assets/images/water_lilies_1794141664154.jpg';
import libertyLeadingImg from '../assets/images/liberty_leading_1794141683559.jpg';
import theSwingImg from '../assets/images/the_swing_1794141702817.jpg';
import redFujiImg from '../assets/images/red_fuji_1794141724621.jpg';
import creationOfAdamImg from '../assets/images/creation_of_adam_1794211976753.jpg';
import { PresetArtwork } from '../types';

export const PRESET_ARTWORKS: PresetArtwork[] = [
  {
    id: 'mona-lisa',
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503',
    period: 'High Renaissance',
    category: 'Renaissance & Baroque',
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
    category: 'Renaissance & Baroque',
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
    category: 'Impressionism & Modern',
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
    category: 'Romanticism & Expressionism',
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
    category: 'Ukiyo-e Woodblock',
    src: greatWaveImg,
    description: 'Fractal wave claws framing Mount Fuji in an iconic study of dynamic geometry.',
    focusTip: 'Perfect for the Blueprint and Contours phases to reveal the crisp linework of woodblock prints.'
  },
  {
    id: 'the-kiss',
    title: 'The Kiss',
    artist: 'Gustav Klimt',
    year: '1907',
    period: 'Vienna Secession',
    category: 'Impressionism & Modern',
    src: theKissImg,
    description: 'Shimmering gold leaf ornamentation contrasting geometric rectangles against floral spirals.',
    focusTip: 'Isolate Flat Values to see how decorative flat planes unify two figures into one monumental mass.'
  },
  {
    id: 'cafe-terrace',
    title: 'Café Terrace at Night',
    artist: 'Vincent van Gogh',
    year: '1888',
    period: 'Post-Impressionism',
    category: 'Impressionism & Modern',
    src: cafeTerraceImg,
    description: 'Violent color juxtaposition of warm lantern amber against nocturnal cobalt skies.',
    focusTip: 'Observe in Contours mode how linear cobblestone perspective guides the eye toward the distant street.'
  },
  {
    id: 'birth-of-venus',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: 'c. 1485',
    period: 'Early Renaissance',
    category: 'Renaissance & Baroque',
    src: birthVenusImg,
    description: 'Graceful undulating contours and rhythmic drapery celebrating classical beauty.',
    focusTip: 'Use Blueprint mode to study the lyrical, calligraphic line weight running along the figures.'
  },
  {
    id: 'night-watch',
    title: 'The Night Watch',
    artist: 'Rembrandt van Rijn',
    year: '1642',
    period: 'Dutch Baroque',
    category: 'Renaissance & Baroque',
    src: nightWatchImg,
    description: 'Monumental dynamic militia portrait renowned for dramatic directional spotlighting.',
    focusTip: 'Use Flat Values with 4-6 clusters to see Rembrandt’s selective spotlight on the central officers.'
  },
  {
    id: 'sunday-jatte',
    title: 'A Sunday on La Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884',
    period: 'Pointillism',
    category: 'Impressionism & Modern',
    src: sundayJatteImg,
    description: 'Systematic optical color mixing and rigid, rhythmic geometric silhouettes on the park lawn.',
    focusTip: 'Examine Geometry and Contours to see the columnar, statue-like vertical rhythm of the strolling figures.'
  },
  {
    id: 'water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1906',
    period: 'Impressionism',
    category: 'Impressionism & Modern',
    src: waterLiliesImg,
    description: 'Dissolution of physical boundaries into pure atmospheric reflection and color vibration.',
    focusTip: 'Toggle Flat Values to study how Monet groups water reflections into interlocking value clusters.'
  },
  {
    id: 'liberty-leading',
    title: 'Liberty Leading the People',
    artist: 'Eugène Delacroix',
    year: '1830',
    period: 'Romanticism',
    category: 'Romanticism & Expressionism',
    src: libertyLeadingImg,
    description: 'Energetic pyramidal composition crowned by the tricolor banner amidst billowing battlefield smoke.',
    focusTip: 'Use Geometry phase to trace the rising triangular compositional scaffold anchoring the chaotic scene.'
  },
  {
    id: 'the-swing',
    title: 'The Swing',
    artist: 'Jean-Honoré Fragonard',
    year: '1767',
    period: 'Rococo',
    category: 'Renaissance & Baroque',
    src: theSwingImg,
    description: 'Playful triangular diagonal movement framed by lush, dappled forest canopy foliage.',
    focusTip: 'Inspect Contours to see the diagonal motion of the rope swing opposing the dense tree mass.'
  },
  {
    id: 'red-fuji',
    title: 'Fine Wind, Clear Morning (Red Fuji)',
    artist: 'Katsushika Hokusai',
    year: '1830',
    period: 'Edo Ukiyo-e',
    category: 'Ukiyo-e Woodblock',
    src: redFujiImg,
    description: 'Bold minimalist color blocking capturing Mount Fuji bathed in dawn light.',
    focusTip: 'A master study in minimalist Flat Values—see how just 3-4 primary color planes create immense scale.'
  },
  {
    id: 'creation-of-adam',
    title: 'The Creation of Adam',
    artist: 'Michelangelo Buonarroti',
    year: 'c. 1512',
    period: 'High Renaissance',
    category: 'Renaissance & Baroque',
    src: creationOfAdamImg,
    description: 'Monumental Sistine Chapel fresco illustrating the electric tension of the near-touching index fingers.',
    focusTip: 'Trace the anatomical contours and gesture lines running from Adam’s relaxed arm to God’s dynamic extension.'
  }
];
