import api from "./api";

export const resumeService = {
  async upload(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          const percent = Math.round((event.loaded * 100) / event.total);
          onProgress(percent);
        }
      },
    });
    return data;
  },

  async list() {
    const { data } = await api.get("/resumes");
    return data.resumes;
  },

  async get(resumeId) {
    const { data } = await api.get(`/resume/${resumeId}`);
    return data.resume;
  },

  async remove(resumeId) {
    const { data } = await api.delete(`/resume/${resumeId}`);
    return data;
  },
};
