import { useEffect, useRef, useState } from "react";
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
  FaTrash,
  FaEdit,
  FaRegHeart,
  FaRegComment,
  FaRegBookmark,
} from "react-icons/fa";
import { FiSend, FiSearch, FiPlusSquare, FiHeart } from "react-icons/fi";

import AddStory from "../../components/story/AddStory";
import StoryViewer from "../../components/story/StoryViewer";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
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
  const [editingPost, setEditingPost] = useState(null);
  const isEditing = Boolean(editingPost);

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const [commentText, setCommentText] = useState({});
  const [replyText, setReplyText] = useState({});
  const [showAllComments, setShowAllComments] = useState({});
  const [openReply, setOpenReply] = useState({});

  const commentRefs = useRef({});

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

  /* ================= CREATE / EDIT POST ================= */
  const clearPostModal = () => {
    setPostText("");
    setPostImage(null);
    setPostVideo(null);
    setEditingPost(null);
  };

  const openNewPostModal = () => {
    clearPostModal();
    setIsNewPostModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setPostText(post.text || "");
    setPostImage(post.image || null);
    setPostVideo(post.video || null);
    setIsNewPostModalOpen(true);
  };

  const closeNewPostModal = () => {
    setIsNewPostModalOpen(false);
    clearPostModal();
  };

  const handlePost = async () => {
    if (!postText && !postImage && !postVideo) return;

    let image = "";
    let video = "";

    if (postImage && typeof postImage !== "string") image = await uploadToCloudinary(postImage);
    if (postVideo && typeof postVideo !== "string") video = await uploadToCloudinary(postVideo);

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

    closeNewPostModal();
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!postText && !postImage && !postVideo) return;

    let image = typeof postImage === "string" ? postImage : "";
    let video = typeof postVideo === "string" ? postVideo : "";

    if (postImage && typeof postImage !== "string") {
      image = await uploadToCloudinary(postImage);
    }
    if (postVideo && typeof postVideo !== "string") {
      video = await uploadToCloudinary(postVideo);
    }

    await set(ref(db, `posts/${editingPost.id}`), {
      ...editingPost,
      text: postText,
      image,
      video,
      youtubeId: getYouTubeId(postText),
    });

    closeNewPostModal();
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

  const focusCommentInput = (postId) => {
    const el = commentRefs.current[postId];
    if (el) el.focus();
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

  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const textMatch = post.text?.toLowerCase().includes(q);
    const userMatch = post.userName?.toLowerCase().includes(q);

    const commentMatch = (comments[post.id] || []).some((c) => {
      const commentText = c.text?.toLowerCase();
      const commentUser = c.name?.toLowerCase();
      const repliesMatch = (c.replies || []).some((r) =>
        r.text?.toLowerCase().includes(q)
      );
      return (
        commentText?.includes(q) ||
        commentUser?.includes(q) ||
        repliesMatch
      );
    });

    return textMatch || userMatch || commentMatch;
  });

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#fafafa] flex justify-center overflow-hidden">
      <div className="w-full max-w-2xl h-full flex flex-col">

        {/* ================= TOP NAV ================= */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="mx-4 flex items-center justify-between gap-4 py-3">
         <div
  onClick={() => navigate("/settings")}
  className="flex items-center gap-2 cursor-pointer"
>
  <img
    src={user?.photoURL || "https://via.placeholder.com/40"}
    className="w-9 h-9 rounded-full object-cover"
  />
  <span className="hidden sm:block text-sm font-semibold text-slate-800">
    {user?.displayName}
  </span>
</div>

            <div className="relative flex-1 max-w-lg">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-slate-100 px-10 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search posts or users"
              />
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <button
                type="button"
                onClick={openNewPostModal}
                className="p-2 rounded-full hover:bg-slate-100"
                title="Create post"
              >
                <FiPlusSquare className="text-xl" />
               
              </button>

              <div className="hidden sm:flex items-center gap-4 text-slate-600">
             
               
                  
              

          
              </div>
            </div>
          </div>
        </header>

        {/* ================= STORY BAR ================= */}
        <div className="sticky top-[72px] z-20 bg-[#fafafa] border-b border-slate-200 py-3">
          <div className="mx-4 flex items-center gap-4 overflow-x-auto pb-2">
            <AddStory />
            {storyGroups.map((u, i) => (
              <button
                key={u.uid}
                onClick={() => {
                  setStartIndex(i);
                  setOpenStory(true);
                }}
                className="flex flex-col items-center min-w-[70px] cursor-pointer focus:outline-none"
              >
                <img
                  src={u.userPhoto}
                  className="w-16 h-16 rounded-full border-2 border-gradient-to-tr from-pink-500 to-yellow-400 object-cover"
                />
                <p className="text-xs truncate w-16 text-center text-slate-700">
                  {u.userName}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ================= FEED ================= */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {/* CREATE POST */}
         

          {/* POSTS */}
          {filteredPosts.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              No posts match your search.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const postComments = comments[post.id] || [];
              const expanded = showAllComments[post.id];
              const visibleComments = expanded
                ? postComments
                : postComments.slice(-1);

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.userPhoto}
                        alt={post.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {post.userName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {moment(post.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>

                    {post.uid === uid && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(post)}
                          className="text-slate-400 hover:text-slate-800"
                          title="Edit post"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deletePost(post)}
                          className="text-slate-400 hover:text-red-500"
                          title="Delete post"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {post.text && (
                    <div className="px-4 pb-3">
                      <p className="text-sm text-slate-800">{post.text}</p>
                    </div>
                  )}

                  {post.image && (
                    <img
                      src={post.image}
                      className="w-full max-h-[480px] object-cover"
                    />
                  )}

                  {post.video && (
                    <video
                      src={post.video}
                      controls
                      className="w-full max-h-[480px] object-cover"
                    />
                  )}

                  {post.youtubeId && (
                    <iframe
                      className="w-full h-64"
                      src={`https://www.youtube.com/embed/${post.youtubeId}`}
                      allowFullScreen
                    />
                  )}

                  <div className="px-4 py-3">
                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-600">
                        <button
                          onClick={() => handleLike(post)}
                          className="flex items-center gap-1 hover:text-slate-800"
                        >
                          <FaRegHeart />
                          <span className="text-sm">
                            {post.likes
                              ? Object.keys(post.likes).length
                              : 0}
                          </span>
                        </button>

                        <button
                          onClick={() => focusCommentInput(post.id)}
                          className="flex items-center gap-1 hover:text-slate-800"
                        >
                          <FaRegComment />
                          <span className="text-sm">
                            {postComments.length}
                          </span>
                        </button>

                      
                      </div>

                     
                    </div>

                    {/* COMMENTS */}
                    <div className="mt-3 space-y-2">
                      {postComments.length > 1 && !expanded && (
                        <button
                          className="text-xs text-slate-500"
                          onClick={() =>
                            setShowAllComments({
                              ...showAllComments,
                              [post.id]: true,
                            })
                          }
                        >
                          View all {postComments.length} comments
                        </button>
                      )}

                      {visibleComments.map((c) => (
                        <div
                          key={c.id}
                          className="flex justify-between text-sm"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">
                              {c.name}
                            </span>{" "}
                            <span className="text-slate-700">
                              {c.text}
                            </span>
                          </div>

                          {c.uid === uid && (
                            <FaTrash
                              onClick={() => deleteComment(post.id, c)}
                              className="text-slate-400 hover:text-red-500 cursor-pointer"
                              size={12}
                            />
                          )}
                        </div>
                      ))}

                      {expanded && postComments.length > 1 && (
                        <button
                          className="text-xs text-slate-500"
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
                    </div>

                    {/* COMMENT INPUT */}
                    <div className="mt-3 flex gap-2">
                      <input
                        ref={(el) => {
                          commentRefs.current[post.id] = el;
                        }}
                        className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                        placeholder="Add a comment..."
                        value={commentText[post.id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post.id]: e.target.value,
                          })
                        }
                      />

                      <button
                        onClick={() => handleComment(post.id)}
                        className="text-sm font-semibold text-blue-600"
                      >
                        comments
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ModalComponent
        modalIsOpen={isNewPostModalOpen}
        closeModal={closeNewPostModal}
      >
        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {isEditing ? "Edit Post" : "Create Post"}
          </h2>

          <textarea
            className="w-full bg-gray-100 rounded-xl px-4 py-3 resize-none text-sm text-slate-800"
            placeholder="Share something good..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={4}
          />

          {(postImage || postVideo) && (
            <div className="mt-3 space-y-3">
              {postImage && (
                <div className="relative">
                  {typeof postImage === "string" ? (
                    <img
                      src={postImage}
                      className="w-full max-h-60 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                      {postImage.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPostImage(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}

              {postVideo && (
                <div className="relative">
                  {typeof postVideo === "string" ? (
                    <video
                      src={postVideo}
                      controls
                      className="w-full max-h-60 rounded-xl"
                    />
                  ) : (
                    <div className="w-full rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                      {postVideo.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPostVideo(null)}
                    className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white"
                    title="Remove video"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-500">
              <label className="cursor-pointer hover:text-slate-700">
                <FaImage size={18} />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setPostImage(e.target.files[0])}
                />
              </label>
              {/* <label className="cursor-pointer hover:text-slate-700">
                <FaVideo size={18} />
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => setPostVideo(e.target.files[0])}
                />
              </label> */}
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (editingPost) deletePost(editingPost);
                    closeNewPostModal();
                  }}
                  className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              )}

              <button
                onClick={isEditing ? handleUpdatePost : handlePost}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isEditing ? "Update" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </ModalComponent>

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

