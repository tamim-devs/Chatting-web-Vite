export const groupStoriesByUser = (stories) => {
  const map = {};

  stories.forEach((story) => {
    if (!map[story.uid]) {
      map[story.uid] = {
        uid: story.uid,
        userName: story.userName,
        userPhoto: story.userPhoto,
        stories: [],
      };
    }
    map[story.uid].stories.push(story);
  });

  return Object.values(map);
};
