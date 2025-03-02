import { useState, ChangeEvent, useEffect } from 'react'
import './App.css'
import './styles/theme.css'
import FullscreenReader from './components/FullscreenReader'
import { MdLightMode, MdDarkMode, MdFolder } from 'react-icons/md'

interface ImageFile {
  name: string;
  url: string;
  size: number;
  width: number;
  height: number;
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // 组件卸载时清理所有图片 URL
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
    };
  }, [images]);

  const handleFolderSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const img = new Image();
        const imageFile = await new Promise<ImageFile>((resolve) => {
          img.onload = () => {
            resolve({
              name: file.name,
              url: url,
              size: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          img.src = url;
        });
        imageFiles.push(imageFile);
      }
    }

    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));
    
    // 清理旧的图片 URL
    images.forEach(image => {
      URL.revokeObjectURL(image.url);
    });
    
    setImages(imageFiles);
  };

  return (
    <div className="app">
      <div className="content-area">
        <div className="welcome-section">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
            <span>{theme === 'light' ? '深色模式' : '浅色模式'}</span>
          </button>
          <h2>漫画阅读器</h2>
          <div className="upload-container">
            <label className="file-upload-button">
              <MdFolder className="upload-icon" />
              选择文件夹
              <input
                {...{
                  type: "file",
                  webkitdirectory: "",
                  directory: "",
                  multiple: true,
                  onChange: handleFolderSelect
                } as React.InputHTMLAttributes<HTMLInputElement>}
              />
            </label>
          </div>
        </div>

        {images.length > 0 && (
          <div className="gallery-section">
            <h3>您的漫画 ({images.length})</h3>
            <div className="image-grid">
              {images.map((image, index) => (
                <div
                  key={image.url}
                  className="image-item"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="image-preview">
                    <img src={image.url} alt={image.name} />
                  </div>
                  <div className="image-name">{image.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <footer className="footer">
        <div className="footer-content">
          <p>漫画阅读器 &copy; {new Date().getFullYear()} | Powered by React</p>
        </div>
      </footer>

      {selectedImageIndex !== null && (
        <FullscreenReader
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  );
}

export default App
