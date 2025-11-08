import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  async function submit(e: React.FormEvent){
    e.preventDefault();
    try{
      let userCred;
      if (isRegister) userCred = await createUserWithEmailAndPassword(auth, email, password);
      else userCred = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCred.user.getIdToken();
      localStorage.setItem('fb_token', token);
      window.location.href = '/dashboard';
    }catch(err){
      alert('Auth error');
      console.error(err);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <h2 className="text-2xl mb-4">{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border" />
        <button className="px-4 py-2 bg-blue-600 text-white">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <div className="mt-3">
        <button onClick={()=>setIsRegister(s=>!s)} className="text-sm">{isRegister ? 'Have an account? Login' : 'No account? Register'}</button>
      </div>
    </div>
  );
}
