import { ref, push } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

const AddStory = () => {
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = await uploadToCloudinary(file);
    if (!imageURL) return;

    const now = Date.now();

    await push(ref(db, "stories"), {
      uid: auth.currentUser.uid,
      name: auth.currentUser.displayName,
      image: imageURL,
      createdAt: now,
      expireAt: now + 29 * 60 * 60 * 1000,
      views: {},
      reactions: {},
    });
  };

  return (
    <label className="cursor-pointer text-blue-600 text-sm">
      ➕ Add Story
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={handleStoryUpload}
      />
    </label>
  );
};

export default AddStory;
