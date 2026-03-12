export async function onRequest(context) {
  console.log('Function tmdb chiamata');
  
  const API_KEY = context.env.TMDB_SECRET_KEY;

  if (!API_KEY) {
    console.log('API KEY mancante!');
    return new Response(JSON.stringify({ error: "Chiave TMDB mancante nel server" }), { status: 500 });
  }

  console.log('API KEY presente, procedo...');

  const { searchParams } = new URL(context.request.url);
  const action = searchParams.get("action");
  const query = searchParams.get("query");
  const lang = searchParams.get("lang");
  const media_type = searchParams.get("media_type");
  const id = searchParams.get("id");

  let url = "";

  if (action === "search") {
    url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${lang}`;
  } else if (action === "details") {
    url = `https://api.themoviedb.org/3/${media_type}/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=credits`;
  } else {
    return new Response(JSON.stringify({ error: "Azione non valida" }), { status: 400 });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.log('Errore fetch TMDB:', error);
    return new Response(JSON.stringify({ error: "Errore di comunicazione con TMDB" }), { status: 500 });
  }
}
