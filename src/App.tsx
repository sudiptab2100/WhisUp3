import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const queryParameters = new URLSearchParams(window.location.search)
  const user = queryParameters.get("user")
  console.log(user)
  return (
    <div className="App">
      <header className="App-header">
        
      </header>
    </div>
  );
}

export default App;
