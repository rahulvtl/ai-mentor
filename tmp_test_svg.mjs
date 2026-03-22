async function testWiki() {
  const query = "SVG";
  try {
    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await summaryRes.json();
    console.log("Title:", data.title);
    console.log("Extract:", data.extract ? data.extract.substring(0, 100) : "EMPTY");
    console.log("Image:", data.thumbnail?.source);
  } catch(e) { console.error(e) }
}
testWiki();
