exports.handler = async function(event, context) {
  // Questa variabile viene presa in automatico dalla cassaforte di Netlify che hai impostato
  const API_KEY = process.env.TMDB_SECRET_KEY;
  
  if (!API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Chiave TMDB mancante nel server" }) };
  }

  // Leggiamo i parametri inviati dall'app (azione, query, lingua, ecc.)
  const { action, query, lang, media_type, id } = event.queryStringParameters;

  let url = "";
  
  // Scegliamo l'indirizzo a cui chiedere i dati in base a quello che ci serve
  if (action === "search") {
     url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${lang}`;
  } else if (action === "details") {
     url = `https://api.themoviedb.org/3/${media_type}/${id}?api_key=${API_KEY}&language=${lang}&append_to_response=credits`;
  } else {
     return { statusCode: 400, body: JSON.stringify({ error: "Azione non valida" }) };
  }

  try {
    // Il server di Netlify interroga TMDB e restituisce i dati puliti all'app
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Errore di comunicazione con TMDB" }) };
  }
}
