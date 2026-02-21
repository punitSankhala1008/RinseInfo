import React from "react";
import FileUploader from "./components/FileUploader";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-tag">AI Powered Document Intelligence</p>
        <h1>DocuSense Extractor</h1>
        <p className="app-subtitle">
          Upload your document and extract structured details in seconds with a
          clean, export-ready output.
        </p>
      </header>

      <main className="app-main">
        <FileUploader />
      </main>

      <footer className="app-footer">
        Built for fast and reliable detail extraction workflows.
      </footer>
    </div>
  );
}

export default App;
