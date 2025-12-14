export const uploadToCloudinary = async (file) => {
  const cloudName = "duxaxx2dm";
  const uploadPreset = "chat_upload"; 

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url || "";
  } catch (err) {
    console.error(err);
    return "";
  }
};
