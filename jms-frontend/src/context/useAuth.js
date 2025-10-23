// frontend/src/context/useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // We will create/update this file next

export const useAuth = () => {
  return useContext(AuthContext);
};
