import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function Toolbar({ setAnnotationMode }) {
  return (
    <div className="toolbar">
      <button onClick={() => setAnnotationMode('brush')}>Brush</button>
      <button onClick={() => setAnnotationMode('textbox')}>Text Box</button>
      {/* Add more tools/buttons as needed */}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [annotationMode, setAnnotationMode] = useState(null); // null for default mode
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw file
    if (file && fileType === 'application') {
      const pdfjsLib = require('pdfjs-dist/build/pdf');
      pdfjsLib.getDocument(URL.createObjectURL(file)).promise.then((pdf) => {
        pdf.getPage(1).then((page) => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          page.render(renderContext);
        });
      });
    } else if (file && fileType === 'image') {
      const img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = URL.createObjectURL(file);
    }

    // Render annotations
    renderAnnotations(ctx);
  }, [file, fileType, annotations]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Determine file type
    const fileType = selectedFile.type.split('/')[0];
    setFileType(fileType);
  };

  const handleCanvasClick = (e) => {
    if (annotationMode) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Prompt for annotation text
      const text = prompt('Enter annotation text:');
      if (text) {
        setAnnotations([...annotations, { x, y, text }]);
      }
    }
  };

  const renderAnnotations = (ctx) => {
    annotations.forEach(({ x, y, text }) => {
      ctx.font = '16px Arial';
      ctx.fillStyle = 'red';
      ctx.fillText(text, x, y);
    });
  };

  const toggleAnnotationMode = (mode) => {
    if (annotationMode === mode) {
      setAnnotationMode(null); // Toggle off if mode is already active
    } else {
      setAnnotationMode(mode); // Toggle on if different mode is selected
    }
    // Clear annotations when toggling off annotation mode
    if (!mode) {
      setAnnotations([]);
    }
  };

  return (
    <div className="App">
      <h1>PDF/Image Annotation</h1>
      <Toolbar setAnnotationMode={toggleAnnotationMode} />
      <label>
        Enable Annotation Mode: {' '}
        <input
          type="checkbox"
          checked={annotationMode !== null} // Checked if annotationMode is not null
          onChange={() => toggleAnnotationMode(null)} // Toggle off mode when unchecked
        />
      </label>
      <input type="file" accept=".pdf,.png,.jpg" onChange={handleFileChange} />
      <div className="viewer">
        <canvas
          ref={canvasRef}
          width="800"
          height="600"
          style={{ zIndex: '1' }}
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}

export default App;
