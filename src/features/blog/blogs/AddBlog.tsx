import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { addBlog, fetchRegions } from './blogSlice';
import Breadcrumb from './Breadcrumb';
import { IAddBlogRequest } from './types';
import './blogsStyles/addBlog.css';
import { useNavigate } from 'react-router-dom';



// const AddBlog: React.FC = () => {
//   const dispatch: AppDispatch = useDispatch();
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [region, setRegion] = useState('');
//   const { regions, status, error, message } = useSelector((state: RootState) => state.blogs);
//   const [titleError, setTitleError] = useState<string | null>(null);
//   const [regionError, setRegionError] = useState<string | null>(null);
//   const [contentError, setContentError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   const handleCancelBlogClick = () => {
//     navigate("/blogs");
//   };


//   useEffect(() => {
//     dispatch(fetchRegions());
//   }, [dispatch]);

//   const handleSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     let isValid = true;
    
//     // Проверка длины заголовка
//     if (title.length < 2) {
//       setTitleError('Der Titel muss mindestens 2 Zeichen lang sein.');
//       isValid = false;
//     } else if (title.length > 200) {
//       setTitleError('Der Titel darf höchstens 200 Zeichen lang sein.');
//       isValid = false;
//     } else {
//       setTitleError(null);
//     }
    
//     // Проверка выбора региона
//     if (!region) {
//       setRegionError('Bitte wählen Sie eine Region aus.');
//       isValid = false;
//     } else {
//       setRegionError(null);
//     }
    
//     // Проверка контента
//     if (!content.trim()) {
//       setContentError('Der Inhalt darf nicht leer sein.');
//       isValid = false;
//     } else {
//       setContentError(null);
//     }
    
//     if (isValid && title && content && region) {
//       const blogData: IAddBlogRequest = { title, content, region: Number(region) };
//       dispatch(addBlog(blogData));
//       setTitle('');
//       setContent('');
//       setRegion('');
//     }
//   };

// return (
//   <div className="add-blog-container">
//     <Breadcrumb/>
//     <div>
//       <h1>Neuen Blog hinzufügen</h1>
//       <form onSubmit={handleSubmit} className="add-blog-form">
//         <div>
//           <label>Titel:</label>
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//           {titleError && <p className="error">{titleError}</p>}
//         </div>
//         <div>
//           <label>Inhalt:</label>
//           <textarea
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//           />
//           {contentError && <p className="error">{contentError}</p>}
//         </div>
//         <div>
//           {/* <label>Region:</label> */}
//           <select
//             value={region}
//             onChange={(e) => setRegion(e.target.value)}
//           >
//             <option value="">Region auswählen</option>
//             {regions.map((region) => (
//               <option key={region.id} value={region.id}>
//                 {region.regionName}
//               </option>
//             ))}
//           </select>
//           {regionError && <p className="error">{regionError}</p>}
//         </div>
//         <div className='add-blog_buttons'>
//         <button className='add-blog_button' type="submit">Blog hinzufügen</button>
//         <button className='cancel-blog_button' onClick={handleCancelBlogClick}>Abbrechen</button>
//         </div>
//       </form>
//       {status === 'loading' && <p className="status-message loading">Laden...</p>}
//       {status === 'error' && <p className="status-message error">{error}</p>}
//       {status === 'success' && message && <p className="status-message success">{message}</p>}
//     </div>
//   </div>
// );
// };

// export default AddBlog;

const AddBlog: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [region, setRegion] = useState('');
  const { regions, status, error } = useSelector((state: RootState) => state.blogs);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogAdded, setBlogAdded] = useState(false);
  const navigate = useNavigate();

  const handleCancelBlogClick = () => {
    navigate("/blogs");
  };

  useEffect(() => {
    dispatch(fetchRegions());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'success' && blogAdded) {
      setIsModalOpen(true);
      setBlogAdded(false); // Сброс состояния, чтобы модалка не открывалась снова
    }
  }, [status, blogAdded]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    let isValid = true;
    
    if (title.length < 2) {
      setTitleError('Der Titel muss mindestens 2 Zeichen lang sein.');
      isValid = false;
    } else if (title.length > 200) {
      setTitleError('Der Titel darf höchstens 200 Zeichen lang sein.');
      isValid = false;
    } else {
      setTitleError(null);
    }
    
    if (!region) {
      setRegionError('Bitte wählen Sie eine Region aus.');
      isValid = false;
    } else {
      setRegionError(null);
    }
    
    if (!content.trim()) {
      setContentError('Der Inhalt darf nicht leer sein.');
      isValid = false;
    } else {
      setContentError(null);
    }
    
    if (isValid && title && content && region) {
      const blogData: IAddBlogRequest = { title, content, region: Number(region) };
      dispatch(addBlog(blogData));
      setTitle('');
      setContent('');
      setRegion('');
      setBlogAdded(true); // Устанавливаем состояние при попытке добавить блог
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/blogs');
  };

  return (
    <div className="add-blog-container">
      <Breadcrumb />
      <div>
        <h1>Neuen Blog hinzufügen</h1>
        <form onSubmit={handleSubmit} className="add-blog-form">
          <div>
            <label>Titel:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleError && <p className="error">{titleError}</p>}
          </div>
          <div>
            <label>Inhalt:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {contentError && <p className="error">{contentError}</p>}
          </div>
          <div>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Region auswählen</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.regionName}
                </option>
              ))}
            </select>
            {regionError && <p className="error">{regionError}</p>}
          </div>
          <div className='add-blog_buttons'>
            <button className='add-blog_button' type="submit">Blog hinzufügen</button>
            <button className='cancel-blog_button' type="button" onClick={handleCancelBlogClick}>Abbrechen</button>
          </div>
        </form>
        {status === 'loading' && <p className="status-message loading">Laden...</p>}
        {status === 'error' && <p className="status-message error">{error}</p>}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>Blog wurde erfolgreich hinzugefügt!</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBlog;