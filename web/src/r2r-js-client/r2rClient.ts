import { v4 as uuidv4, v5 as uuidv5 } from "uuid";

type Metadata = Record<string, any>;

export class R2RClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request(url: string, method: string, data: any, headers: Record<string, string> = {}): Promise<any> {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": method === "POST" ? "application/json" : undefined,
        ...headers,
      },
      body: method === "GET" ? undefined : JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.json()["detail"];
      console.log('errorText = ', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async ingestDocuments(documents: Metadata[]): Promise<any> {
    const url = `${this.baseUrl}/ingest_documents/`;
    const data = { documents };
    return this.request(url, "POST", data);
  }

  async ingestFiles(metadatas: Metadata[], files: File[], ids?: string[]): Promise<any> {
    const url = `${this.baseUrl}/ingest_files/`;
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("metadatas", JSON.stringify(metadatas));

    if (!ids || ids.length === 0) {
      formData.append("ids", "null");
    } else {
      formData.append("ids", JSON.stringify(ids));
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorJson = await response.json();
      console.log('errorText = ', errorJson);
      throw new Error(`${errorJson['detail']}`);
    }

    return response.json();
  }

  async getUserDocumentData(userId: string): Promise<any> {
    const url = `${this.baseUrl}/get_user_document_data/`;
    const data = { user_id: userId };
    return this.request(url, "POST", data);
  }

  async search(query: string, searchFilters: Metadata = {}, searchLimit: number = 10): Promise<any> {
    const url = `${this.baseUrl}/search/`;
    const data = {
      query,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
    };
    return this.request(url, "POST", data);
  }

  async rag(
    message: string,
    searchFilters: Metadata = {},
    searchLimit: number = 10,
    generationConfig: Metadata = {},
    streaming: boolean = false,
  ): Promise<any> {
    const url = `${this.baseUrl}/rag/`;
    const data = {
      message,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
      streaming,
      generation_config: JSON.stringify(generationConfig),
    };

    if (streaming) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('errorText = ', errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                break;
              }
              controller.enqueue(value);
            }
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return stream;
    } else {
      return this.request(url, "POST", data);
    }
  }

  async delete(key: string, value: string): Promise<any> {
    const url = `${this.baseUrl}/delete/`;
    const data = { key, value };
    return this.request(url, "DELETE", data);
  }

  async getUserIds(): Promise<any> {
    const url = `${this.baseUrl}/get_user_ids/`;
    return this.request(url, "GET", {});
  }

  async getLogs(pipelineType?: string, filter?: string): Promise<any> {
    const url = `${this.baseUrl}/get_logs/`;
    const data = { pipeline_type: pipelineType, filter };
    const logs = await this.request(url, "POST", data);

    return this.parseLogs(logs);
  }

  private parseLogs(logs: any): any {
    return logs.results.map((run: any) => {
      const parsedEntries = run.entries.map((entry: any) => {
        let parsedValue;
        try {
          parsedValue = JSON.parse(entry.value);
        } catch (e) {
          parsedValue = entry.value;
        }

        if (entry.key === "search_results" && Array.isArray(parsedValue)) {
          parsedValue = parsedValue.map((result: any) => {
            let parsedResult;
            try {
              parsedResult = JSON.parse(result);
            } catch (e) {
              parsedResult = result;
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

  generateRunId(): string {
    return uuidv4();
  }

  generateIdFromLabel(label: string): string {
    const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    return uuidv5(label, NAMESPACE_DNS);
  }
}
