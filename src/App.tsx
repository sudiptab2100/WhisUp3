import React from 'react';
import logo from './logo.svg';
import './App.css';
import SendMessage from './components/Waku';
import SenderForm from './components/SenderForm';

function App() {
  const queryParameters = new URLSearchParams(window.location.search)
  const user = queryParameters.get("user")?.toString()
  console.log(user)
  return (
    <div className="App">
      <header className="App-header">
        <SenderForm user={user || ''} onClickSend={SendMessage}/>
      </header>
    </div>
  );
}

export default App;
