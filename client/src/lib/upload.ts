import newRequest from "./newRequest";

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await newRequest.post(`/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data.url;
}
