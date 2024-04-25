import url from "url";

export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  const queryObject = url.parse(req.url, true).query;

  const jsonData = {
    message: queryObject.query,
    filters: {
      user_id: queryObject.userId
    },
    settings: {},
    generation_config: { "stream": true },
  };

  try {
    const externalApiResponse = await fetch(`${queryObject.apiUrl}/rag_completion/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify(jsonData)
    });

    const readableStream = externalApiResponse.body;

    const readable = new ReadableStream({
      async start(controller) {
        const reader = readableStream.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          controller.enqueue(value);
        }

        controller.close();
      }
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.error('Error fetching data', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}