import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
} from "firebase/database";
import moment from "moment";
import {
  FaImage,
  FaThumbsUp,
  FaVideo,
  FaTrash,
} from "react-icons/fa";

import AddStory from "../../components/story/AddStory";
import StoryViewer from "../../components/story/StoryViewer";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

/* ================= YOUTUBE ID EXTRACT ================= */
const getYouTubeId = (text) => {
  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\s]+)/;
  const match = text.match(regExp);
  return match ? match[1] : null;
};

/* ================= GROUP STORIES ================= */
const groupStoriesByUser = (stories) => {
  const map = {};
  stories.forEach((s) => {
    if (!map[s.uid]) {
      map[s.uid] = {
        uid: s.uid,
        userName: s.userName,
        userPhoto: s.userPhoto,
        stories: [],
      };
    }
    map[s.uid].stories.push(s);
  });
  return Object.values(map);
};

const Home = () => {
  const auth = getAuth();
  const db = getDatabase();
  const currentUid = auth.currentUser.uid;

  /* ================= STORY ================= */
  const [storyGroups, setStoryGroups] = useState([]);
  const [openStory, setOpenStory] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  /* ================= POSTS ================= */
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);

  /* ================= COMMENTS ================= */
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showAllComments, setShowAllComments] = useState({});

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    onValue(ref(db, "stories"), (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (Date.now() < d.expireAt) {
          arr.push({ ...d, id: item.key });
        }
      });
      setStoryGroups(groupStoriesByUser(arr));
    });
  }, []);

  /* ================= FETCH POSTS ================= */
  useEffect(() => {
    onValue(ref(db, "posts"), (snap) => {
      let arr = [];
      snap.forEach((item) => {
        arr.unshift({ ...item.val(), id: item.key });
      });
      setPosts(arr);
    });
  }, []);

  /* ================= FETCH COMMENTS ================= */
  useEffect(() => {
    onValue(ref(db, "comments"), (snap) => {
      let obj = {};
      snap.forEach((post) => {
        let arr = [];
        post.forEach((c) => {
          arr.push({ id: c.key, ...c.val() });
        });
        obj[post.key] = arr;
      });
      setComments(obj);
    });
  }, []);

  /* ================= CREATE POST ================= */
  const handlePost = async () => {
    if (!postText && !postImage && !postVideo) return;

    let imageURL = "";
    let videoURL = "";
    const youtubeId = getYouTubeId(postText);

    if (postImage) imageURL = await uploadToCloudinary(postImage);
    if (postVideo) videoURL = await uploadToCloudinary(postVideo);

    await push(ref(db, "posts"), {
      uid: currentUid,
      userName: auth.currentUser.displayName,
      userPhoto: auth.currentUser.photoURL,
      text: postText,
      image: imageURL,
      video: videoURL,
      youtubeId,
      createdAt: Date.now(),
      likes: {},
    });

    setPostText("");
    setPostImage(null);
    setPostVideo(null);
  };

  /* ================= DELETE POST ================= */
  const handleDeletePost = async (post) => {
    if (post.uid !== currentUid) return;
    await remove(ref(db, `posts/${post.id}`));
    await remove(ref(db, `comments/${post.id}`));
  };

  /* ================= LIKE ================= */
  const handleLike = (post) => {
    const likeRef = ref(
      db,
      `posts/${post.id}/likes/${currentUid}`
    );
    post.likes?.[currentUid]
      ? remove(likeRef)
      : set(likeRef, true);
  };

  /* ================= COMMENT ================= */
  const handleComment = (postId) => {
    if (!commentText[postId]) return;

    push(ref(db, `comments/${postId}`), {
      uid: currentUid,
      name: auth.currentUser.displayName,
      text: commentText[postId],
      createdAt: Date.now(),
    });

    setCommentText({ ...commentText, [postId]: "" });
  };

  /* ================= DELETE COMMENT ================= */
  const handleDeleteComment = async (postId, comment) => {
    if (comment.uid !== currentUid) return;
    await remove(ref(db, `comments/${postId}/${comment.id}`));
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-[680px] h-full flex flex-col">

        {/* ================= STORY BAR ================= */}
        <div className="bg-white p-3 shadow flex gap-4 overflow-x-auto">
          <AddStory />

          {storyGroups.map((user, i) => (
            <div
              key={user.uid}
              onClick={() => {
                setStartIndex(i);
                setOpenStory(true);
              }}
              className="flex flex-col items-center cursor-pointer min-w-[70px]"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400">
                <img
                  src={user.userPhoto}
                  className="w-16 h-16 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="text-xs mt-1 truncate w-16 text-center">
                {user.userName}
              </p>
            </div>
          ))}
        </div>

        {/* ================= FEED ================= */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* CREATE POST */}
          <div className="bg-white p-4 rounded-xl shadow">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-gray-100 rounded-xl px-4 py-2 resize-none"
            />

            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-4 text-blue-600">
                <label className="cursor-pointer">
                  <FaImage />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setPostImage(e.target.files[0])
                    }
                  />
                </label>

                <label className="cursor-pointer">
                  <FaVideo />
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={(e) =>
                      setPostVideo(e.target.files[0])
                    }
                  />
                </label>
              </div>

              <button
                onClick={handlePost}
                className="bg-blue-600 text-white px-5 py-1 rounded-full"
              >
                Post
              </button>
            </div>
          </div>

          {/* POSTS */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{post.userName}</p>
                  <p className="text-xs text-gray-500">
                    {moment(post.createdAt).fromNow()}
                  </p>
                </div>

                {post.uid === currentUid && (
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              {post.text && <p className="mt-2">{post.text}</p>}

              {post.image && (
                <img
                  src={post.image}
                  className="rounded-lg my-3 w-full"
                />
              )}

              {post.video && (
                <video
                  src={post.video}
                  controls
                  className="rounded-lg my-3 w-full"
                />
              )}

              {post.youtubeId && (
                <iframe
                  className="w-full h-64 rounded-lg my-3"
                  src={`https://www.youtube.com/embed/${post.youtubeId}`}
                  allowFullScreen
                />
              )}

              <button
                onClick={() => handleLike(post)}
                className="flex items-center gap-2 text-blue-600 mt-2"
              >
                <FaThumbsUp />
                {post.likes
                  ? Object.keys(post.likes).length
                  : 0}
              </button>

              {/* COMMENTS */}
              {comments[post.id]
                ?.slice(showAllComments[post.id] ? 0 : -1)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between text-sm mt-1"
                  >
                    <p>
                      <b>{c.name}</b> {c.text}
                    </p>
                    {c.uid === currentUid && (
                      <button
                        onClick={() =>
                          handleDeleteComment(post.id, c)
                        }
                        className="text-red-500 text-xs"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}

              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 bg-gray-100 rounded-full px-3 py-1"
                  placeholder="Write a comment..."
                  value={commentText[post.id] || ""}
                  onClick={() =>
                    setShowAllComments({
                      ...showAllComments,
                      [post.id]: true,
                    })
                  }
                  onChange={(e) =>
                    setCommentText({
                      ...commentText,
                      [post.id]: e.target.value,
                    })
                  }
                />
                <button
                  onClick={() => handleComment(post.id)}
                  className="text-blue-600"
                >
                  Send
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= STORY VIEWER ================= */}
      {openStory && (
        <StoryViewer
          storyGroups={storyGroups}
          startUserIndex={startIndex}
          close={() => setOpenStory(false)}
        />
      )}
    </div>
  );
};

export default Home;
