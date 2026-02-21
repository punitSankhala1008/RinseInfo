import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://rinseinfo.onrender.com/";
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await axios.post(BASE_URL + "extract", formData);
};
