import React, { useState } from "react";
import { uploadDocument } from "../services/api";
import axios from "axios";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nestedVisible, setNestedVisible] = useState({});

  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (text) => text.toUpperCase());
  };

  const getValueClass = (value) => {
    if (value === null || value === "") return "muted";
    return "";
  };

  const toggleNested = (key) => {
    setNestedVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderValue = (key, value) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="muted">Not Available</span>;
      }

      return (
        <div className="nested-block">
          <button
            type="button"
            className="nested-toggle"
            onClick={() => toggleNested(key)}
          >
            {nestedVisible[key] ? "▼" : "▶"} {formatKey(key)} ({value.length} items)
          </button>
          {nestedVisible[key] && (
            <div className="nested-content">
              {value.map((item, index) => (
                <div key={index} className="array-item">
                  {typeof item === "object" && item !== null ? (
                    <div className="mini-grid">
                      {Object.entries(item).map(([subKey, subValue]) => (
                        <div key={subKey} className="mini-row">
                          <span className="mini-key">{formatKey(subKey)}</span>
                          <span className={`mini-value ${getValueClass(subValue)}`}>
                            {typeof subValue === "object"
                              ? JSON.stringify(subValue)
                              : subValue || "Not Available"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>{item}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const isNested =
      typeof value === "object" && value !== null && !Array.isArray(value);

    if (isNested) {
      return (
        <div className="nested-block">
          <button
            type="button"
            className="nested-toggle"
            onClick={() => toggleNested(key)}
          >
            {nestedVisible[key] ? "▼" : "▶"} {formatKey(key)}
          </button>
          {nestedVisible[key] && (
            <div className="nested-content">
              <div className="data-table compact">
                {Object.entries(value).map(([subKey, subValue]) => (
                  <div key={subKey} className="data-row">
                    <div className="data-key">{formatKey(subKey)}</div>
                    <div className="data-value">
                      {renderValue(`${key}_${subKey}`, subValue)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return value !== null && value !== "" ? (
      String(value)
    ) : (
      <span className="muted">Not Available</span>
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile || null);
    setError("");
    setSuccess("");

    if (selectedFile) {
      setExtractedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document before extraction.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await uploadDocument(file);

      if (response.data?.download_url) {
        const fileResponse = await axios.get(
          `https://rinseinfo.onrender.com${response.data.download_url}`,
          { responseType: "blob" },
        );

        const url = window.URL.createObjectURL(new Blob([fileResponse.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "extracted_details.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      if (response.data?.data) {
        setExtractedData(response.data.data);
        setSuccess("Extraction complete. Results are ready below.");
      }
    } catch (err) {
      setError("Upload failed. Please try again with a supported file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dataEntries = extractedData ? Object.entries(extractedData) : [];

  return (
    <section className="uploader-card">
      <div className="card-top">
        <h2>Extract Document Details</h2>
        <p>
          Supports PDF, DOCX and image files. Upload once and get structured
          output instantly.
        </p>
      </div>

      <div className="upload-controls">
        <label className="file-drop-zone" htmlFor="document-input">
          <span className="zone-title">Choose a file to process</span>
          <span className="zone-subtitle">
            {file ? file.name : "No file selected yet"}
          </span>
          <input
            id="document-input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.tiff,.bmp"
          />
        </label>

        <button className="upload-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </div>

      {(error || success) && (
        <div className="status-stack">
          {error && <div className="status error">{error}</div>}
          {success && <div className="status success">{success}</div>}
        </div>
      )}

      {extractedData && (
        <div className="results-panel">
          <div className="results-header">
            <h3>Extraction Results</h3>
            <span>{dataEntries.length} fields detected</span>
          </div>

          <div className="data-table">
            {dataEntries.map(([key, value]) => (
              <div key={key} className="data-row">
                <div className="data-key">{formatKey(key)}</div>
                <div className="data-value">{renderValue(key, value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FileUploader;
