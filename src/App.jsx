import React from 'react'
import Regestration from './pages/Regestration'
import { ToastContainer, toast } from 'react-toastify'
import {createRoutesFromElements,createBrowserRouter,Route, RouterProvider,} from "react-router-dom";
import Login from './pages/Login';
import RootLayout from './components/rootLayout/RootLayout';
import Home from '../src/pages/Home/Home';
import Chat from './pages/chat/Chat';

const App = () => {

  const router = createBrowserRouter(
    createRoutesFromElements(
     <Route>
        <Route path='/regestration' element={<Regestration/>}/>
        <Route path='/login' element={<Login/>}/>
      <Route>
        <Route path='/' element={<RootLayout/>}> 
        <Route path='/home' element={<Home/>}/>
        <Route path='/chat' element={<Chat/>}/>
        <Route path='/settings' element={"this is settingpage"}/>
      
        </Route>
      </Route>
     </Route>
    )
  );

  return (
    <>
     <RouterProvider
    router={router}/>
    </>
  )
}

export default App
