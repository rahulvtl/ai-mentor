async function testWiki() {
  const query = "Pythagoras Theorem";
  try {
    const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = await summaryRes.json();
    console.log("Title:", data.title);
    console.log("Url:", data.content_urls?.desktop?.page);
  } catch(e) { console.error(e) }
}
testWiki();
