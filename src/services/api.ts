import axios from "axios";

const api = axios.create({
  baseURL: "https://svert-backend.onrender.com",
  headers: { "Content-Type": "application/json" },
});

export const getStorefront = async (username: string) => {
  const response = await api.get(`/storefront/${username}`);
  return response.data;
};

export const sendOtp = async (email: string) => {
  const response = await api.post("/otp/send", { email });
  return response.data;
};

export const verifyOtp = async (email: string, code: string) => {
  const response = await api.post("/otp/verify", { email, code });
  return response.data;
};

export const createOrder = async (data: {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  otpVerified: boolean;
  merchantId: string;
  items: { productId: string; quantity: number }[];
}) => {
  const response = await api.post("/orders", data);
  return response.data;
};

export const initiatePayment = async (orderId: string) => {
  const response = await api.post(`/orders/${orderId}/pay`);
  return response.data;
};
