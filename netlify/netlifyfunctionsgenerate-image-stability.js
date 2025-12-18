// ==========================================
// FICHIER 1: netlify/functions/generate-titles.js
// ==========================================

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { genre, style, description } = JSON.parse(event.body);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Generate 6 creative titles for a book in the "${genre}" genre with a "${style}" style. Description: "${description}". Return only the titles, one per line.`
        }],
        max_tokens: 200,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const titles = data.choices[0].message.content.split('\n').filter(t => t.trim());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ titles })
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur génération titres: ' + error.message })
    };
  }
};


// ==========================================
// FICHIER 2: netlify/functions/generate-image-openai.js
// ==========================================

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { prompt, style, genre } = JSON.parse(event.body);
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional book cover design for ${genre} genre, ${style} style, portrait orientation: ${prompt}`,
        n: 1,
        size: '1024x1792',
        quality: 'standard'
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        image_url: data.data[0].url,
        platform: 'OpenAI DALL-E 3'
      })
    };
  } catch (error) {
    console.error('OpenAI Image API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur OpenAI: ' + error.message })
    };
  }
};


// ==========================================
// FICHIER 3: netlify/functions/generate-image-leonardo.js
// ==========================================

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { prompt, style, genre } = JSON.parse(event.body);
    
    // Étape 1: Lancer la génération
    const genResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `Book cover design, ${genre} genre, ${style} style: ${prompt}`,
        modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
        width: 832,
        height: 1472,
        num_images: 1
      })
    });

    const genData = await genResponse.json();
    
    if (genData.error) {
      throw new Error(genData.error);
    }
    
    const generationId = genData.sdGenerationJob.generationId;
    
    // Étape 2: Attendre et récupérer le résultat
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!imageUrl && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3 secondes
      
      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.generations_by_pk?.generated_images?.length > 0) {
        imageUrl = statusData.generations_by_pk.generated_images[0].url;
        break;
      }
      
      attempts++;
    }
    
    if (!imageUrl) {
      throw new Error('Timeout: Image non générée après 60 secondes');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        image_url: imageUrl,
        platform: 'Leonardo.ai'
      })
    };
  } catch (error) {
    console.error('Leonardo API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur Leonardo: ' + error.message })
    };
  }
};


// ==========================================
// FICHIER 4: netlify/functions/generate-image-stability.js
// ==========================================

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { prompt, style, genre } = JSON.parse(event.body);
    
    // Utiliser l'API v1 qui accepte JSON au lieu de FormData
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{
          text: `Professional book cover for ${genre}, ${style} style: ${prompt}`,
          weight: 1
        }],
        cfg_scale: 7,
        height: 1536,
        width: 1024,
        steps: 30,
        samples: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.artifacts && data.artifacts.length > 0) {
      const base64Image = data.artifacts[0].base64;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          image_url: `data:image/png;base64,${base64Image}`,
          platform: 'Stability AI'
        })
      };
    } else {
      throw new Error('Aucune image générée par Stability AI');
    }
    
  } catch (error) {
    console.error('Stability AI Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur Stability: ' + error.message })
    };
  }
};
