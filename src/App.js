import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './tailwind.css';
import EventPage from './Component/Main/EventPage';
import CreateId from './Component/Main/CreateId';
import ArchiveEvent from './Component/Main/Archive/ArchiveEvent';
import BulkUploadForm from './Component/Main/BulkUploadForm';
import 'react-toastify/dist/ReactToastify.css';
import Approved from './Component/Main/Approved';
import Login from './Component/Auth/Login';
import PrivateRoute from './PrivateRoute';
import { ToastContainer } from 'react-toastify';
import ArchiveIDCard from './Component/Main/Archive/ArchiveIDCard';
import EmbedForm from './Component/Main/EmbedFOrm/EmbedForm';

function App() {
  return (
    <div className=" ">
       <ToastContainer />
      <Router>
        <div className="flex-grow">
          <Routes>
            {/* Route for login page, without PrivateRoute */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/event" element={<PrivateRoute element={EventPage} />} />
            <Route path="/create-id" element={<PrivateRoute element={CreateId} />} />
            <Route path="/bulk-create-id" element={<PrivateRoute element={BulkUploadForm} />} />
            <Route path="/archive-event" element={<PrivateRoute element={ArchiveEvent} />} />
            <Route path="/approve/:participantId" element={<PrivateRoute element={Approved} />} />
            <Route path="/archive-id-card" element={<PrivateRoute element={ArchiveIDCard} />} />
            <Route path="/form-url" element={<EmbedForm />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
