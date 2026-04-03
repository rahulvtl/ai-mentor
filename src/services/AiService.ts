import { PHET_SIMULATIONS } from './phetIndex';
import { duckDuckGoSearch, type SearchResult } from './searchService';
export type { SearchResult };

export interface WikiContext {
  description?: string;
  image?: string;
  url?: string;
  title?: string;
}

export interface AiResponse {
  instruction: string;
  mistake: string;
  insight: string;
}

export interface StudentState {
  [key: string]: any;
}

export interface AiRequestPayload {
  subject: string;
  topic: string;
  concept: string;
  state: Partial<StudentState> | any;
  goal: string;
}

export interface ArticleSection {
  title: string;
  items: { text: string; inlineMath?: string; blockMath?: string }[];
}

/** A section from a full Wikipedia article (plain text, HTML already stripped). */
export interface WikiArticleSection {
  title: string;
  text: string;
  anchor: string;
}

export interface LearningModule {
  topic: string;
  type: 'grid' | 'phet' | 'formula' | 'calculator' | 'angles' | 'area-interactive' | 'article' | 'interactive' | 'theoretical' | 'timeline' | 'map';
  calculatorType?: 'pythagoras';
  info: string;
  phetUrl?: string;
  iframeUrl?: string;
  formulas?: string[];
  articleDescription?: string;
  articleImage?: string;
  articleUrl?: string;
  articleSections?: ArticleSection[];
  /** Full Wikipedia article sections (plain text), populated dynamically. */
  wikiSections?: WikiArticleSection[];
  goal: string;
  /** Web search reference cards shown in the Learn tab when Wikipedia info is sparse. */
  searchResults?: SearchResult[];
}

export class AiService {
  private static mockDelay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Strip HTML tags using the browser's DOM parser — handles all entities safely. */
  private static stripHtml(html: string): string {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent ?? el.innerText ?? '').replace(/\s+/g, ' ').trim();
  }

  private static getPredefinedMatch(lowerQuery: string): LearningModule | null {
    if (lowerQuery.includes('area') || lowerQuery.includes('rectangle')) {
      return {
        topic: 'Area of a Rectangle',
        type: 'area-interactive',
        info: 'The area of a rectangle is calculated by multiplying its length by its width.',
        goal: 'Explore how changing the length and width affects the total area.'
      };
    }

    if (/\b(angle|angles|vector|vectors|trigo|trigonometry)\b/.test(lowerQuery)) {
      return {
        topic: 'Interactive Vectors & Angles',
        type: 'angles',
        info: 'Explore the relationship between a vector\'s Cartesian coordinates (x, y) and its polar coordinates (magnitude r, angle θ).',
        goal: 'Drag the vector to exactly 45 degrees.'
      };
    }

    if (lowerQuery.includes('pythagoras') || lowerQuery.includes('triangle')) {
      return {
        topic: 'Pythagoras Theorem',
        type: 'calculator',
        calculatorType: 'pythagoras',
        info: 'The Pythagorean theorem states that the square of the hypotenuse is equal to the sum of the squares of the other two sides.',
        goal: 'Enter values for the triangle sides to solve for the missing variable.'
      };
    }

    if (lowerQuery.includes('algebra') || lowerQuery.includes('math')) {
      return {
        topic: 'Algebra',
        type: 'article',
        info: 'Algebra uses letters (variables) to represent numbers and establish relationships.',
        goal: 'Review the foundational algebraic identities and operations.',
        articleDescription: 'Algebra uses letters (variables) to represent numbers and establish relationships. Here are the most common formulas you\'ll likely need:',
        articleSections: [
          {
            title: 'Basic Operations & Factoring',
            items: [
              { text: 'Distributive Law', inlineMath: 'a(b + c) = ab + ac' },
              { text: 'Difference of Squares', inlineMath: 'a^2 - b^2 = (a - b)(a + b)' },
              { text: 'Square of a Sum', inlineMath: '(a + b)^2 = a^2 + 2ab + b^2' },
              { text: 'Square of a Difference', inlineMath: '(a - b)^2 = a^2 - 2ab + b^2' }
            ]
          },
          {
            title: 'Solving Equations',
            items: [
              { text: 'Quadratic Formula', inlineMath: 'For \\ ax^2 + bx + c = 0', blockMath: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
              { text: 'Slope of a Line (m)', inlineMath: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
              { text: 'Slope-Intercept Form', inlineMath: 'y = mx + c' }
            ]
          },
          {
            title: 'Laws of Exponents',
            items: [
              { text: 'Multiplication', inlineMath: 'a^m \\cdot a^n = a^{m+n}' },
              { text: 'Division', inlineMath: '\\frac{a^m}{a^n} = a^{m-n}' },
              { text: 'Power to a Power', inlineMath: '(a^m)^n = a^{mn}' }
            ]
          }
        ]
      };
    }

    if (lowerQuery.includes('pi') || lowerQuery.includes('pai')) {
      return {
        topic: 'Pi (π)',
        type: 'article',
        info: 'Pi is a mathematical constant that is the ratio of a circle\'s circumference to its diameter.',
        goal: 'Review the definition and properties of Pi.',
        articleDescription: 'Pi (often represented by the lower-case Greek letter π) is an irrational number, meaning it cannot be written as a simple fraction and its decimal representation never ends or repeats (3.14159...).',
        articleSections: [
          {
            title: 'Common Formulas involving Pi',
            items: [
              { text: 'Circumference (d = diameter)', inlineMath: 'C = \\pi d' },
              { text: 'Circumference (r = radius)', inlineMath: 'C = 2\\pi r' },
              { text: 'Area of a Circle', inlineMath: 'A = \\pi r^2' },
              { text: 'Volume of a Sphere', inlineMath: 'V = \\frac{4}{3}\\pi r^3' }
            ]
          }
        ]
      }
    }

    return null;
  }
  private static getPhetMatch(lowerQuery: string): LearningModule | null {
    const exactMatch = PHET_SIMULATIONS.find(sim => sim.title.toLowerCase() === lowerQuery);
    if (exactMatch) {
      return {
        topic: exactMatch.title,
        type: 'phet',
        info: `Dive into the interactive ${exactMatch.title} simulation from PhET.`,
        phetUrl: `https://phet.colorado.edu/sims/html/${exactMatch.slug}/latest/${exactMatch.slug}_en.html`,
        goal: `Explore the ${exactMatch.title} simulation and observe the outcomes.`
      };
    }

    const fuzzyMatch = PHET_SIMULATIONS.find(sim => {
      const titleLower = sim.title.toLowerCase();
      return titleLower.includes(lowerQuery) || lowerQuery.includes(titleLower);
    });

    if (fuzzyMatch) {
      return {
        topic: fuzzyMatch.title,
        type: 'phet',
        info: `Explore ${fuzzyMatch.title} through this interactive PhET simulation.`,
        phetUrl: `https://phet.colorado.edu/sims/html/${fuzzyMatch.slug}/latest/${fuzzyMatch.slug}_en.html`,
        goal: `Interact with the ${fuzzyMatch.title} simulation to understand the underlying principles.`
      };
    }

    return null;
  }

  private static isHistoryTopic(q: string): boolean {
    return /\b(war|battle|revolution|independence|dynasty|empire|civilization|massacre|movement|treaty|constitution|colonial|ancient|medieval|uprising|rebellion|mughal|british|freedom|partition|history|historical|sultan|king|queen|president|prime minister|parliament|election|coup|protest|reform|act of |era|period|century|decade|kingdom|republic|invasion)\b/.test(q);
  }

  private static isGeographyTopic(q: string): boolean {
    return /\b(geography|geograph|river|mountain|lake|ocean|continent|capital|climate|terrain|plateau|peninsula|desert|forest|delta|basin|range|coast|border|region|state|country|nation|map|physical|natural|topograph|longitude|latitude|rainfall|monsoon|tectonic|volcano|earthquake|tide|biodiversity|ecosystem|biome)\b/.test(q);
  }

  static async searchTopic(query: string): Promise<LearningModule> {
    await this.mockDelay(500 + Math.random() * 300);
    const lowerQuery = query.toLowerCase();

    let extDescription: string | undefined = undefined;
    let extImage: string | undefined = undefined;
    let extUrl: string | undefined = undefined;
    let extTopicTitle: string | undefined = undefined;
    let extWikiSections: WikiArticleSection[] | undefined = undefined;

    try {
      const cleanedQuery = query
        .replace(/^(what is|what are|define|explain|who is|who are|how does|what's)\s+/gi, '')
        .replace(/[?.:!]/g, '')
        .trim();

      const buildSearchParams = (q: string) =>
        new URLSearchParams({ action: 'query', list: 'search', srsearch: q, srinfo: 'suggestion', utf8: '', format: 'json', origin: '*' });

      const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?${buildSearchParams(cleanedQuery).toString()}`);

      if (searchRes.ok) {
        const searchData = await searchRes.json();

        // If zero results but Wikipedia suggests a correction, retry with it
        let results: { title: string }[] = searchData.query?.search ?? [];
        if (results.length === 0) {
          const suggestion: string | undefined = searchData.query?.searchinfo?.suggestion;
          if (suggestion) {
            const retryRes = await fetch(`https://en.wikipedia.org/w/api.php?${buildSearchParams(suggestion).toString()}`);
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              results = retryData.query?.search ?? [];
            }
          }
        }

        if (results.length > 0) {
          const topResultTitle = results[0].title;
          extTopicTitle = topResultTitle;

          // 1. Summary (existing)
          const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topResultTitle)}?origin=*`
          );
          if (summaryRes.ok) {
            const data = await summaryRes.json();
            if (data.type !== 'disambiguation' && data.extract) {
              extDescription = data.extract;
              extImage = data.thumbnail?.source;
              extUrl = data.content_urls?.desktop?.page;

              // 2. Full sections (new — only when we have a real article)
              try {
                const sectionsRes = await fetch(
                  `https://en.wikipedia.org/api/rest_v1/page/mobile-sections/${encodeURIComponent(topResultTitle)}?origin=*`
                );
                if (sectionsRes.ok) {
                  const sectionsData = await sectionsRes.json();
                  const rawSections: { line?: string; text?: string; anchor?: string; toclevel?: number }[] =
                    sectionsData.remaining?.sections ?? [];

                  const SKIP = /^(references|see also|external links|notes|further reading|bibliography|footnotes)/i;
                  const sections: WikiArticleSection[] = [];

                  for (const sec of rawSections) {
                    if ((sec.toclevel ?? 99) > 1) continue; // top-level only
                    const title = this.stripHtml(sec.line ?? '');
                    if (!title || SKIP.test(title)) continue;
                    const text = this.stripHtml(sec.text ?? '');
                    if (text.length < 30) continue;
                    sections.push({ title, text: text.slice(0, 900), anchor: sec.anchor ?? '' });
                    if (sections.length >= 8) break;
                  }
                  if (sections.length > 0) extWikiSections = sections;
                }
              } catch { /* sections are optional — silently skip */ }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to dynamically fetch from web:', error);
    }

    const predefined = this.getPredefinedMatch(lowerQuery);
    if (predefined) {
      if (!predefined.articleDescription) predefined.articleDescription = extDescription;
      if (!predefined.articleImage) predefined.articleImage = extImage;
      if (!predefined.articleUrl) predefined.articleUrl = extUrl;
      if (extWikiSections) predefined.wikiSections = extWikiSections;
      return predefined;
    }

    const phetMatch = this.getPhetMatch(lowerQuery);
    if (phetMatch) {
      if (!phetMatch.articleDescription) phetMatch.articleDescription = extDescription;
      if (!phetMatch.articleImage) phetMatch.articleImage = extImage;
      if (!phetMatch.articleUrl) phetMatch.articleUrl = extUrl;
      if (extWikiSections) phetMatch.wikiSections = extWikiSections;
      return phetMatch;
    }

    if (extDescription) {
      const resolvedTopic = extTopicTitle || query;
      // Check query + Wikipedia title + first sentence of description for better detection
      const fullSignal = `${lowerQuery} ${(extTopicTitle ?? '').toLowerCase()} ${extDescription.slice(0, 300).toLowerCase()}`;
      const moduleType = this.isGeographyTopic(fullSignal)
        ? 'map'
        : this.isHistoryTopic(fullSignal)
        ? 'timeline'
        : 'article';

      return {
        topic: resolvedTopic,
        type: moduleType,
        info: 'Dynamically sourced from Wikipedia.',
        articleDescription: extDescription,
        articleImage: extImage,
        articleUrl: extUrl,
        wikiSections: extWikiSections,
        goal: `Explore and understand ${resolvedTopic}.`,
        articleSections: [],
      };
    }

    // No Wikipedia content found — fall back to DuckDuckGo reference cards (free, no key)
    const searchResults = await duckDuckGoSearch(query);

    return {
      topic: query,
      type: 'article',
      info: searchResults.length > 0
        ? 'No Wikipedia article found. Showing web search results below.'
        : 'We could not find this topic. Try a different search term.',
      articleDescription: searchResults.length > 0
        ? `No Wikipedia summary was found for "${query}". Here are some reference links from the web:`
        : `The AI Engine could not find content for "${query}". Try a different search term.`,
      goal: 'Review the reference links or ask the AI Tutor directly.',
      articleSections: [],
      searchResults: searchResults.length > 0 ? searchResults : undefined
    };
  }

  static async getFeedback(payload: AiRequestPayload): Promise<AiResponse> {
    await this.mockDelay(800 + Math.random() * 400);
    const { state, topic } = payload;

    if (topic === 'Interactive Vectors & Angles') {
       const { angle } = state;
       if (angle === undefined) return {
         instruction: "Click and drag the node to explore.",
         mistake: "No interaction detected.",
         insight: "A vector has both a magnitude and a direction."
       };
       if (Math.abs(angle - 45) < 1) {
         return {
           instruction: "Perfect! You hit the target angle.",
           mistake: "No mistake.",
           insight: "At exactly 45°, the x and y components are equal."
         };
       }
       return {
         instruction: angle < 45 ? "Increase the angle." : "Decrease the angle.",
         mistake: `Current angle: ${angle.toFixed(1)}°.`,
         insight: "Angles are measured counter-clockwise from the x-axis."
       };
    }

    if (topic === 'Pythagoras Theorem') {
      const { valA, valB, valC, result } = state;
      if (!valA && !valB && !valC) {
        return {
          instruction: "Enter the known lengths of the triangle's sides.",
          mistake: "No values entered.",
          insight: "The hypotenuse (c) is always the longest side."
        };
      }
      if (result !== null && result !== undefined) {
        return {
          instruction: "Great job! Try changing the inputs.",
          mistake: "No mistake.",
          insight: "The Pythagorean theorem relates the sides of a right triangle: a² + b² = c²."
        };
      }
      return {
        instruction: "Finish entering values to solve for the missing side.",
        mistake: "Incomplete input.",
        insight: `Ensure you enter two values to calculate the third.`
      };
    }

    if (topic === 'Area of a Rectangle' && state.area !== undefined) {
      const { length, width, area } = state as any;
      if (area === 0) {
        return { instruction: "Drag the corner node to create a rectangle.", mistake: "No shape drawn.", insight: "Area is space inside a 2D shape." };
      }
      return { 
        instruction: "Try changing the values manually or drag the node.", 
        mistake: "No mistake.", 
        insight: `Area = Length × Width. Current: ${length.toFixed(1)} × ${width.toFixed(1)} = ${area.toFixed(1)}.` 
      };
    }

    return {
      instruction: "There are no specific dynamic interactions required right now.",
      mistake: "No active mistakes detected.",
      insight: `Currently reviewing ${topic}. The foundational definitions and rules apply universally.`
    };
  }
}
