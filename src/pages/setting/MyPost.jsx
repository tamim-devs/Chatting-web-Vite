import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  remove,
} from "firebase/database";
import moment from "moment";
import { FaTrash } from "react-icons/fa";

const MyPost = () => {
  const auth = getAuth();
  const db = getDatabase();
  const uid = auth.currentUser.uid;

  const [myPosts, setMyPosts] = useState([]);

  /* ================= FETCH MY POSTS ================= */
  useEffect(() => {
    onValue(ref(db, "posts"), (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (d.uid === uid) {
          arr.unshift({ ...d, id: item.key });
        }
      });
      setMyPosts(arr);
    });
  }, []);

  /* ================= DELETE POST ================= */
  const handleDeletePost = async (postId) => {
    await remove(ref(db, `posts/${postId}`));
    await remove(ref(db, `comments/${postId}`));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[680px] p-4 space-y-4">

        <h2 className="text-xl font-semibold mb-2">My Posts</h2>

        {myPosts.length === 0 && (
          <p className="text-gray-500 text-center">
            You haven’t posted anything yet
          </p>
        )}

        {myPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white p-4 rounded-xl shadow"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {post.userName}
                </p>
                <p className="text-xs text-gray-500">
                  {moment(post.createdAt).fromNow()}
                </p>
              </div>

              <button
                onClick={() => handleDeletePost(post.id)}
                className="text-red-600"
              >
                <FaTrash />
              </button>
            </div>

            {/* TEXT */}
            {post.text && (
              <p className="mt-2">{post.text}</p>
            )}

            {/* IMAGE */}
            {post.image && (
              <img
                src={post.image}
                className="rounded-lg my-3 w-full"
              />
            )}

            {/* VIDEO FILE */}
            {post.video && (
              <video
                src={post.video}
                controls
                className="rounded-lg my-3 w-full"
              />
            )}

            {/* YOUTUBE VIDEO */}
            {post.youtubeId && (
              <iframe
                className="w-full h-64 rounded-lg my-3"
                src={`https://www.youtube.com/embed/${post.youtubeId}`}
                title="YouTube video"
                frameBorder="0"
                allowFullScreen
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPost;
