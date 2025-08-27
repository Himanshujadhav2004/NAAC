import axios from "axios";

export const uploadFileToS3 = async (
  file: File,
  collegeId: string,
  questionId: string
): Promise<string | null> => {
  try {
    console.log("Starting file upload for:", file.name);

    if (!collegeId) throw new Error("College ID is required");
    if (!questionId) throw new Error("Question ID is required");

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!fileExtension || fileExtension !== "pdf") {
      throw new Error("Only PDF files are allowed");
    }

    const apiEndpoint = process.env.API;
    if (!apiEndpoint) {
      throw new Error("API endpoint not configured. Please check REACT_APP_API.");
    }

    const uploadUrl = `https://${apiEndpoint}.execute-api.ap-south-1.amazonaws.com/dev/upload-url`;
    const payload = { aisheId: collegeId, questionId, fileExtension };

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found");

    const response = await axios.post(uploadUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const { uploadUrl: s3UploadUrl, fileUrl } = response.data;
    if (!s3UploadUrl || !fileUrl) throw new Error("Invalid response structure");

    await axios.put(s3UploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (e) => {
        if (typeof e.total === "number") {
          const percent = Math.round((e.loaded * 100) / e.total);
          console.log(`Upload progress: ${percent}%`);
        }
      },
    });

    return fileUrl;
  } catch (error: unknown) {
    console.error("S3 upload failed:", error);

    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    throw new Error("Upload failed: Unknown error");
  }
};
