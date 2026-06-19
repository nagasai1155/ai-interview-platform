import api from "./api";

export interface Resume {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  rawText: string;
  atsScore: number;
  uploadedAt: string;
  message?: string;
}

// upload resume — sends as multipart form data
export const uploadResume = async (file: File): Promise<Resume> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/resumes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // override the default application/json
      // because we are sending a file not JSON
    },
  });
  return res.data;
};

// get all resumes for logged in user
export const getUserResumes = async (): Promise<Resume[]> => {
  const res = await api.get("/resumes");
  return res.data;
};

// get one resume by id
export const getResume = async (id: number): Promise<Resume> => {
  const res = await api.get(`/resumes/${id}`);
  return res.data;
};

// delete a resume
export const deleteResume = async (id: number): Promise<void> => {
  await api.delete(`/resumes/${id}`);
};