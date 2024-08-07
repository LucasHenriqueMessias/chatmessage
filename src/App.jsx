import './App.css';
import React from "react"
import 'firebase/auth'

import { useAuthState } from 'react-firebase-hooks/auth'
 import { useCollectionData } from 'react-firebase-hooks/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
//import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, orderBy, query, Timestamp } from 'firebase/firestore';
import { useState } from 'react';
const firebaseConfig = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    measurementId: process.env.REACT_APP_measurementId
  };
  


  // Inicializando o Firebase
  const app = initializeApp(firebaseConfig);
  //const analytics = getAnalytics(app);
  const auth = getAuth(app)
  const firestore = getFirestore(app)

  //Definindo métodos de assinatura, e retornando a tela que será exibida quando não estiver logado
function SignIn(){

  //método para fazer login utilizando sua conta google
const SignInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
  .then((re) => {
    console.log(re);
  })
  .catch((err) => alert(err.message));
}

//retorna o html que será exibido na página
  return(<div><button onClick={SignInWithGoogle}>SignIn With Google</button></div>)
}

//Métodos de Logout, botão para sair que retorna um signouth do usuário autenticado previamente (pelo signinwithgoogle)
function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sair</button>
  )
}

//div que será exibido quando estiver logado
function ChatRoom(){

  
  const q = query(collection(firestore, 'messages'), orderBy("createdAt"));
  
  const [messages] = useCollectionData(q, {idField: 'id'}); 
  const [formValue, setFormValue] = useState('');

const sendMessage = async(e) => {
  e.preventDefault();
  
  const { uid, photoURL } = auth.currentUser;
  await addDoc(collection(firestore, 'messages'),{
    text: formValue,
    createdAt: Timestamp.fromDate(new Date()),
    uid,
    photoURL
  });
  setFormValue('')
}

return(<div>
  <div>
    {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
    
  </div>

  <form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>

    <button type='submit'>submit</button>

  </form>
</div>)
}
function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'
  return (
    <div className={ `message ${messageClass}`}>
      <img src={photoURL} alt='foto'/>
      <p>{text}</p>
    </div>
  )
}

function App(){
  
const [user] = useAuthState(auth)



  
    return (
      <div className="App">
       <header>
        <h1>ChatMessage Personalizado</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn/> }
      </section>
      </div>
    )
  
}

export default App