import axios from "./axios";

export const signup = (data) => axios.post("/user/signup", data);
export const signin = (data) => axios.post("/user/signin", data);
