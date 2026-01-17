import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  FaVideo,
  FaThumbsUp,
  FaTrash,
} from "react-icons/fa";

import AddStory from "../../components/story/AddStory";
import StoryViewer from "../../components/story/StoryViewer";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

/* ================= YOUTUBE ID ================= */
const getYouTubeId = (text = "") => {
  const reg =
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?\s]+)/;
  const m = text.match(reg);
  return m ? m[1] : null;
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

  const [user, setUser] = useState(null);

  /* ================= STATE ================= */
  const [storyGroups, setStoryGroups] = useState([]);
  const [openStory, setOpenStory] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);

  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [openReply, setOpenReply] = useState({});

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  /* ================= STORIES ================= */
  useEffect(() => {
    const r = ref(db, "stories");
    return onValue(r, (snap) => {
      const arr = [];
      snap.forEach((i) => {
        const d = i.val();
        if (Date.now() < d.expireAt) {
          arr.push({ ...d, id: i.key });
        }
      });
      setStoryGroups(groupStoriesByUser(arr));
    });
  }, []);

  /* ================= POSTS ================= */
  useEffect(() => {
    const r = ref(db, "posts");
    return onValue(r, (snap) => {
      if (!snap.exists()) {
        setPosts([]);
        return;
      }

      const data = snap.val();
      const arr = Object.keys(data)
        .map((k) => ({ id: k, ...data[k] }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setPosts(arr);
    });
  }, []);

  /* ================= COMMENTS + REPLIES ================= */
  useEffect(() => {
    const r = ref(db, "comments");
    return onValue(r, (snap) => {
      const obj = {};
      snap.forEach((post) => {
        const arr = [];
        post.forEach((c) => {
          const v = c.val();
          arr.push({
            id: c.key,
            ...v,
            replies: v.replies
              ? Object.entries(v.replies).map(([id, r]) => ({
                  id,
                  ...r,
                }))
              : [],
          });
        });
        obj[post.key] = arr;
      });
      setComments(obj);
    });
  }, []);

  if (!user) return null;
  const uid = user.uid;

  /* ================= CREATE POST ================= */
  const handlePost = async () => {
    if (!postText && !postImage && !postVideo) return;

    let image = "";
    let video = "";

    if (postImage) image = await uploadToCloudinary(postImage);
    if (postVideo) video = await uploadToCloudinary(postVideo);

    await push(ref(db, "posts"), {
      uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      text: postText,
      image,
      video,
      youtubeId: getYouTubeId(postText),
      createdAt: Date.now(),
      likes: {},
    });

    setPostText("");
    setPostImage(null);
    setPostVideo(null);
  };

  /* ================= LIKE ================= */
  const handleLike = (post) => {
    const r = ref(db, `posts/${post.id}/likes/${uid}`);
    post.likes?.[uid] ? remove(r) : set(r, true);
  };

  /* ================= COMMENT ================= */
  const handleComment = (postId) => {
    if (!commentText[postId]) return;

    push(ref(db, `comments/${postId}`), {
      uid,
      name: user.displayName,
      text: commentText[postId],
      createdAt: Date.now(),
    });

    setCommentText({ ...commentText, [postId]: "" });
  };

  /* ================= REPLY ================= */
  const handleReply = (postId, commentId) => {
    if (!replyText[commentId]) return;

    push(ref(db, `comments/${postId}/${commentId}/replies`), {
      uid,
      name: user.displayName,
      text: replyText[commentId],
      createdAt: Date.now(),
    });

    setReplyText({ ...replyText, [commentId]: "" });
  };

  /* ================= DELETE ================= */
  const deletePost = (post) => {
    if (post.uid !== uid) return;
    remove(ref(db, `posts/${post.id}`));
    remove(ref(db, `comments/${post.id}`));
  };

  const deleteComment = (postId, c) => {
    if (c.uid !== uid) return;
    remove(ref(db, `comments/${postId}/${c.id}`));
  };

  const deleteReply = (postId, commentId, r) => {
    if (r.uid !== uid) return;
    remove(ref(db, `comments/${postId}/${commentId}/replies/${r.id}`));
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center overflow-hidden">
      <div className="w-full max-w-[680px] h-full flex flex-col">

        {/* ================= STORY BAR ================= */}
        <div className="bg-white p-3 shadow flex gap-4 overflow-x-auto">
          <AddStory />
          {storyGroups.map((u, i) => (
            <div
              key={u.uid}
              onClick={() => {
                setStartIndex(i);
                setOpenStory(true);
              }}
              className="flex flex-col items-center min-w-[70px] cursor-pointer"
            >
              <img
                src={u.userPhoto}
                className="w-16 h-16 rounded-full border-2 border-pink-500 object-cover"
              />
              <p className="text-xs truncate w-16 text-center">
                {u.userName}
              </p>
            </div>
          ))}
        </div>

        {/* ================= FEED ================= */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* CREATE POST */}
          <div className="bg-white p-4 rounded-xl shadow">
            <textarea
              className="w-full bg-gray-100 rounded-xl px-4 py-2"
              placeholder="What's on your mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className="flex justify-between mt-2">
              <div className="flex gap-4 text-blue-600">
                <label><FaImage /><input type="file" hidden accept="image/*" onChange={(e)=>setPostImage(e.target.files[0])}/></label>
                <label><FaVideo /><input type="file" hidden accept="video/*" onChange={(e)=>setPostVideo(e.target.files[0])}/></label>
              </div>
              <button onClick={handlePost} className="bg-blue-600 text-white px-5 py-1 rounded-full">Post</button>
            </div>
          </div>

          {/* POSTS */}
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{post.userName}</p>
                  <p className="text-xs text-gray-500">{moment(post.createdAt).fromNow()}</p>
                </div>
                {post.uid === uid && (
                  <FaTrash className="text-red-500 cursor-pointer" onClick={() => deletePost(post)} />
                )}
              </div>

              {post.text && <p className="mt-2">{post.text}</p>}
              {post.image && <img src={post.image} className="rounded-lg my-2" />}
              {post.video && <video src={post.video} controls className="rounded-lg my-2" />}
              {post.youtubeId && (
                <iframe className="w-full h-64 rounded-lg my-2" src={`https://www.youtube.com/embed/${post.youtubeId}`} allowFullScreen />
              )}

              <button onClick={() => handleLike(post)} className="flex items-center gap-2 text-blue-600 mt-2">
                <FaThumbsUp /> {post.likes ? Object.keys(post.likes).length : 0}
              </button>

              {/* COMMENTS + REPLIES */}
              {/* COMMENTS + REPLIES */}
{(() => {
  const postComments = comments[post.id] || [];
  const expanded = showAllComments[post.id];

  const visibleComments = expanded
    ? postComments
    : postComments.slice(-1);

  return (
    <>
      {/* VIEW ALL */}
      {postComments.length > 1 && !expanded && (
        <button
          className="text-xs text-gray-500 mt-2"
          onClick={() =>
            setShowAllComments({
              ...showAllComments,
              [post.id]: true,
            })
          }
        >
          View all comments ({postComments.length})
        </button>
      )}

      {/* COMMENT LIST */}
      {visibleComments.map((c) => (
        <div key={c.id} className="text-sm mt-2">
          <div className="flex justify-between">
            <p>
              <b>{c.name}</b> {c.text}
            </p>

            {c.uid === uid && (
              <FaTrash
                onClick={() => deleteComment(post.id, c)}
                className="text-red-500 cursor-pointer text-xs"
              />
            )}
          </div>

          {/* REPLIES (ONLY WHEN EXPANDED) */}
          {expanded &&
            c.replies.map((r) => (
              <div
                key={r.id}
                className="ml-6 bg-gray-100 rounded px-2 py-1 mt-1 flex justify-between"
              >
                <p>
                  <b>{r.name}</b> {r.text}
                </p>
                {r.uid === uid && (
                  <FaTrash
                    onClick={() =>
                      deleteReply(post.id, c.id, r)
                    }
                    className="text-red-500 text-xs cursor-pointer"
                  />
                )}
              </div>
            ))}

          {/* REPLY BUTTON */}
          <button
            className="text-xs text-blue-600 ml-1 mt-1"
            onClick={() => {
              setOpenReply({
                ...openReply,
                [c.id]: !openReply[c.id],
              });
              setShowAllComments({
                ...showAllComments,
                [post.id]: true,
              });
            }}
          >
            Reply
          </button>

          {/* REPLY INPUT */}
          {openReply[c.id] && (
            <div className="ml-6 flex gap-2 mt-1">
              <input
                className="flex-1 bg-gray-100 rounded-full px-3 py-1 text-sm"
                placeholder="Write a reply..."
                value={replyText[c.id] || ""}
                onChange={(e) =>
                  setReplyText({
                    ...replyText,
                    [c.id]: e.target.value,
                  })
                }
              />
              <button
                onClick={() =>
                  handleReply(post.id, c.id)
                }
                className="text-blue-600 text-sm"
              >
                Send
              </button>
            </div>
          )}
        </div>
      ))}

      {/* HIDE COMMENTS */}
      {expanded && postComments.length > 1 && (
        <button
          className="text-xs text-gray-500 mt-2"
          onClick={() =>
            setShowAllComments({
              ...showAllComments,
              [post.id]: false,
            })
          }
        >
          Hide comments
        </button>
      )}
    </>
  );
})()}

{/* ADD COMMENT */}
<div className="flex gap-2 mt-3">
  <input
    className="flex-1 bg-gray-100 rounded-full px-3 py-1"
    placeholder="Write a comment..."
    value={commentText[post.id] || ""}
    onChange={(e) =>
      setCommentText({
        ...commentText,
        [post.id]: e.target.value,
      })
    }
    onFocus={() =>
      setShowAllComments({
        ...showAllComments,
        [post.id]: true,
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


              <div className="flex gap-2 mt-3">
                <input className="flex-1 bg-gray-100 rounded-full px-3 py-1"
                  placeholder="Write a comment..."
                  value={commentText[post.id] || ""}
                  onChange={(e)=>setCommentText({...commentText,[post.id]:e.target.value})}/>
                <button onClick={() => handleComment(post.id)} className="text-blue-600">Send</button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
