import { ref, push } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

const AddStory = () => {
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      alert("Only image or video allowed");
      return;
    }

    // ⛔ 90s video limit
    if (isVideo) {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      await new Promise((res) => (video.onloadedmetadata = res));

      if (video.duration > 90) {
        alert("Video must be under 90 seconds");
        return;
      }
    }

    const mediaURL = await uploadToCloudinary(file);
    if (!mediaURL) return;

    const storyData = {
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      userPhoto: auth.currentUser.photoURL,
      media: mediaURL,
      type: isVideo ? "video" : "image",
      createdAt: Date.now(),
      expireAt: Date.now() + 24 * 60 * 60 * 1000,
      views: {},
    };

    // 🔥 SAVE STORY
    await push(ref(db, "stories"), storyData);

    // 🔥 AUTO POST IN FEED
    await push(ref(db, "posts"), {
      ...storyData,
      text: "added a story",
      likes: {},
      isStory: true,
    });
  };

  return (
    <label className="cursor-pointer text-blue-600 text-sm font-medium">
      ➕ Add Story
      <input
        type="file"
        hidden
        accept="image/*,video/*"
        onChange={handleStoryUpload}
      />
    </label>
  );
};

export default AddStory;
