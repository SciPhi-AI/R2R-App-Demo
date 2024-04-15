declare module 'r2r-js' {
    export class R2RClient {
      constructor(baseUrl: string);
      uploadAndProcessFile(documentId: string, filePath: string, metadata: object): Promise<any>;
      search(query: string, maxResults: number): Promise<any>;
      ragCompletion(query: string, maxResults: number): Promise<any>;
      streamingRequest(
        endpoint: string,
        data: object,
        onData: (type: string, value: string) => void,
        onError?: (status: number) => void
      ): Promise<void>;
    }
    export const SEARCH_START_TOKEN: string;
    export const SEARCH_END_TOKEN: string;
    export const LLM_START_TOKEN: string;
    export const LLM_END_TOKEN: string;
}