import api from "./api";

export const authService = {
  async register({ name, email, password }) {
    const { data } = await api.post("/register", { name, email, password });
    return data;
  },

  async login({ email, password }) {
    const { data } = await api.post("/login", { email, password });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get("/me");
    return data.user;
  },
};
