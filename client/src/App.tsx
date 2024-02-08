import './App.css';
import Create from "./components/create/Create"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Scann from './components/scann/Scann';
import Header from './components/header/Header';
import Spinner from './components/spinner/Spinner';
import { SpinnerProvider } from './context/SpinnerContext';

function App() {
  return (
    <>
      <Router>
        <SpinnerProvider>
          <Header />
          <Spinner />
          <Routes>
            <Route path='/' element={<Scann />} />
            <Route path='/create' element={<Create />} />
          </Routes>
        </SpinnerProvider>
      </Router>
    </>
  );
}

export default App;
