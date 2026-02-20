import React, { useState } from "react";
import { uploadDocument } from "../services/api";
import axios from "axios";

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const [nestedVisible, setNestedVisible] = useState({});

  const toggleNested = (key) => {
    setNestedVisible((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderValue = (key, value) => {
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <i>Not Available</i>;
      }
      return (
        <>
          <span
            onClick={() => toggleNested(key)}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            {nestedVisible[key] ? "▼" : "▶"} {key} (Array - {value.length}{" "}
            items)
          </span>
          {nestedVisible[key] && (
            <div style={{ marginTop: "8px", marginLeft: "1.5rem" }}>
              {value.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "8px",
                    padding: "4px",
                    border: "1px solid #ddd",
                  }}
                >
                  {typeof item === "object" && item !== null ? (
                    <table
                      border="1"
                      cellPadding="4"
                      style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        fontSize: "0.9em",
                      }}
                    >
                      <tbody>
                        {Object.entries(item).map(([subKey, subValue]) => (
                          <tr key={subKey}>
                            <td style={{ fontWeight: "bold", width: "30%" }}>
                              {subKey}
                            </td>
                            <td>
                              {typeof subValue === "object"
                                ? JSON.stringify(subValue)
                                : subValue || <i>Not Available</i>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <span>{item}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    // Handle nested objects
    const isNested =
      typeof value === "object" && value !== null && !Array.isArray(value);

    if (isNested) {
      return (
        <>
          <span
            onClick={() => toggleNested(key)}
            style={{ cursor: "pointer", color: "#007bff" }}
          >
            {nestedVisible[key] ? "▼" : "▶"} {key}
          </span>
          {nestedVisible[key] && (
            <table
              border="1"
              cellPadding="8"
              style={{
                borderCollapse: "collapse",
                marginTop: "8px",
                marginLeft: "1.5rem",
                width: "95%",
              }}
            >
              <tbody>
                {Object.entries(value).map(([subKey, subValue]) => (
                  <tr key={subKey}>
                    <td style={{ fontWeight: "bold", width: "30%" }}>
                      {subKey}
                    </td>
                    <td>{renderValue(`${key}_${subKey}`, subValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    }

    // Handle primitive values
    return value !== null && value !== "" ? (
      String(value)
    ) : (
      <i>Not Available</i>
    );
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a File");

    setLoading(true);

    try {
      const response = await uploadDocument(file);

      if (response.data?.download_url) {
        const fileResponse = await axios.get(
          `http://localhost:8000${response.data.download_url}`,
          { responseType: "blob" }
        );

        const url = window.URL.createObjectURL(new Blob([fileResponse.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "extracted_details.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      if (response.data?.data) {
        setExtractedData(response.data.data);
      }
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploader">
      <h2>📄 Document Detail Extractor</h2>
      <input type="file" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload & Extract"}
      </button>

      {extractedData && (
        <div style={{ textAlign: "left", marginTop: "1rem" }}>
          <h3>📋 Extracted Data:</h3>
          <table
            border="1"
            cellPadding="10"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ backgroundColor: "#f0f0f0" }}>Field</th>
                <th style={{ backgroundColor: "#f0f0f0" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(extractedData).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ fontWeight: "bold" }}>{key}</td>
                  <td>{renderValue(key, value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
