export const uploadToCloudinary = async (file) => {
  const cloudName = "duxaxx2dm";
  const uploadPreset = "chat_upload";

  if (!file) return "";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "chat-app"); // 🔥 optional but clean

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Cloudinary upload failed");

    const data = await res.json();

    // 🔥 optimized image (FAST LOAD)
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_900/"
    );

    return optimizedUrl;
  } catch (err) {
    console.error("Cloudinary error:", err);
    return "";
  }
};
