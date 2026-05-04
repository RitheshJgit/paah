import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../configs/firebase";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();

  return axios.post(`${API}/auth/social-login`, { token });
};

export const facebookLogin = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();

  return axios.post(`${API}/auth/social-login`, { token });
};