import React from 'react'
import HomeRight from '../../components/HomeComponents/HomeRight/HomeRight'
import Friends from '../../components/HomeComponents/HomeRight/Friends/Friends'
import UserList from './../../components/HomeComponents/HomeRight/UserList/UserList';
import FriendRequest from './../../components/HomeComponents/HomeRight/FriendRequest/FriendRequest';

const Home = () => {
  return (
    <div className='flex flex-wrap justify-center gap-6 px-6 py-6 w-full'>
      <Friends />
      <UserList />
      <FriendRequest />
    </div>
  );
};


export default Home