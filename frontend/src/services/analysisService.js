import api from "./api";

export const analysisService = {
  async analyze({ resumeId, jobTitle, jobDescription }) {
    const { data } = await api.post("/analyze", {
      resume_id: resumeId,
      job_title: jobTitle,
      job_description: jobDescription,
    });
    return data.analysis;
  },

  async getResult(analysisId) {
    const { data } = await api.get(`/results/${analysisId}`);
    return data.analysis;
  },

  async getHistory() {
    const { data } = await api.get("/history");
    return data.history;
  },

  async rankResumes(jobDescription) {
    const { data } = await api.post("/rank-resumes", {
      job_description: jobDescription,
    });
    return data.ranking;
  },
};
