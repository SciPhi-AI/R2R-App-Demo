import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import axios, { AxiosResponse } from 'axios';
//@ts-ignore
import FormData from 'form-data';

export class R2RClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async ingestDocuments(documents: Record<string, any>[]): Promise<any> {
    const url = `${this.baseUrl}/ingest_documents/`;
    const response: AxiosResponse = await axios.post(url, documents);
    return response.data;
  }

  async ingestFiles(
    metadatas: Record<string, any>[],
    files: File[],
    ids: string[] = []
  ): Promise<any> {
    const url = `${this.baseUrl}/ingest_files/`;
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });
    console.log(' metadatas = ', metadatas)
    console.log("sending metadata = ", metadatas)
    formData.append('metadatas', JSON.stringify(metadatas));
    formData.append('ids', JSON.stringify(ids));

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const response: AxiosResponse = await axios.post(url, formData, config);
    return response.data;
  }

  async getUserDocumentIds(userId: string): Promise<any> {
    const url = `${this.baseUrl}/get_user_document_data/`;
    const data = { user_id: userId };
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response: AxiosResponse = await axios.post(url, data, config);
    return response.data;
  }

  async search(
    query: string,
    searchFilters: Record<string, any> = {},
    searchLimit: number = 10
  ): Promise<any> {
    const url = `${this.baseUrl}/search/`;
    const data = {
      query,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
    };
    const response: AxiosResponse = await axios.post(url, data);
    return response.data;
  }


  async rag(
    query: string,
    searchFilters: Record<string, any> = {},
    searchLimit: number = 10,
    generationConfig: Record<string, any> = {},
    streaming: boolean = false
  ): Promise<Response> {
    const url = `${this.baseUrl}/rag/`;
    const data = {
      query,
      search_filters: JSON.stringify(searchFilters),
      search_limit: searchLimit,
      streaming,
      generation_config: JSON.stringify(generationConfig),
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response;
  }

  // async rag(
  //   query: string,
  //   searchFilters: Record<string, any> = {},
  //   searchLimit: number = 10,
  //   generationConfig: Record<string, any> = {},
  //   streaming: boolean = false
  // ): Promise<any> {
  //   const url = `${this.baseUrl}/rag/`;
  //   const data = {
  //     query,
  //     search_filters: JSON.stringify(searchFilters),
  //     search_limit: searchLimit,
  //     streaming,
  //     generation_config: JSON.stringify(generationConfig),
  //   };
  //   const response: AxiosResponse = await axios.post(url, data);
  //   return response.data;
  // }

  async delete(key: string, value: string): Promise<any> {
    const url = `${this.baseUrl}/delete/`;
    const data = { key, value };
    const response: AxiosResponse = await axios.delete(url, { data });
    return response.data;
  }

  async getUserIds(): Promise<any> {
    const url = `${this.baseUrl}/get_user_ids/`;
    const response: AxiosResponse = await axios.get(url);
    return response.data;
  }

  async getLogs(pipelineType?: string): Promise<any> {
    const url = `${this.baseUrl}/get_logs/`;
    const data = {"pipeline_type": pipelineType};
    console.log('data = ', data)
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response: AxiosResponse = await axios.post(url, data, config);

    function parseLogs(logs) {
      return logs.results.map(run => {
        const parsedEntries = run.entries.map(entry => {
          let parsedValue;
          try {
            parsedValue = JSON.parse(entry.value);
          } catch (e) {
            parsedValue = entry.value;  // Keep as string if JSON parsing fails
          }

          // Format search results if present
          if (entry.key === 'search_results' && Array.isArray(parsedValue)) {
            parsedValue = parsedValue.map(result => {
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
          entries: parsedEntries
        };
      });
    }
    
    return parseLogs(response.data);
  }
  
  generateRunId() {
    return uuidv4();
  }

  generateIdFromLabel(label) {
    const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    return uuidv5(label, NAMESPACE_DNS);
  }
}
