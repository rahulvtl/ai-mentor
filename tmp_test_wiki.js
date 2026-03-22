const fetch = require('node-fetch');

async function testWiki() {
  const query = "Pythagoras Theorem";
  const searchParams = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    utf8: '',
    format: 'json',
    origin: '*'
  });

  try {
    const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams.toString()}`);
    const searchData = await searchRes.json();
    console.log("Search Results length:", searchData.query?.search?.length);
    
    if (searchData.query?.search?.length > 0) {
      const title = searchData.query.search[0].title;
      console.log("Top Title:", title);
      
      const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      const data = await summaryRes.json();
      console.log("Type:", data.type);
      console.log("Extract:", data.extract ? data.extract.substring(0, 100) : null);
      console.log("Image:", data.thumbnail?.source);
    }
  } catch(e) { console.error(e) }
}

testWiki();
