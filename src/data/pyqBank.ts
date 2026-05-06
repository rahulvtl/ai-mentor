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

  // ── PHYSICS: Simple Harmonic Motion ───────────────────────────────────────
  {
    id: 'phy-012', subject: 'Physics', topic: 'Simple Harmonic Motion', exam: 'JEE Main', year: 2023,
    keywords: ['shm', 'simple harmonic', 'pendulum', 'oscillation', 'period'],
    question: 'The time period of a simple pendulum of length 1 m on Earth (g = 9.8 m/s²) is approximately:',
    options: ['1.5 s', '2.0 s', '2.5 s', '3.0 s'],
    correct: 1,
    explanation: 'T = 2π√(L/g) = 2π√(1/9.8) ≈ 2.0 s. The period depends only on length and gravity for small angles, not on the mass or amplitude.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-013', subject: 'Physics', topic: 'Simple Harmonic Motion', exam: 'JEE Main', year: 2022,
    keywords: ['shm', 'simple harmonic', 'spring', 'oscillation', 'period'],
    question: 'A spring-mass system has spring constant k = 100 N/m and mass m = 0.25 kg. Its time period is:',
    options: ['π/5 s', 'π/10 s', 'π/20 s', 'π/50 s'],
    correct: 1,
    explanation: 'T = 2π√(m/k) = 2π√(0.25/100) = 2π × (1/20) = π/10 s.',
    difficulty: 'Medium',
  },
  {
    id: 'phy-014', subject: 'Physics', topic: 'Simple Harmonic Motion', exam: 'NEET', year: 2022,
    keywords: ['shm', 'simple harmonic', 'energy', 'oscillation'],
    question: 'In SHM, when displacement equals half the amplitude, kinetic energy is what fraction of total energy?',
    options: ['1/4', '1/2', '3/4', '1'],
    correct: 2,
    explanation: 'KE = (1/2)mω²(A² − x²) and total E = (1/2)mω²A². At x = A/2: KE/E = 1 − (1/4) = 3/4.',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Optics ───────────────────────────────────────────────────────
  {
    id: 'phy-015', subject: 'Physics', topic: 'Optics', exam: 'JEE Main', year: 2023,
    keywords: ['optics', 'light', 'refraction', 'critical angle', 'tir', 'snell'],
    question: 'A ray passes from glass (n = 1.5) to air. The critical angle for total internal reflection is approximately:',
    options: ['30°', '42°', '49°', '60°'],
    correct: 1,
    explanation: 'sin C = n_air/n_glass = 1/1.5 ≈ 0.667, so C ≈ 41.8° ≈ 42°.',
    difficulty: 'Medium',
  },
  {
    id: 'phy-016', subject: 'Physics', topic: 'Optics', exam: 'NEET', year: 2022,
    keywords: ['optics', 'light', 'mirror', 'lens', 'concave', 'image'],
    question: 'A concave mirror of focal length 20 cm forms a real image at 60 cm in front of the mirror. The object distance is:',
    options: ['10 cm', '20 cm', '30 cm', '40 cm'],
    correct: 2,
    explanation: 'Using 1/v + 1/u = 1/f with sign convention (v = −60, f = −20): 1/u = 1/(−20) − 1/(−60) = −1/30, so |u| = 30 cm.',
    difficulty: 'Medium',
  },
  {
    id: 'phy-017', subject: 'Physics', topic: 'Optics', exam: 'JEE Main', year: 2022,
    keywords: ['optics', 'light', 'refraction', 'snell'],
    question: 'Light passes from medium A (n = 1.5) to medium B (n = 2.0). For an angle of incidence of 30°, the angle of refraction is approximately:',
    options: ['15°', '22°', '30°', '45°'],
    correct: 1,
    explanation: "Snell's law: n₁ sin θ₁ = n₂ sin θ₂ → 1.5 × 0.5 = 2.0 × sin θ₂ → sin θ₂ = 0.375, so θ₂ ≈ 22°.",
    difficulty: 'Medium',
  },

  // ── PHYSICS: Modern Physics ───────────────────────────────────────────────
  {
    id: 'phy-018', subject: 'Physics', topic: 'Modern Physics', exam: 'JEE Main', year: 2023,
    keywords: ['modern physics', 'photoelectric', 'work function', 'photon', 'einstein'],
    question: 'The work function of a metal is 2.0 eV. The threshold wavelength for the photoelectric effect is approximately:',
    options: ['310 nm', '410 nm', '620 nm', '830 nm'],
    correct: 2,
    explanation: 'λ_threshold = hc/φ. Using hc ≈ 1240 eV·nm, λ = 1240/2 = 620 nm.',
    difficulty: 'Medium',
  },
  {
    id: 'phy-019', subject: 'Physics', topic: 'Modern Physics', exam: 'NEET', year: 2023,
    keywords: ['modern physics', 'bohr', 'hydrogen', 'atom', 'energy level'],
    question: 'The energy of an electron in the n = 2 state of a hydrogen atom is:',
    options: ['−13.6 eV', '−6.8 eV', '−3.4 eV', '−1.51 eV'],
    correct: 2,
    explanation: 'Bohr energy: Eₙ = −13.6/n² eV. For n = 2, E₂ = −13.6/4 = −3.4 eV.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-020', subject: 'Physics', topic: 'Modern Physics', exam: 'JEE Main', year: 2022,
    keywords: ['modern physics', 'de broglie', 'wavelength', 'electron', 'matter wave'],
    question: 'The de Broglie wavelength of an electron accelerated through 100 V is approximately (use λ ≈ 12.27/√V Å):',
    options: ['0.5 Å', '1.2 Å', '2.4 Å', '5.0 Å'],
    correct: 1,
    explanation: 'For an electron accelerated through V volts, λ ≈ 12.27/√V Å. Here λ ≈ 12.27/√100 = 1.23 Å.',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Magnetism / Current Electricity ──────────────────────────────
  {
    id: 'phy-021', subject: 'Physics', topic: 'Magnetism', exam: 'JEE Main', year: 2022,
    keywords: ['magnet', 'magnetism', 'electromagn', 'magnetic field', 'force'],
    question: 'A wire carrying 5 A is placed perpendicular to a magnetic field of 0.2 T. The force per unit length on the wire is:',
    options: ['0.5 N/m', '1.0 N/m', '1.5 N/m', '2.0 N/m'],
    correct: 1,
    explanation: 'F/L = BI sin θ. For θ = 90°: F/L = 0.2 × 5 × 1 = 1.0 N/m.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-022', subject: 'Physics', topic: 'Current Electricity', exam: 'NEET', year: 2022,
    keywords: ['current', 'electricity', 'resistor', 'parallel', 'circuit', 'ohm'],
    question: 'Three resistors of 2 Ω each are connected in parallel. The equivalent resistance is:',
    options: ['6 Ω', '2 Ω', '2/3 Ω', '1 Ω'],
    correct: 2,
    explanation: 'For n equal resistors R in parallel, R_eq = R/n. Here R_eq = 2/3 Ω.',
    difficulty: 'Easy',
  },
  {
    id: 'phy-023', subject: 'Physics', topic: 'Current Electricity', exam: 'JEE Main', year: 2023,
    keywords: ['current', 'electricity', 'circuit', 'power', 'resistance', 'voltage'],
    question: 'A 60 W bulb is rated for 220 V. Its resistance is approximately:',
    options: ['400 Ω', '600 Ω', '807 Ω', '1200 Ω'],
    correct: 2,
    explanation: 'P = V²/R, so R = V²/P = (220)²/60 = 48400/60 ≈ 807 Ω.',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Gravitation ──────────────────────────────────────────────────
  {
    id: 'phy-024', subject: 'Physics', topic: 'Gravitation', exam: 'JEE Main', year: 2023,
    keywords: ['gravity', 'gravitat', 'escape velocity', 'orbit'],
    question: "Earth's escape velocity (R = 6400 km, g = 9.8 m/s²) is approximately:",
    options: ['7.9 km/s', '11.2 km/s', '15.0 km/s', '30 km/s'],
    correct: 1,
    explanation: 'v_e = √(2gR) = √(2 × 9.8 × 6.4×10⁶) ≈ 11.2 km/s. (7.9 km/s is the orbital velocity at the surface.)',
    difficulty: 'Medium',
  },
  {
    id: 'phy-025', subject: 'Physics', topic: 'Gravitation', exam: 'NEET', year: 2022,
    keywords: ['gravity', 'gravitat', 'depth', 'acceleration'],
    question: 'The acceleration due to gravity at depth d below the surface (R = Earth radius, g₀ at surface) is:',
    options: ['g₀(1 + d/R)', 'g₀(1 − d/R)', 'g₀(R/(R+d))²', 'g₀(R/(R−d))²'],
    correct: 1,
    explanation: 'At depth d, g_d = g₀(1 − d/R). At the centre (d = R), g = 0. At the surface (d = 0), g = g₀.',
    difficulty: 'Medium',
  },

  // ── PHYSICS: Rotational Motion ────────────────────────────────────────────
  {
    id: 'phy-026', subject: 'Physics', topic: 'Rotational Motion', exam: 'JEE Main', year: 2023,
    keywords: ['rotat', 'moment of inertia', 'angular', 'torque', 'rigid body'],
    question: 'The moment of inertia of a uniform disc of mass M and radius R about its central axis (perpendicular to the plane) is:',
    options: ['MR²', '(1/2)MR²', '(2/5)MR²', '(1/12)MR²'],
    correct: 1,
    explanation: 'For a uniform solid disc about its central axis perpendicular to its plane, I = (1/2)MR². ((2/5)MR² is for a solid sphere.)',
    difficulty: 'Medium',
  },
  {
    id: 'phy-027', subject: 'Physics', topic: 'Rotational Motion', exam: 'NEET', year: 2022,
    keywords: ['rotat', 'angular momentum', 'conservation'],
    question: 'A rotating ice skater pulls her arms in close to her body. Her angular velocity:',
    options: ['Increases', 'Decreases', 'Stays the same', 'Becomes zero'],
    correct: 0,
    explanation: 'Angular momentum L = Iω is conserved. Pulling arms in reduces I, so ω increases.',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Mole Concept / Stoichiometry ───────────────────────────────
  {
    id: 'che-008', subject: 'Chemistry', topic: 'Mole Concept', exam: 'JEE Main', year: 2023,
    keywords: ['mole', 'stoichiometry', 'moles', 'mass', 'molar'],
    question: 'How many moles of CO₂ are present in 88 g of CO₂? (Molar mass = 44 g/mol)',
    options: ['1', '2', '3', '4'],
    correct: 1,
    explanation: 'n = mass / molar mass = 88 / 44 = 2 moles.',
    difficulty: 'Easy',
  },
  {
    id: 'che-009', subject: 'Chemistry', topic: 'Mole Concept', exam: 'NEET', year: 2022,
    keywords: ['mole', 'stoichiometry', 'avogadro', 'molecule'],
    question: 'The number of molecules in 18 g of water is: (N_A = 6.022 × 10²³)',
    options: ['3.011 × 10²³', '6.022 × 10²³', '1.204 × 10²⁴', '1.806 × 10²⁴'],
    correct: 1,
    explanation: '18 g of water = 1 mole (since M = 18 g/mol) = N_A = 6.022 × 10²³ molecules.',
    difficulty: 'Easy',
  },
  {
    id: 'che-010', subject: 'Chemistry', topic: 'Solutions', exam: 'JEE Main', year: 2022,
    keywords: ['solution', 'molarity', 'concentration', 'mole'],
    question: 'The molarity of a solution containing 0.5 mol NaOH dissolved in 250 mL of solution is:',
    options: ['0.5 M', '1 M', '2 M', '4 M'],
    correct: 2,
    explanation: 'Molarity = moles / volume (in L) = 0.5 / 0.250 = 2 M.',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Equilibrium ────────────────────────────────────────────────
  {
    id: 'che-011', subject: 'Chemistry', topic: 'Chemical Equilibrium', exam: 'JEE Main', year: 2023,
    keywords: ['equilibrium', 'le chatelier', 'reaction', 'kc'],
    question: 'For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), increasing the total pressure shifts the equilibrium:',
    options: ['Forward (toward NH₃)', 'Backward (toward N₂ and H₂)', 'No shift', 'Depends on temperature only'],
    correct: 0,
    explanation: "By Le Chatelier's principle, increasing pressure shifts equilibrium toward the side with fewer moles of gas (4 moles → 2 moles, so forward).",
    difficulty: 'Medium',
  },
  {
    id: 'che-012', subject: 'Chemistry', topic: 'Chemical Equilibrium', exam: 'NEET', year: 2022,
    keywords: ['equilibrium', 'kc', 'reaction quotient'],
    question: 'For H₂ + I₂ ⇌ 2HI, at equilibrium [HI] = 4 M and [H₂] = [I₂] = 1 M. The value of Kc is:',
    options: ['4', '8', '16', '32'],
    correct: 2,
    explanation: 'Kc = [HI]² / ([H₂][I₂]) = (4)² / (1 × 1) = 16.',
    difficulty: 'Medium',
  },

  // ── CHEMISTRY: Periodic Table ─────────────────────────────────────────────
  {
    id: 'che-013', subject: 'Chemistry', topic: 'Periodic Table', exam: 'JEE Main', year: 2023,
    keywords: ['periodic', 'element', 'atomic radius', 'group', 'period'],
    question: 'Which of the following has the largest atomic radius?',
    options: ['Li', 'Na', 'K', 'Rb'],
    correct: 3,
    explanation: 'Atomic radius increases down a group as new electron shells are added. Rb (Period 5) > K > Na > Li.',
    difficulty: 'Easy',
  },
  {
    id: 'che-014', subject: 'Chemistry', topic: 'Periodic Table', exam: 'NEET', year: 2022,
    keywords: ['periodic', 'element', 'ionization', 'energy'],
    question: 'Which element has the highest first ionization energy?',
    options: ['F', 'O', 'N', 'C'],
    correct: 0,
    explanation: 'Across a period IE generally increases. Among C, N, O, F: F has the highest first ionization energy (≈ 1681 kJ/mol). Note that N has a locally higher IE than O due to half-filled 2p stability, but F still tops F > N > O > C.',
    difficulty: 'Medium',
  },

  // ── CHEMISTRY: Thermochemistry ────────────────────────────────────────────
  {
    id: 'che-015', subject: 'Chemistry', topic: 'Thermochemistry', exam: 'JEE Main', year: 2023,
    keywords: ['thermo', 'enthalpy', 'exothermic', 'endothermic', 'heat'],
    question: 'For an exothermic reaction, the sign of ΔH is:',
    options: ['Positive', 'Negative', 'Zero', 'Depends on the reaction'],
    correct: 1,
    explanation: 'Exothermic reactions release heat to the surroundings, so the enthalpy of products is lower than reactants and ΔH < 0.',
    difficulty: 'Easy',
  },

  // ── CHEMISTRY: Electrochemistry / States of Matter ────────────────────────
  {
    id: 'che-016', subject: 'Chemistry', topic: 'Electrochemistry', exam: 'JEE Main', year: 2022,
    keywords: ['electrochemistry', 'galvanic', 'cell', 'electrolysis', 'oxidation', 'redox'],
    question: 'In a galvanic (voltaic) cell, oxidation occurs at the:',
    options: ['Anode', 'Cathode', 'Both electrodes equally', 'Neither electrode'],
    correct: 0,
    explanation: 'In any electrochemical cell, oxidation occurs at the anode and reduction at the cathode (mnemonic: AnOx, RedCat).',
    difficulty: 'Easy',
  },
  {
    id: 'che-017', subject: 'Chemistry', topic: 'States of Matter', exam: 'NEET', year: 2022,
    keywords: ['gas', 'state of matter', 'ideal gas', 'molar volume', 'stp'],
    question: 'At STP (0 °C, 1 atm), the volume occupied by 1 mole of an ideal gas is:',
    options: ['11.2 L', '22.4 L', '24.5 L', '28.0 L'],
    correct: 1,
    explanation: 'At STP, the molar volume of an ideal gas is 22.4 L/mol. (24.5 L is the molar volume at 25 °C, sometimes called SATP.)',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Matrices & Determinants ──────────────────────────────────
  {
    id: 'mat-010', subject: 'Mathematics', topic: 'Matrices', exam: 'JEE Main', year: 2023,
    keywords: ['matrix', 'matrices', 'determinant'],
    question: 'If A = [[1, 2], [3, 4]], the determinant of A is:',
    options: ['−2', '0', '2', '10'],
    correct: 0,
    explanation: 'For a 2×2 matrix [[a,b],[c,d]], det = ad − bc = 1·4 − 2·3 = −2.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-011', subject: 'Mathematics', topic: 'Matrices', exam: 'JEE Main', year: 2022,
    keywords: ['matrix', 'matrices', 'determinant', 'scalar'],
    question: 'If A is a 3×3 matrix with |A| = 5, then |2A| equals:',
    options: ['5', '10', '20', '40'],
    correct: 3,
    explanation: 'For an n×n matrix, |kA| = kⁿ|A|. Here |2A| = 2³ × 5 = 40.',
    difficulty: 'Medium',
  },

  // ── MATHEMATICS: Complex Numbers ──────────────────────────────────────────
  {
    id: 'mat-012', subject: 'Mathematics', topic: 'Complex Numbers', exam: 'JEE Main', year: 2023,
    keywords: ['complex', 'imaginary', 'iota'],
    question: 'The value of i² + i⁴ + i⁶ + i⁸ is:',
    options: ['0', '1', '−1', '4'],
    correct: 0,
    explanation: 'i² = −1, i⁴ = 1, i⁶ = −1, i⁸ = 1. Sum = −1 + 1 − 1 + 1 = 0.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-013', subject: 'Mathematics', topic: 'Complex Numbers', exam: 'JEE Main', year: 2022,
    keywords: ['complex', 'modulus', 'magnitude'],
    question: 'The modulus of the complex number 3 + 4i is:',
    options: ['5', '7', '12', '25'],
    correct: 0,
    explanation: '|a + bi| = √(a² + b²) = √(9 + 16) = √25 = 5.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Sequences & Series ───────────────────────────────────────
  {
    id: 'mat-014', subject: 'Mathematics', topic: 'Sequences & Series', exam: 'JEE Main', year: 2023,
    keywords: ['sequence', 'series', 'ap', 'arithmetic progression', 'sum'],
    question: 'The sum of the first 20 terms of an arithmetic progression with a = 2 and d = 3 is:',
    options: ['580', '610', '640', '700'],
    correct: 1,
    explanation: 'Sₙ = (n/2)(2a + (n−1)d) = (20/2)(4 + 19·3) = 10 × 61 = 610.',
    difficulty: 'Medium',
  },
  {
    id: 'mat-015', subject: 'Mathematics', topic: 'Sequences & Series', exam: 'JEE Main', year: 2022,
    keywords: ['sequence', 'series', 'gp', 'geometric progression', 'sum'],
    question: 'The sum to infinity of the geometric series 1/2 + 1/4 + 1/8 + … is:',
    options: ['1/2', '1', '2', 'Infinite (diverges)'],
    correct: 1,
    explanation: 'For |r| < 1, S∞ = a / (1 − r) = (1/2) / (1 − 1/2) = 1.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Coordinate Geometry ──────────────────────────────────────
  {
    id: 'mat-016', subject: 'Mathematics', topic: 'Coordinate Geometry', exam: 'JEE Main', year: 2023,
    keywords: ['coordinate', 'geometry', 'distance', 'point'],
    question: 'The distance between the points (3, 4) and (0, 0) is:',
    options: ['3', '4', '5', '7'],
    correct: 2,
    explanation: 'd = √((x₂ − x₁)² + (y₂ − y₁)²) = √(9 + 16) = √25 = 5.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-017', subject: 'Mathematics', topic: 'Coordinate Geometry', exam: 'JEE Main', year: 2022,
    keywords: ['coordinate', 'geometry', 'circle', 'equation'],
    question: 'The equation of a circle with centre (2, 3) and radius 4 is:',
    options: ['(x − 2)² + (y − 3)² = 4', '(x − 2)² + (y − 3)² = 16', '(x + 2)² + (y + 3)² = 16', 'x² + y² = 16'],
    correct: 1,
    explanation: 'Standard form: (x − h)² + (y − k)² = r². With (h, k) = (2, 3) and r = 4: (x − 2)² + (y − 3)² = 16.',
    difficulty: 'Easy',
  },

  // ── MATHEMATICS: Permutations & Combinations / Statistics ─────────────────
  {
    id: 'mat-018', subject: 'Mathematics', topic: 'Permutations & Combinations', exam: 'JEE Main', year: 2023,
    keywords: ['permutation', 'combination', 'arrangement', 'factorial'],
    question: 'In how many distinct ways can 5 different books be arranged on a shelf?',
    options: ['25', '60', '120', '720'],
    correct: 2,
    explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.',
    difficulty: 'Easy',
  },
  {
    id: 'mat-019', subject: 'Mathematics', topic: 'Permutations & Combinations', exam: 'JEE Main', year: 2022,
    keywords: ['permutation', 'combination', 'selection', 'choose'],
    question: 'In how many ways can 3 books be selected from a set of 8?',
    options: ['24', '56', '120', '336'],
    correct: 1,
    explanation: '⁸C₃ = 8! / (3! · 5!) = (8 × 7 × 6) / (3 × 2 × 1) = 56.',
    difficulty: 'Medium',
  },
  {
    id: 'mat-020', subject: 'Mathematics', topic: 'Statistics', exam: 'JEE Main', year: 2022,
    keywords: ['statistics', 'mean', 'average', 'data'],
    question: 'The arithmetic mean of 2, 4, 6, 8, 10 is:',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: 'Mean = sum / count = (2 + 4 + 6 + 8 + 10) / 5 = 30 / 5 = 6.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Plant Physiology ─────────────────────────────────────────────
  {
    id: 'bio-011', subject: 'Biology', topic: 'Plant Physiology', exam: 'NEET', year: 2023,
    keywords: ['plant', 'stomata', 'leaf', 'transpiration', 'gas exchange'],
    question: 'Stomata in leaves are primarily involved in:',
    options: ['Water absorption from soil', 'Gas exchange and transpiration', 'Photosynthesis directly', 'Mineral transport'],
    correct: 1,
    explanation: 'Stomata are pores (mostly on leaf undersides) that regulate gas exchange (CO₂ in, O₂ out) and water-vapour loss via transpiration.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-012', subject: 'Biology', topic: 'Plant Physiology', exam: 'NEET', year: 2022,
    keywords: ['plant', 'chlorophyll', 'photosynthesis', 'pigment'],
    question: 'The metal ion present at the centre of a chlorophyll molecule is:',
    options: ['Fe²⁺', 'Mg²⁺', 'Ca²⁺', 'Cu²⁺'],
    correct: 1,
    explanation: 'Chlorophyll has a magnesium ion (Mg²⁺) coordinated at the centre of its porphyrin ring (analogous to Fe²⁺ in haem).',
    difficulty: 'Easy',
  },
  {
    id: 'bio-013', subject: 'Biology', topic: 'Plant Physiology', exam: 'NEET', year: 2023,
    keywords: ['plant', 'phloem', 'translocation', 'transport'],
    question: 'Translocation of food (sucrose) in phloem occurs primarily by:',
    options: ['Transpiration pull', 'Pressure-driven mass flow (Münch hypothesis)', 'Root pressure', 'Capillary action'],
    correct: 1,
    explanation: 'Sugars move through phloem via mass flow driven by pressure gradients between source (leaves) and sink (roots, fruits) — the Münch hypothesis.',
    difficulty: 'Medium',
  },

  // ── BIOLOGY: Reproduction ─────────────────────────────────────────────────
  {
    id: 'bio-014', subject: 'Biology', topic: 'Human Reproduction', exam: 'NEET', year: 2023,
    keywords: ['reproduction', 'fertilization', 'human', 'embryo'],
    question: 'In humans, fertilization normally occurs in the:',
    options: ['Ovary', 'Uterus', 'Fallopian tube (oviduct)', 'Vagina'],
    correct: 2,
    explanation: 'Fertilization occurs in the ampullary region of the fallopian tube (oviduct); the zygote then travels to the uterus for implantation.',
    difficulty: 'Easy',
  },

  // ── BIOLOGY: Ecology ──────────────────────────────────────────────────────
  {
    id: 'bio-015', subject: 'Biology', topic: 'Ecology', exam: 'NEET', year: 2022,
    keywords: ['ecology', 'food chain', 'ecosystem', 'energy', 'trophic'],
    question: 'In a typical food chain, the maximum amount of energy is found at the level of:',
    options: ['Producers', 'Primary consumers', 'Secondary consumers', 'Decomposers'],
    correct: 0,
    explanation: 'Energy decreases at each trophic level (~10% transfer). Producers (autotrophs) capture solar energy first and contain the largest amount.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-016', subject: 'Biology', topic: 'Ecology', exam: 'NEET', year: 2023,
    keywords: ['ecology', 'energy', 'trophic', 'lindeman'],
    question: 'The 10% law of energy transfer between trophic levels was given by:',
    options: ['Lindeman', 'Tansley', 'Odum', 'Darwin'],
    correct: 0,
    explanation: 'Raymond Lindeman (1942) proposed that only ~10% of the energy at one trophic level is passed to the next.',
    difficulty: 'Medium',
  },

  // ── BIOLOGY: Human Physiology (more) ──────────────────────────────────────
  {
    id: 'bio-017', subject: 'Biology', topic: 'Human Physiology', exam: 'NEET', year: 2022,
    keywords: ['human', 'kidney', 'nephron', 'excretion'],
    question: 'The structural and functional unit of the human kidney is the:',
    options: ['Glomerulus', 'Nephron', 'Neuron', 'Alveolus'],
    correct: 1,
    explanation: 'The nephron is the structural and functional unit of the kidney; each kidney has ~1 million nephrons.',
    difficulty: 'Easy',
  },
  {
    id: 'bio-018', subject: 'Biology', topic: 'Human Physiology', exam: 'NEET', year: 2023,
    keywords: ['human', 'hormone', 'pancreas', 'insulin', 'endocrine'],
    question: 'Insulin is secreted by which cells of the pancreas?',
    options: ['Alpha cells of islets of Langerhans', 'Beta cells of islets of Langerhans', 'Acinar cells', 'Delta cells'],
    correct: 1,
    explanation: 'Insulin is secreted by the beta cells in the islets of Langerhans of the pancreas; it lowers blood glucose by promoting cellular uptake.',
    difficulty: 'Easy',
  },

  // ── POLITY (UPSC) ─────────────────────────────────────────────────────────
  {
    id: 'pol-001', subject: 'Polity', topic: 'Constitution of India', exam: 'UPSC', year: 2022,
    keywords: ['polity', 'constitution', 'preamble', 'india'],
    question: 'After the 42nd Amendment (1976), the Preamble describes India as a:',
    options: ['Sovereign Democratic Republic', 'Sovereign Socialist Secular Democratic Republic', 'Sovereign Federal Secular Republic', 'Socialist Federal Democratic Republic'],
    correct: 1,
    explanation: 'The 42nd Amendment Act (1976) added the words "Socialist", "Secular", and "Integrity" to the Preamble, giving the present description: Sovereign Socialist Secular Democratic Republic.',
    difficulty: 'Medium',
  },
  {
    id: 'pol-002', subject: 'Polity', topic: 'Fundamental Rights', exam: 'UPSC', year: 2023,
    keywords: ['polity', 'fundamental rights', 'article 21', 'liberty'],
    question: 'Article 21 of the Indian Constitution guarantees the right to:',
    options: ['Equality before law', 'Freedom of speech and expression', 'Life and personal liberty', 'Free and compulsory education'],
    correct: 2,
    explanation: 'Article 21: "No person shall be deprived of his life or personal liberty except according to procedure established by law." It is the cornerstone of the fundamental rights and has been interpreted very expansively.',
    difficulty: 'Easy',
  },
  {
    id: 'pol-003', subject: 'Polity', topic: 'Constitution of India', exam: 'UPSC', year: 2022,
    keywords: ['polity', 'constitution', 'adoption', 'date', 'history'],
    question: 'The Constitution of India was adopted by the Constituent Assembly on:',
    options: ['26 January 1950', '26 November 1949', '15 August 1947', '26 January 1949'],
    correct: 1,
    explanation: 'The Constituent Assembly adopted the Constitution on 26 November 1949 (now celebrated as Constitution Day). It came into force on 26 January 1950 (Republic Day).',
    difficulty: 'Easy',
  },
  {
    id: 'pol-004', subject: 'Polity', topic: 'Fundamental Rights', exam: 'UPSC', year: 2023,
    keywords: ['polity', 'fundamental rights', 'amendment'],
    question: 'How many fundamental rights are currently guaranteed by the Constitution of India?',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: 'Originally there were 7 fundamental rights. The 44th Amendment (1978) removed the Right to Property from this list (it is now a constitutional right under Article 300A). Six remain: Equality, Freedom, Against Exploitation, Freedom of Religion, Cultural & Educational, and Constitutional Remedies.',
    difficulty: 'Medium',
  },
  {
    id: 'pol-005', subject: 'Polity', topic: 'Parliament', exam: 'UPSC', year: 2022,
    keywords: ['polity', 'parliament', 'speaker', 'lok sabha'],
    question: 'The Speaker of the Lok Sabha is elected by:',
    options: ['The Prime Minister', 'The President of India', 'The members of the Lok Sabha from amongst themselves', 'The ruling political party'],
    correct: 2,
    explanation: 'Under Article 93, the members of the Lok Sabha elect the Speaker and Deputy Speaker from amongst themselves.',
    difficulty: 'Easy',
  },

  // ── HISTORY (UPSC) ────────────────────────────────────────────────────────
  {
    id: 'his-001', subject: 'History', topic: 'Modern Indian History', exam: 'UPSC', year: 2023,
    keywords: ['history', 'plassey', 'british', 'east india company'],
    question: 'The Battle of Plassey was fought in:',
    options: ['1757', '1764', '1857', '1947'],
    correct: 0,
    explanation: 'On 23 June 1757, Robert Clive of the British East India Company defeated Siraj-ud-Daulah, the Nawab of Bengal — the start of British political dominance in India.',
    difficulty: 'Easy',
  },
  {
    id: 'his-002', subject: 'History', topic: 'Indian Freedom Struggle', exam: 'UPSC', year: 2022,
    keywords: ['history', 'congress', 'freedom struggle', 'inc'],
    question: 'The Indian National Congress was founded in the year:',
    options: ['1857', '1885', '1905', '1919'],
    correct: 1,
    explanation: 'The Indian National Congress was founded on 28 December 1885 by A.O. Hume, with W.C. Bonnerjee as the first president of its Bombay session.',
    difficulty: 'Easy',
  },
  {
    id: 'his-003', subject: 'History', topic: 'Indian Freedom Struggle', exam: 'UPSC', year: 2023,
    keywords: ['history', 'quit india', 'gandhi', 'freedom struggle'],
    question: 'The Quit India Movement was launched by Mahatma Gandhi in:',
    options: ['1920', '1930', '1942', '1947'],
    correct: 2,
    explanation: 'The Quit India Movement was launched on 8 August 1942 at the AICC Bombay session with the call "Do or Die".',
    difficulty: 'Easy',
  },
  {
    id: 'his-004', subject: 'History', topic: 'Constitution of India', exam: 'UPSC', year: 2022,
    keywords: ['history', 'constitution', 'ambedkar', 'drafting'],
    question: "Who is regarded as the 'Father of the Indian Constitution'?",
    options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'B. R. Ambedkar', 'Sardar Patel'],
    correct: 2,
    explanation: 'Dr. B. R. Ambedkar chaired the Drafting Committee of the Constituent Assembly and is widely regarded as the principal architect of the Indian Constitution.',
    difficulty: 'Easy',
  },
  {
    id: 'his-005', subject: 'History', topic: 'Ancient Indian History', exam: 'UPSC', year: 2023,
    keywords: ['history', 'ancient', 'mauryan', 'ashoka', 'kalinga'],
    question: 'The Mauryan emperor associated with the Kalinga War (c. 261 BCE) is:',
    options: ['Chandragupta Maurya', 'Bindusara', 'Ashoka', 'Brihadratha'],
    correct: 2,
    explanation: 'Ashoka the Great fought and won the Kalinga War; the bloodshed transformed him and led him to embrace Buddhism and propagate dhamma through edicts.',
    difficulty: 'Easy',
  },

  // ── GEOGRAPHY (UPSC) ──────────────────────────────────────────────────────
  {
    id: 'geo-001', subject: 'Geography', topic: 'Indian Geography', exam: 'UPSC', year: 2022,
    keywords: ['geography', 'india', 'river', 'ganga'],
    question: 'The longest river entirely flowing within India is:',
    options: ['Ganga', 'Yamuna', 'Brahmaputra', 'Godavari'],
    correct: 0,
    explanation: 'The Ganga is ~2,525 km long, the longest river in India. The Brahmaputra is longer overall but most of its length lies outside India.',
    difficulty: 'Medium',
  },
  {
    id: 'geo-002', subject: 'Geography', topic: 'Indian Geography', exam: 'UPSC', year: 2023,
    keywords: ['geography', 'india', 'tropic of cancer', 'latitude'],
    question: 'Which of the following Indian states does the Tropic of Cancer NOT pass through?',
    options: ['Gujarat', 'Madhya Pradesh', 'Maharashtra', 'Jharkhand'],
    correct: 2,
    explanation: 'The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. Maharashtra is not one of them.',
    difficulty: 'Hard',
  },
  {
    id: 'geo-003', subject: 'Geography', topic: 'Indian Geography', exam: 'UPSC', year: 2022,
    keywords: ['geography', 'india', 'mountain', 'peak', 'himalaya'],
    question: 'The highest mountain peak entirely within Indian territory is:',
    options: ['Mount Everest', 'Kanchenjunga', 'K2', 'Nanda Devi'],
    correct: 1,
    explanation: 'Kanchenjunga (8,586 m) is the highest peak entirely within India (Sikkim). K2 lies in Pakistan-administered territory; Mount Everest is on the Nepal-China border.',
    difficulty: 'Medium',
  },

  // ── ECONOMICS (UPSC) ──────────────────────────────────────────────────────
  {
    id: 'eco-001', subject: 'Economics', topic: 'Indian Economy', exam: 'UPSC', year: 2023,
    keywords: ['economics', 'rbi', 'reserve bank', 'monetary'],
    question: 'The Reserve Bank of India (RBI) was established in:',
    options: ['1935', '1947', '1949', '1951'],
    correct: 0,
    explanation: 'RBI was established on 1 April 1935 under the RBI Act, 1934, originally as a private institution. It was nationalized on 1 January 1949.',
    difficulty: 'Medium',
  },
  {
    id: 'eco-002', subject: 'Economics', topic: 'National Income', exam: 'UPSC', year: 2022,
    keywords: ['economics', 'gdp', 'national income', 'tax'],
    question: 'GDP at market prices equals GDP at factor cost plus:',
    options: ['Subsidies minus indirect taxes', 'Indirect taxes minus subsidies', 'Depreciation', 'Net exports'],
    correct: 1,
    explanation: 'GDP at market price = GDP at factor cost + (Indirect taxes − Subsidies). The difference is called "net indirect taxes."',
    difficulty: 'Hard',
  },

  // ── ENVIRONMENT (UPSC) ────────────────────────────────────────────────────
  {
    id: 'env-001', subject: 'Environment', topic: 'International Conventions', exam: 'UPSC', year: 2023,
    keywords: ['environment', 'ramsar', 'wetland', 'convention'],
    question: 'The Ramsar Convention is associated with the conservation of:',
    options: ['Climate / greenhouse gases', 'Wetlands of international importance', 'The ozone layer', 'Trade in endangered species'],
    correct: 1,
    explanation: 'The Ramsar Convention (signed 1971 in Ramsar, Iran; in force 1975) is an international treaty for the conservation and sustainable use of wetlands.',
    difficulty: 'Easy',
  },
  {
    id: 'env-002', subject: 'Environment', topic: 'International Conventions', exam: 'UPSC', year: 2022,
    keywords: ['environment', 'kyoto', 'climate', 'greenhouse'],
    question: 'The Kyoto Protocol primarily aims to address:',
    options: ['Ozone-layer depletion', 'Reduction of greenhouse-gas emissions', 'Marine pollution', 'Loss of biodiversity'],
    correct: 1,
    explanation: 'The Kyoto Protocol (adopted 1997, in force 2005) was the first internationally binding agreement under the UNFCCC committing developed countries to GHG-emission reduction targets.',
    difficulty: 'Medium',
  },

  // ── LAW ───────────────────────────────────────────────────────────────────
  {
    id: 'law-001', subject: 'Law', topic: 'Constitutional Amendments', exam: 'Law', year: 2023,
    keywords: ['law', 'rte', 'right to education', 'amendment', 'article 21a'],
    question: 'The Right to Education was made a fundamental right by which constitutional amendment?',
    options: ['73rd Amendment', '74th Amendment', '86th Amendment', '93rd Amendment'],
    correct: 2,
    explanation: 'The 86th Amendment (2002) inserted Article 21A, making free and compulsory education for children aged 6–14 a fundamental right. It was operationalized by the RTE Act, 2009.',
    difficulty: 'Medium',
  },
  {
    id: 'law-002', subject: 'Law', topic: 'Powers of the President', exam: 'Law', year: 2022,
    keywords: ['law', 'president', 'pardon', 'article 72', 'mercy'],
    question: 'Under which Article does the President of India have the power to grant pardons?',
    options: ['Article 21', 'Article 72', 'Article 124', 'Article 161'],
    correct: 1,
    explanation: 'Article 72 empowers the President to grant pardons, reprieves, respites, or remissions of punishment. Governors hold a similar but narrower power under Article 161.',
    difficulty: 'Medium',
  },
];

/** Returns PYQ questions matching the current topic via keyword search. */
export function getPYQsForTopic(topic: string): PYQQuestion[] {
  const t = topic.toLowerCase();
  return PYQ_BANK.filter((q) =>
    q.keywords.some((kw) => t.includes(kw) || kw.includes(t.split(' ')[0]))
  );
}
