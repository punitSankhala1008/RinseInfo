import axios from "axios";

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await axios.post("http://localhost:8000/extract", formData);
};
