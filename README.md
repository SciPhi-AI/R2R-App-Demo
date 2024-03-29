# RAG Pipeline Web Application  

This repository contains a web application that interacts with a deployed RAG (Retrieval Augmented Generation) pipeline built using the R2R framework and the SciPhi cloud platform. The web application allows users to upload documents, submit queries, and receive AI-generated answers based on the uploaded documents.

## Prerequisites

Before using the web application, ensure that you have deployed the RAG pipeline using the [R2R-basic-rag-template](https://github.com/SciPhi-AI/R2R-basic-rag-template) repository. Follow the instructions in the template's README to set up and configure the pipeline.

## Features

- User-specific document management: Each user has their own set of uploaded documents.
- Document upload: Users can upload documents through the application interface.
- Query submission: Users can submit queries based on their uploaded documents.
- AI-generated answers: The application communicates with the deployed RAG pipeline to process the uploaded documents and generate answers to user queries.
- Source citations: The generated answers include citations to the relevant documents used to derive the answer.
- Responsive design: The application is designed to be responsive and work well on different screen sizes.

## Installation

1. Clone this repository:

   ```
   git clone git@github.com:SciPhi-AI/APP-basic-rag-template.git
   ```

2. Navigate to the project directory:

   ```
   cd web
   ```

3. Install the dependencies using pnpm:

   ```
   pnpm install
   ```

## Usage

1. Start the development server:

   ```
   pnpm dev
   ```

   This will start the application in development mode and open it in your default browser.

2. Open the application in your browser at `http://localhost:3000`.

3. Enter the URL of your deployed RAG pipeline in the "API URL" input box at the top of the page.

4. Upload documents using the "Upload File" button in the sidebar.

5. Submit queries using the search input at the bottom of the main content area.

6. View the generated answers and source citations in the main content area.

7. Build the server:

   ```
   pnpm build
   ```
