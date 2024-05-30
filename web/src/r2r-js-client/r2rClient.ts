import { v4 as uuidv4, v5 as uuidv5 } from "uuid";

export class R2RClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async ingestDocuments(documents: Record<string, any>[]): Promise<any> {
    const url = `${this.baseUrl}/ingest_documents/`;
    const data = { documents };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async ingestFiles(
    metadatas: Record<string, any>[],
    files: File[],
    ids?: string[] | null,
  ): Promise<any> {
    const url = `${this.baseUrl}/ingest_files/`;
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("metadatas", JSON.stringify(metadatas));

    if (ids !== undefined && ids !== null) {
      formData.append("ids", JSON.stringify(ids));
    } else {
      formData.append("ids", JSON.stringify(null));
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async getUserDocumentData(userId: string): Promise<any> {
    const url = `${this.baseUrl}/get_user_document_data/`;
    const data = { user_id: userId };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async search(
    query: string,
    searchFilters: Record<string, any> = {},
    searchLimit: number = 10,
  ): Promise<any> {
    const url = `${this.baseUrl}/search/`;
    const data = {
      query,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async rag(
    message: string,
    searchFilters: Record<string, any> = {},
    searchLimit: number = 10,
    generationConfig: Record<string, any> = {},
    streaming: boolean = false,
  ): Promise<any> {
    const url = `${this.baseUrl}/rag/`;
    const data = {
      message,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
      streaming,
      rag_generation_config: JSON.stringify(generationConfig),
    };
    console.log("generationConfig = ", generationConfig);
    console.log("data = ", data);
    if (streaming) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              if (reader) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.close();
                  break;
                }
                controller.enqueue(value);
              }
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return stream;
    } else {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    }
  }

  async delete(key: string, value: string): Promise<any> {
    const url = `${this.baseUrl}/delete/`;
    const data = { key, value };
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async getUserIds(): Promise<any> {
    const url = `${this.baseUrl}/get_user_ids/`;
    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  async getLogs(pipelineType?: string, filter?: string): Promise<any> {
    const url = `${this.baseUrl}/get_logs/`;
    const data = { pipeline_type: pipelineType, filter };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const logs = await response.json();

    function parseLogs(logs) {
      return logs.results.map((run) => {
        const parsedEntries = run.entries.map((entry) => {
          let parsedValue;
          try {
            parsedValue = JSON.parse(entry.value);
          } catch (e) {
            parsedValue = entry.value; // Keep as string if JSON parsing fails
          }

          // Format search results if present
          if (entry.key === "search_results" && Array.isArray(parsedValue)) {
            parsedValue = parsedValue.map((result) => {
              let parsedResult;
              try {
                parsedResult = JSON.parse(result);
              } catch (e) {
                parsedResult = result; // Keep as string if JSON parsing fails
              }
              return parsedResult;
            });
          }

          return { key: entry.key, value: parsedValue };
        });
        return {
          run_id: run.run_id,
          run_type: run.run_type,
          entries: parsedEntries,
        };
      });
    }

    return parseLogs(logs);
  }

  
  async getAnalytics(): Promise<any> {
    const url = `${this.baseUrl}/analytics/`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  }

  generateRunId() {
    return uuidv4();
  }

  generateIdFromLabel(label: string) {
    const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    return uuidv5(label, NAMESPACE_DNS);
  }
}
