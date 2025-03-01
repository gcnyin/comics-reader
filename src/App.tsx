import { useState, ChangeEvent } from 'react'
import './App.css'
import FullscreenReader from './components/FullscreenReader'
import ImageListView from './components/ImageListView'

interface ImageFile {
  name: string;
  url: string;
  size?: number;
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleFolderSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        imageFiles.push({
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size
        });
      }
    }

    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));
    setImages(imageFiles);
  };

  return (
    <div className="app">
      <div className="toolbar">
        <input
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
        />
        <div className="view-toggle">
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            网格视图
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            列表视图
          </button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="image-grid">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="image-item"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img src={image.url} alt={image.name} />
              <div className="image-name">{image.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <ImageListView 
          images={images} 
          onImageClick={(index) => setSelectedImageIndex(index)} 
        />
      )}
      
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
