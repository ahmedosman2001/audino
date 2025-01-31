import axios from "axios";
import authHeader from "./auth-header";
import globalParams from "./global-params";
import toast from "react-hot-toast";
import { handleDjangoErrors } from "../utils/errorHandler";
import './axios-config'

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const createAnnotationApi = async (data) => {
  try {
    const res = await axios.post(BASE_URL + "/api/annotation", data, {
      headers: { ...authHeader() },
    });
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const patchAnnotationApi = async (data) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/jobs/${data.jobId}/annotations?action=${data.action}`,
      data.data,
      {
        headers: { ...authHeader() },
      }
    );
    return res.data;
  } catch (e) {
    handleDjangoErrors(e);
    throw Error(e.response?.data?.msg ?? "Something went wrong");
  }
};

export const downloadAnnotationApi = async (data) => {
  async function wait({ currentId, format, type }) {
    let params = {
      ...globalParams(),
    };
    return new Promise((resolve, reject) => {
      async function checkStatus() {
        try {
          let url = `${BASE_URL}/${type}/${currentId}/annotations?format=${format}`;
          const response = await axios.get(url, {
            params: params,
            headers: { ...authHeader() },
            responseType: "arraybuffer",
          });

          if (response.status === 201) {
            params.action = "download";
            checkStatus();
          }
          if (response.status === 202) setTimeout(checkStatus, 3000);
          if (response.status === 200) resolve(response.data);
        } catch (errorData) {
          const message = `Could not fetch status  ${errorData.message}`;
          toast.error(message);
          reject(Error(message));
        }
      }

      setTimeout(checkStatus);
    });
  }

  try {
    return await wait(data);
  } catch (createException) {
    throw createException;
  }
};

export const sendAudioToModelApi = async (audioSegment) => {
  try {
    const response = await fetch("YOUR_API_ENDPOINT", {
      method: "POST",
      headers: {
        "Content-Type": "audio/wav",
      },
      body: audioSegment,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transcription");
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error("Error fetching transcription:", error);
    throw error;
  }
};
