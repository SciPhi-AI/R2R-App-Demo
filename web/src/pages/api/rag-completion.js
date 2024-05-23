import url from "url";
import { R2RClient } from "../../r2r-js-client/r2rClient";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  const queryObject = url.parse(req.url, true).query;
  const client = new R2RClient(queryObject.apiUrl);
  const message = queryObject.query;
  const searchFilters = queryObject.searchFilters
    ? JSON.parse(queryObject.searchFilters)
    : {};
  searchFilters["user_id"] = queryObject.user_id;
  const searchLimit = queryObject.searchLimit
    ? parseInt(queryObject.searchLimit)
    : 10;
  const generationConfig = queryObject.generationConfig
    ? JSON.parse(queryObject.generationConfig)
    : {};
  const streaming = true;

  try {
    if (streaming) {
      const responseStream = await client.rag(
        message,
        searchFilters,
        searchLimit,
        generationConfig,
        streaming,
      );

      const readableStream = new ReadableStream({
        async start(controller) {
          const reader = responseStream.getReader();

          try {
            while (true) {
              const { value, done } = await reader.read();
              console.log("streaming value = ", value);
              if (done) break;
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const response = await client.rag(
        message,
        searchFilters,
        searchLimit,
        generationConfig,
        streaming,
      );
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching data", error);
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
