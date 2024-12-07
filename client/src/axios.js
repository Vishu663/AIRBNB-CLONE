import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "airbnb-clone-wl4x.vercel.app",
  withCredentials: true,
});

export default axiosInstance;
