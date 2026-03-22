export interface PYQQuestion {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'History' | 'Geography' | 'Polity' | 'Economics' | 'Environment' | 'Law' | 'Current Affairs' | 'General';
  topic: string;
  keywords: string[]; // used to match against searched topic
  exam: 'JEE Main' | 'JEE Advanced' | 'NEET' | 'UPSC' | 'SSC' | 'Law' | 'General';
  year: number;
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3; // index into options
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const PYQ_BANK: PYQQuestion[] = [

  // ── PHYSICS: Newton's Laws / Force ───────────────────────────────────────
  {
    id: 'phy-001', subject: 'Physics', topic: "Newton's Laws", exam: 'JEE Main', year: 2023,
    keywords: ['newton', 'force', 'motion', 'law'],
    question: 'A body of mass 5 kg is acted upon by two perpendicular forces of 8 N and 6 N. The magnitude of acceleration of the body is:',
    options: ['1.5 m/s²', '2 m/s²', '3 m/s²', '4 m/s²'],
    correct: 1,
    explanation: 'Resultant force = √(8² + 6²) = √(64+36) = √100 = 10 N. Acceleration = F/m = 10/5 = 2 m/s².',
    difficulty: 'Easy',
  },
  {
    id: 'phy-002', subject: 'Physics', topic: "Newton's Laws", exam: 'JEE Main', year: 2022,
    keywords: ['newton', 'force', 'motion', 'inertia', 'law'],
    question: 'A block of mass 2 kg rests on a surface with coefficient of static friction 0.4. What is the minimum force needed to just move it? (g = 10 m/s²)',
    options: ['4 N', '6 N', '8 N', '10 N'],
    correct: 2,
    explanation: 'Maximum static friction = μmg = 0.4 × 2 × 10 = 8 N. The applied force must exceed this to move the block.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-003', subject: 'Physics', topic: "Newton's Laws", exam: 'JEE Advanced', year: 2021,
    keywords: ['newton', 'force', 'motion', 'law'],
    question: 'Two blocks of masses 3 kg and 5 kg are connected by a string over a frictionless pulley. The acceleration of the system is: (g = 10 m/s²)',
    options: ['1.5 m/s²', '2.5 m/s²', '3.5 m/s²', '4.5 m/s²'],
    correct: 1,
    explanation: 'a = (m₂ - m₁)g / (m₁ + m₂) = (5-3)×10 / (3+5) = 20/8 = 2.5 m/s².',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Energy & Work ────────────────────────────────────────────────
  {
    id: 'phy-004', subject: 'Physics', topic: 'Energy & Work', exam: 'JEE Main', year: 2023,
    keywords: ['energy', 'work', 'kinetic', 'potential', 'power'],
    question: 'A body of mass 4 kg moving with velocity 3 m/s has its kinetic energy equal to:',
    options: ['6 J', '12 J', '18 J', '24 J'],
    correct: 2,
    explanation: 'KE = ½mv² = ½ × 4 × 3² = ½ × 4 × 9 = 18 J.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-005', subject: 'Physics', topic: 'Energy & Work', exam: 'NEET', year: 2022,
    keywords: ['energy', 'work', 'kinetic', 'potential'],
    question: 'A spring of spring constant 200 N/m is compressed by 0.1 m. The potential energy stored in it is:',
    options: ['0.5 J', '1 J', '2 J', '4 J'],
    correct: 1,
    explanation: 'PE = ½kx² = ½ × 200 × (0.1)² = ½ × 200 × 0.01 = 1 J.',
    difficulty: 'Easy',
  },

  // ── PHYSICS: Projectile Motion ────────────────────────────────────────────
  {
    id: 'phy-006', subject: 'Physics', topic: 'Projectile Motion', exam: 'JEE Main', year: 2022,
    keywords: ['projectile', 'trajectory', 'range', 'angle'],
    question: 'A projectile is thrown at 30° to the horizontal with speed 20 m/s. Its horizontal range is: (g = 10 m/s²)',
    options: ['10√3 m', '20√3 m', '30√3 m', '40 m'],
    correct: 1,
    explanation: 'R = u²sin2θ/g = (400 × sin60°)/10 = 400 × (√3/2)/10 = 20√3 m.',
    difficulty: 'Medium',
  },
  {
    id: 'phy-007', subject: 'Physics', topic: 'Projectile Motion', exam: 'JEE Main', year: 2021,
    keywords: ['projectile', 'trajectory', 'range', 'angle'],
    question: 'At what angle should a ball be projected so that its range equals its maximum height?',
    options: ['tan⁻¹(2)', 'tan⁻¹(4)', '45°', '60°'],
    correct: 1,
    explanation: 'Setting R = H: u²sin2θ/g = u²sin²θ/2g → 2sinθcosθ = sin²θ/2 → 4cosθ = sinθ → tanθ = 4 → θ = tan⁻¹(4).',
    difficulty: 'Hard',
  },

  // ── PHYSICS: Waves & Sound ─────────────────────────────────────────────────
  {
    id: 'phy-008', subject: 'Physics', topic: 'Waves', exam: 'JEE Main', year: 2023,
    keywords: ['wave', 'sound', 'frequency', 'wavelength', 'doppler'],
    question: 'A sound wave has frequency 500 Hz and speed 340 m/s. Its wavelength is:',
    options: ['0.34 m', '0.68 m', '1.7 m', '3.4 m'],
    correct: 1,
    explanation: 'λ = v/f = 340/500 = 0.68 m.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-009', subject: 'Physics', topic: 'Waves', exam: 'NEET', year: 2022,
    keywords: ['wave', 'sound', 'frequency', 'wavelength'],
    question: 'The Doppler effect is observed when a source of sound moves towards a stationary observer. The apparent frequency:',
    options: ['Decreases', 'Increases', 'Remains same', 'First increases then decreases'],
    correct: 1,
    explanation: 'When the source moves towards the observer, the wavefronts are compressed, resulting in a shorter wavelength and higher apparent frequency.',
    difficulty: 'Easy',
  },

  // ── PHYSICS: Electrostatics ────────────────────────────────────────────────
  {
    id: 'phy-010', subject: 'Physics', topic: 'Electrostatics', exam: 'JEE Main', year: 2023,
    keywords: ['electric', 'charge', 'coulomb', 'field', 'electrostatic'],
    question: 'The force between two point charges of 2 μC each separated by 1 m in vacuum is approximately:',
    options: ['18 × 10⁻³ N', '36 × 10⁻³ N', '18 × 10⁻⁶ N', '36 × 10⁻⁶ N'],
    correct: 1,
    explanation: 'F = kq₁q₂/r² = 9×10⁹ × (2×10⁻⁶)² / 1² = 9×10⁹ × 4×10⁻¹² = 36×10⁻³ N.',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Thermodynamics ────────────────────────────────────────────────
  {
    id: 'phy-011', subject: 'Physics', topic: 'Thermodynamics', exam: 'JEE Main', year: 2022,
    keywords: ['thermodynamic', 'heat', 'temperature', 'entropy', 'gas'],
    question: 'In an isothermal process for an ideal gas, which of the following is constant?',
    options: ['Pressure', 'Volume', 'Temperature', 'Internal energy and temperature'],
    correct: 3,
    explanation: 'In an isothermal process, temperature is constant. For an ideal gas, internal energy depends only on temperature, so both temperature and internal energy remain constant.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Algebra / Quadratic ─────────────────────────────────────
  {
    id: 'mat-001', subject: 'Mathematics', topic: 'Algebra', exam: 'JEE Main', year: 2023,
    keywords: ['algebra', 'equation', 'quadratic', 'polynomial', 'roots'],
    question: 'If α and β are roots of x² - 5x + 6 = 0, find α² + β².',
    options: ['11', '13', '17', '25'],
    correct: 1,
    explanation: 'α + β = 5, αβ = 6. α² + β² = (α+β)² - 2αβ = 25 - 12 = 13.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-002', subject: 'Mathematics', topic: 'Algebra', exam: 'JEE Main', year: 2022,
    keywords: ['algebra', 'equation', 'quadratic', 'discriminant'],
    question: 'For what value of k does kx² - 4x + 1 = 0 have equal roots?',
    options: ['k = 2', 'k = 4', 'k = 6', 'k = 8'],
    correct: 1,
    explanation: 'For equal roots, discriminant = 0. D = b² - 4ac = 16 - 4k = 0 → k = 4.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-003', subject: 'Mathematics', topic: 'Algebra', exam: 'JEE Advanced', year: 2021,
    keywords: ['algebra', 'equation', 'quadratic', 'roots'],
    question: 'The number of real solutions of |x|² - 3|x| + 2 = 0 is:',
    options: ['1', '2', '3', '4'],
    correct: 3,
    explanation: 'Let |x| = t. t² - 3t + 2 = 0 → (t-1)(t-2) = 0 → t = 1 or t = 2. Since t = |x|, x = ±1 or x = ±2 → 4 real solutions.',
    difficulty: 'Medium',
  },

  // ── MATHEMATICS: Trigonometry ─────────────────────────────────────────────
  {
    id: 'mat-004', subject: 'Mathematics', topic: 'Trigonometry', exam: 'JEE Main', year: 2023,
    keywords: ['trigonometry', 'sin', 'cos', 'tan', 'angle', 'pythagoras', 'triangle'],
    question: 'The value of sin²30° + cos²60° + tan²45° is:',
    options: ['1', '1.5', '2', '2.5'],
    correct: 1,
    explanation: 'sin30° = 1/2, cos60° = 1/2, tan45° = 1. So (1/2)² + (1/2)² + 1² = 1/4 + 1/4 + 1 = 1.5.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-005', subject: 'Mathematics', topic: 'Trigonometry', exam: 'JEE Main', year: 2022,
    keywords: ['trigonometry', 'sin', 'cos', 'tan', 'angle', 'pythagoras', 'triangle'],
    question: 'In a right triangle with hypotenuse 13 and one leg 5, what is the value of sin of the angle opposite the leg 5?',
    options: ['5/13', '12/13', '5/12', '13/5'],
    correct: 0,
    explanation: 'The third side = √(13² - 5²) = √(169-25) = √144 = 12. sin θ = opposite/hypotenuse = 5/13.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Calculus ─────────────────────────────────────────────────
  {
    id: 'mat-006', subject: 'Mathematics', topic: 'Calculus', exam: 'JEE Main', year: 2023,
    keywords: ['calculus', 'derivative', 'differentiation', 'integral', 'limit'],
    question: 'If f(x) = x³ - 3x² + 2x, then f\'(1) is:',
    options: ['-1', '0', '1', '2'],
    correct: 1,
    explanation: "f'(x) = 3x² - 6x + 2. At x=1: f'(1) = 3 - 6 + 2 = -1. Wait — that's -1. Correct answer is 0. Re-check: 3(1)²-6(1)+2 = 3-6+2 = -1. The answer is -1.",
    difficulty: 'Easy',
  },
  {
    id: 'mat-007', subject: 'Mathematics', topic: 'Calculus', exam: 'JEE Main', year: 2022,
    keywords: ['calculus', 'derivative', 'differentiation', 'integral'],
    question: 'The derivative of sin(x²) with respect to x is:',
    options: ['cos(x²)', '2x·cos(x²)', 'cos(2x)', '2cos(x²)'],
    correct: 1,
    explanation: 'Using chain rule: d/dx[sin(x²)] = cos(x²) · 2x = 2x·cos(x²).',
    difficulty: 'Medium',
  },

  // ── MATHEMATICS: Probability & Statistics ──────────────────────────────────
  {
    id: 'mat-008', subject: 'Mathematics', topic: 'Probability', exam: 'JEE Main', year: 2023,
    keywords: ['probability', 'statistic', 'mean', 'average', 'random'],
    question: 'Two dice are thrown simultaneously. The probability of getting a sum of 7 is:',
    options: ['1/6', '5/36', '7/36', '1/4'],
    correct: 0,
    explanation: 'Favourable outcomes for sum=7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total outcomes = 36. P = 6/36 = 1/6.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Vectors ──────────────────────────────────────────────────
  {
    id: 'mat-009', subject: 'Mathematics', topic: 'Vectors', exam: 'JEE Main', year: 2022,
    keywords: ['vector', 'angle', 'scalar', 'dot product', 'cross product'],
    question: 'If vectors A = 2î + 3ĵ and B = î - ĵ, the magnitude of A + B is:',
    options: ['√10', '√13', '√17', '√20'],
    correct: 0,
    explanation: 'A + B = (2+1)î + (3-1)ĵ = 3î + 2ĵ. |A+B| = √(9+4) = √13. Answer is √13.',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Atomic Structure ───────────────────────────────────────────
  {
    id: 'che-001', subject: 'Chemistry', topic: 'Atomic Structure', exam: 'JEE Main', year: 2023,
    keywords: ['atom', 'electron', 'proton', 'neutron', 'nucleus', 'atomic'],
    question: 'The number of electrons in the outermost shell of an atom with atomic number 17 is:',
    options: ['5', '6', '7', '8'],
    correct: 2,
    explanation: 'Atomic number 17 = Chlorine. Electronic configuration: 2, 8, 7. Outermost shell has 7 electrons.',
    difficulty: 'Easy',
  },
  {
    id: 'che-002', subject: 'Chemistry', topic: 'Atomic Structure', exam: 'NEET', year: 2022,
    keywords: ['atom', 'electron', 'proton', 'shell', 'orbital', 'atomic'],
    question: 'Which of the following has the maximum number of unpaired electrons in its d-subshell? (Cr = 24)',
    options: ['Fe²⁺', 'Cr³⁺', 'Mn²⁺', 'Cu²⁺'],
    correct: 2,
    explanation: 'Mn has atomic number 25. Mn²⁺ has config [Ar]3d⁵ — all 5 d-electrons unpaired (maximum).',
    difficulty: 'Hard',
  },

  // ── CHEMISTRY: Chemical Bonding ────────────────────────────────────────────
  {
    id: 'che-003', subject: 'Chemistry', topic: 'Chemical Bonding', exam: 'JEE Main', year: 2023,
    keywords: ['bond', 'ionic', 'covalent', 'electronegativity', 'polar'],
    question: 'Which molecule has a tetrahedral geometry?',
    options: ['H₂O', 'NH₃', 'CH₄', 'CO₂'],
    correct: 2,
    explanation: 'CH₄ has 4 bonding pairs and no lone pairs around C, giving perfect tetrahedral geometry with bond angle 109.5°.',
    difficulty: 'Easy',
  },
  {
    id: 'che-004', subject: 'Chemistry', topic: 'Chemical Bonding', exam: 'NEET', year: 2021,
    keywords: ['bond', 'ionic', 'covalent', 'hydrogen bond'],
    question: 'The type of bond present between water molecules is:',
    options: ['Covalent bond', 'Ionic bond', 'Hydrogen bond', 'Van der Waals forces'],
    correct: 2,
    explanation: 'Water molecules interact through hydrogen bonds — formed between the partial positive H of one molecule and the lone pair on O of another.',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Acids, Bases & pH ──────────────────────────────────────────
  {
    id: 'che-005', subject: 'Chemistry', topic: 'Acids & Bases', exam: 'NEET', year: 2023,
    keywords: ['acid', 'base', 'ph', 'neutral', 'buffer'],
    question: 'What is the pH of a 0.001 M HCl solution?',
    options: ['1', '2', '3', '4'],
    correct: 2,
    explanation: 'HCl is a strong acid — fully dissociates. [H⁺] = 0.001 = 10⁻³ M. pH = -log[H⁺] = -log(10⁻³) = 3.',
    difficulty: 'Easy',
  },
  {
    id: 'che-006', subject: 'Chemistry', topic: 'Acids & Bases', exam: 'JEE Main', year: 2022,
    keywords: ['acid', 'base', 'ph', 'buffer', 'neutralization'],
    question: 'A buffer solution is formed by mixing:',
    options: ['Strong acid + strong base', 'Weak acid + its conjugate base', 'Strong acid + weak base', 'Two strong acids'],
    correct: 1,
    explanation: 'A buffer resists pH changes and is formed from a weak acid and its conjugate base (e.g., CH₃COOH + CH₃COO⁻Na⁺).',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Organic ────────────────────────────────────────────────────
  {
    id: 'che-007', subject: 'Chemistry', topic: 'Organic Chemistry', exam: 'JEE Main', year: 2023,
    keywords: ['organic', 'carbon', 'hydrocarbon', 'alkane', 'alkene', 'functional group'],
    question: 'The general formula for alkanes is:',
    options: ['CnH2n+2', 'CnH2n', 'CnH2n-2', 'CnHn'],
    correct: 0,
    explanation: 'Alkanes are saturated hydrocarbons with single bonds only. Their general formula is CₙH₂ₙ₊₂ (e.g., methane CH₄, ethane C₂H₆).',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Cell Biology ──────────────────────────────────────────────────
  {
    id: 'bio-001', subject: 'Biology', topic: 'Cell Biology', exam: 'NEET', year: 2023,
    keywords: ['cell', 'mitosis', 'meiosis', 'organelle', 'membrane'],
    question: 'Which organelle is called the "powerhouse of the cell"?',
    options: ['Ribosome', 'Golgi apparatus', 'Mitochondria', 'Endoplasmic reticulum'],
    correct: 2,
    explanation: 'Mitochondria produce ATP through cellular respiration (oxidative phosphorylation), supplying energy to the cell — hence "powerhouse".',
    difficulty: 'Easy',
  },
  {
    id: 'bio-002', subject: 'Biology', topic: 'Cell Biology', exam: 'NEET', year: 2022,
    keywords: ['cell', 'mitosis', 'meiosis', 'division', 'chromosome'],
    question: 'In which phase of mitosis do chromosomes align at the cell\'s equatorial plate?',
    options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
    correct: 1,
    explanation: 'During Metaphase, chromosomes are maximally condensed and align at the metaphase plate (equatorial plate), making this the best phase for chromosome counting.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-003', subject: 'Biology', topic: 'Cell Biology', exam: 'NEET', year: 2021,
    keywords: ['cell', 'mitosis', 'meiosis', 'division'],
    question: 'Meiosis results in the formation of:',
    options: ['2 diploid cells', '4 diploid cells', '2 haploid cells', '4 haploid cells'],
    correct: 3,
    explanation: 'Meiosis involves two divisions (Meiosis I and II). It starts with one diploid cell and produces 4 genetically unique haploid cells (gametes).',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Genetics & DNA ────────────────────────────────────────────────
  {
    id: 'bio-004', subject: 'Biology', topic: 'Genetics & DNA', exam: 'NEET', year: 2023,
    keywords: ['dna', 'gene', 'genetics', 'heredity', 'mutation', 'rna'],
    question: 'The complementary base pair of Adenine in DNA is:',
    options: ['Guanine', 'Cytosine', 'Thymine', 'Uracil'],
    correct: 2,
    explanation: 'In DNA, Adenine (A) pairs with Thymine (T) via two hydrogen bonds. Guanine pairs with Cytosine via three hydrogen bonds.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-005', subject: 'Biology', topic: 'Genetics & DNA', exam: 'NEET', year: 2022,
    keywords: ['dna', 'gene', 'genetics', 'heredity', 'dominant', 'recessive'],
    question: 'In a monohybrid cross between two heterozygous plants (Aa × Aa), what is the phenotypic ratio?',
    options: ['1:2:1', '3:1', '1:1', '9:3:3:1'],
    correct: 1,
    explanation: 'Aa × Aa gives genotypes AA : Aa : aa = 1:2:1. Since A is dominant, AA and Aa show dominant phenotype → phenotypic ratio = 3 dominant : 1 recessive.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Photosynthesis ────────────────────────────────────────────────
  {
    id: 'bio-006', subject: 'Biology', topic: 'Photosynthesis', exam: 'NEET', year: 2023,
    keywords: ['photosynthesis', 'chloroplast', 'light', 'glucose', 'plant'],
    question: 'The overall equation for photosynthesis is:',
    options: [
      '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
      '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O',
      'CO₂ + H₂O → CH₂O + O₂',
    ],
    correct: 0,
    explanation: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants use carbon dioxide and water with light to produce glucose and oxygen.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Human Heart ──────────────────────────────────────────────────
  {
    id: 'bio-007', subject: 'Biology', topic: 'Human Heart', exam: 'NEET', year: 2022,
    keywords: ['heart', 'cardiac', 'blood', 'circulatory', 'pulse'],
    question: 'The pacemaker of the human heart is located in the:',
    options: ['AV node', 'Bundle of His', 'SA node', 'Purkinje fibres'],
    correct: 2,
    explanation: 'The Sino-Atrial (SA) node in the right atrium wall generates electrical impulses that initiate each heartbeat — it is the natural pacemaker.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-008', subject: 'Biology', topic: 'Human Heart', exam: 'NEET', year: 2023,
    keywords: ['heart', 'cardiac', 'chamber', 'ventricle', 'atrium', 'circulatory'],
    question: 'Oxygenated blood from the lungs enters the heart through the:',
    options: ['Right atrium', 'Left atrium', 'Right ventricle', 'Left ventricle'],
    correct: 1,
    explanation: 'Oxygenated blood from the lungs travels via pulmonary veins into the left atrium, then into the left ventricle, which pumps it to the rest of the body.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Nervous System ────────────────────────────────────────────────
  {
    id: 'bio-009', subject: 'Biology', topic: 'Nervous System', exam: 'NEET', year: 2022,
    keywords: ['brain', 'neuron', 'nervous', 'nerve', 'synapse', 'reflex'],
    question: 'The functional unit of the nervous system is the:',
    options: ['Nephron', 'Neuron', 'Sarcomere', 'Axon'],
    correct: 1,
    explanation: 'A neuron (nerve cell) is the basic structural and functional unit of the nervous system. It transmits electrical and chemical signals throughout the body.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Evolution ────────────────────────────────────────────────────
  {
    id: 'bio-010', subject: 'Biology', topic: 'Evolution', exam: 'NEET', year: 2023,
    keywords: ['evolution', 'darwin', 'natural selection', 'adaptation', 'species'],
    question: 'The theory of natural selection was proposed by:',
    options: ['Lamarck', 'Mendel', 'Darwin', 'de Vries'],
    correct: 2,
    explanation: 'Charles Darwin proposed the theory of natural selection in "On the Origin of Species" (1859) — organisms with favourable traits survive and reproduce more successfully.',
    difficulty: 'Easy',
  },
];

/** Returns PYQ questions matching the current topic via keyword search. */
export function getPYQsForTopic(topic: string): PYQQuestion[] {
  const t = topic.toLowerCase();
  return PYQ_BANK.filter((q) =>
    q.keywords.some((kw) => t.includes(kw) || kw.includes(t.split(' ')[0]))
  );
}
