import Document, { Html, Head, Main, NextScript } from "next/document";

class AppDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charset="UTF-8" />
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AppDocument;
