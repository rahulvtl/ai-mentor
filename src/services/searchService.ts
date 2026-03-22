export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

/**
 * Fetches instant answers from DuckDuckGo — completely free, no API key needed.
 * Returns related topics as reference cards when Wikipedia has no content.
 */
export async function duckDuckGoSearch(query: string): Promise<SearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      no_redirect: '1',
      no_html: '1',
      skip_disambig: '1',
    });

    const res = await fetch(
      `https://api.duckduckgo.com/?${params}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const results: SearchResult[] = [];

    // Abstract (main instant answer)
    if (data.Abstract && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        description: data.Abstract,
      });
    }

    // Related topics
    if (Array.isArray(data.RelatedTopics)) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= 5) break;

        // Some entries are sub-groups with a Topics array
        if (topic.Topics) {
          for (const sub of topic.Topics) {
            if (results.length >= 5) break;
            if (sub.Text && sub.FirstURL) {
              results.push({
                title: sub.Text.split(' - ')[0] ?? sub.Text,
                url: sub.FirstURL,
                description: sub.Text,
              });
            }
          }
        } else if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] ?? topic.Text,
            url: topic.FirstURL,
            description: topic.Text,
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}
