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
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
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

    // Check if ids is not provided or is an empty array, set it to null
    if (!ids || ids.length === 0) {
      formData.append("ids", "null"); // Append the string "null" to ensure it is sent correctly
    } else {
      formData.append("ids", JSON.stringify(ids));
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
        throw new Error("Network response was not ok");
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
          parsedValue = entry.value; // Keep as string if JSON parsing fails
        }

        // Format search results if present
        if (entry.key === "search_results" && Array.isArray(parsedValue)) {
          parsedValue = parsedValue.map((result: any) => {
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

  generateRunId(): string {
    return uuidv4();
  }

  generateIdFromLabel(label: string): string {
    const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    return uuidv5(label, NAMESPACE_DNS);
  }
}

// import { v4 as uuidv4, v5 as uuidv5 } from "uuid";

// export class R2RClient {
//   baseUrl: string;

//   constructor(baseUrl) {
//     this.baseUrl = baseUrl;
//   }

//   async request(url, method, data, headers = {}) {
//     const response = await fetch(url, {
//       method,
//       headers: {
//         "Content-Type": "application/json",
//         ...headers,
//       },
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     return response.json();
//   }

//   async ingestDocuments(documents) {
//     const url = `${this.baseUrl}/ingest_documents/`;
//     const data = { documents };
//     return this.request(url, "POST", data);
//   }

//   async ingestFiles(metadatas, files, ids = null) {
//     const url = `${this.baseUrl}/ingest_files/`;
//     const formData = new FormData();
  
//     files.forEach((file) => {
//       formData.append("files", file);
//     });
  
//     formData.append("metadatas", JSON.stringify(metadatas));
  
//     // Check if ids is not provided or is an empty array, set it to null
//     if (!ids || ids.length === 0) {
//       formData.append("ids", null);
//     } else {
//       formData.append("ids", JSON.stringify(ids));
//     }
  
//     const response = await fetch(url, {
//       method: "POST",
//       body: formData,
//     });
  
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
  
//     return response.json();
//   }
  
//   async getUserDocumentData(userId) {
//     const url = `${this.baseUrl}/get_user_document_data/`;
//     const data = { user_id: userId };
//     return this.request(url, "POST", data);
//   }

//   async search(query, searchFilters = {}, searchLimit = 10) {
//     const url = `${this.baseUrl}/search/`;
//     const data = {
//       query,
//       search_filters: JSON.stringify(searchFilters),
//       search_limit: searchLimit,
//     };
//     return this.request(url, "POST", data);
//   }

//   async rag(message, searchFilters = {}, searchLimit = 10, generationConfig = {}, streaming = false) {
//     const url = `${this.baseUrl}/rag/`;
//     const data = {
//       message,
//       search_filters: JSON.stringify(searchFilters),
//       search_limit: searchLimit,
//       streaming,
//       generation_config: JSON.stringify(generationConfig),
//     };

//     if (streaming) {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const reader = response.body?.getReader();
//       const stream = new ReadableStream({
//         async start(controller) {
//           try {
//             while (true) {
//               const { done, value } = await reader.read();
//               if (done) {
//                 controller.close();
//                 break;
//               }
//               controller.enqueue(value);
//             }
//           } catch (error) {
//             controller.error(error);
//           }
//         },
//       });

//       return stream;
//     } else {
//       return this.request(url, "POST", data);
//     }
//   }

//   async delete(key, value) {
//     const url = `${this.baseUrl}/delete/`;
//     const data = { key, value };
//     return this.request(url, "DELETE", data);
//   }

//   async getUserIds() {
//     const url = `${this.baseUrl}/get_user_ids/`;
//     const response = await fetch(url, {
//       method: "GET",
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     return response.json();
//   }

//   async getLogs(pipelineType = null, filter = null) {
//     const url = `${this.baseUrl}/get_logs/`;
//     const data = { pipeline_type: pipelineType, filter };
//     const logs = await this.request(url, "POST", data);

//     return this.parseLogs(logs);
//   }

//   parseLogs(logs) {
//     return logs.results.map((run) => {
//       const parsedEntries = run.entries.map((entry) => {
//         let parsedValue;
//         try {
//           parsedValue = JSON.parse(entry.value);
//         } catch (e) {
//           parsedValue = entry.value; // Keep as string if JSON parsing fails
//         }

//         // Format search results if present
//         if (entry.key === "search_results" && Array.isArray(parsedValue)) {
//           parsedValue = parsedValue.map((result) => {
//             let parsedResult;
//             try {
//               parsedResult = JSON.parse(result);
//             } catch (e) {
//               parsedResult = result; // Keep as string if JSON parsing fails
//             }
//             return parsedResult;
//           });
//         }

//         return { key: entry.key, value: parsedValue };
//       });
//       return {
//         run_id: run.run_id,
//         run_type: run.run_type,
//         entries: parsedEntries,
//       };
//     });
//   }

//   generateRunId() {
//     return uuidv4();
//   }

//   generateIdFromLabel(label) {
//     const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
//     return uuidv5(label, NAMESPACE_DNS);
//   }
// }


// // import { v4 as uuidv4, v5 as uuidv5 } from "uuid";

// // export class R2RClient {
// //   private baseUrl: string;

// //   constructor(baseUrl: string) {
// //     this.baseUrl = baseUrl;
// //   }

// //   async ingestDocuments(documents: Record<string, any>[]): Promise<any> {
// //     const url = `${this.baseUrl}/ingest_documents/`;
// //     const data = { documents };
// //     const response = await fetch(url, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(data),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async ingestFiles(
// //     metadatas: Record<string, any>[],
// //     files: File[],
// //     ids: string[] = [],
// //   ): Promise<any> {
// //     const url = `${this.baseUrl}/ingest_files/`;
// //     const formData = new FormData();

// //     files.forEach((file) => {
// //       formData.append("files", file);
// //     });

// //     formData.append("metadatas", JSON.stringify(metadatas));
// //     formData.append("ids", JSON.stringify(ids));

// //     const response = await fetch(url, {
// //       method: "POST",
// //       body: formData,
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async getUserDocumentData(userId: string): Promise<any> {
// //     const url = `${this.baseUrl}/get_user_document_data/`;
// //     const data = { user_id: userId };
// //     const response = await fetch(url, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(data),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async search(
// //     query: string,
// //     searchFilters: Record<string, any> = {},
// //     searchLimit: number = 10,
// //   ): Promise<any> {
// //     const url = `${this.baseUrl}/search/`;
// //     const data = {
// //       query,
// //       search_filters: JSON.stringify(searchFilters),
// //       search_limit: searchLimit,
// //     };
// //     const response = await fetch(url, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(data),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async rag(
// //     message: string,
// //     searchFilters: Record<string, any> = {},
// //     searchLimit: number = 10,
// //     generationConfig: Record<string, any> = {},
// //     streaming: boolean = false,
// //   ): Promise<any> {
// //     const url = `${this.baseUrl}/rag/`;
// //     const data = {
// //       message,
// //       search_filters: JSON.stringify(searchFilters),
// //       search_limit: searchLimit,
// //       streaming,
// //       generation_config: JSON.stringify(generationConfig),
// //     };

// //     console.log("fetching....");
// //     if (streaming) {
// //       console.log("waiting for response...");
// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(data),
// //       });
// //       console.log("response = ", response);

// //       if (!response.ok) {
// //         console.log("response = ", response);
// //         throw new Error("Network response was not ok");
// //       }

// //       const reader = response.body?.getReader();
// //       const stream = new ReadableStream({
// //         async start(controller) {
// //           try {
// //             while (true) {
// //               const { done, value } = await reader.read();
// //               if (done) {
// //                 controller.close();
// //                 break;
// //               }
// //               controller.enqueue(value);
// //             }
// //           } catch (error) {
// //             controller.error(error);
// //           }
// //         },
// //       });

// //       return stream;
// //     } else {
// //       const response = await fetch(url, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(data),
// //       });

// //       if (!response.ok) {
// //         throw new Error("Network response was not ok");
// //       }

// //       return response.json();
// //     }
// //   }

// //   async delete(key: string, value: string): Promise<any> {
// //     const url = `${this.baseUrl}/delete/`;
// //     const data = { key, value };
// //     const response = await fetch(url, {
// //       method: "DELETE",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(data),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async getUserIds(): Promise<any> {
// //     const url = `${this.baseUrl}/get_user_ids/`;
// //     const response = await fetch(url, {
// //       method: "GET",
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     return response.json();
// //   }

// //   async getLogs(pipelineType?: string, filter?: string): Promise<any> {
// //     const url = `${this.baseUrl}/get_logs/`;
// //     const data = { pipeline_type: pipelineType, filter };
// //     const response = await fetch(url, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify(data),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Network response was not ok");
// //     }

// //     const logs = await response.json();

// //     function parseLogs(logs) {
// //       return logs.results.map((run) => {
// //         const parsedEntries = run.entries.map((entry) => {
// //           let parsedValue;
// //           try {
// //             parsedValue = JSON.parse(entry.value);
// //           } catch (e) {
// //             parsedValue = entry.value; // Keep as string if JSON parsing fails
// //           }

// //           // Format search results if present
// //           if (entry.key === "search_results" && Array.isArray(parsedValue)) {
// //             parsedValue = parsedValue.map((result) => {
// //               let parsedResult;
// //               try {
// //                 parsedResult = JSON.parse(result);
// //               } catch (e) {
// //                 parsedResult = result; // Keep as string if JSON parsing fails
// //               }
// //               return parsedResult;
// //             });
// //           }

// //           return { key: entry.key, value: parsedValue };
// //         });
// //         return {
// //           run_id: run.run_id,
// //           run_type: run.run_type,
// //           entries: parsedEntries,
// //         };
// //       });
// //     }

// //     return parseLogs(logs);
// //   }

// //   generateRunId() {
// //     return uuidv4();
// //   }

// //   generateIdFromLabel(label: string) {
// //     const NAMESPACE_DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
// //     return uuidv5(label, NAMESPACE_DNS);
// //   }
// // }