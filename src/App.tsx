import { useState, ChangeEvent } from 'react'
import './App.css'
import FullscreenReader from './components/FullscreenReader'

interface ImageFile {
  name: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleFolderSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: ImageFile[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        const imageFile: ImageFile = {
          name: file.name,
          url: url,
          size: file.size
        };

        // 获取图片的宽度和高度
        const img = new Image();
        img.onload = () => {
          imageFile.width = img.width;
          imageFile.height = img.height;
          // 强制更新状态以反映新的宽高信息
          setImages(prev => [...prev]);
        };
        img.src = url;

        imageFiles.push(imageFile);
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
          {...{
            type: "file",
            webkitdirectory: "",
            directory: "",
            multiple: true,
            onChange: handleFolderSelect
          } as React.InputHTMLAttributes<HTMLInputElement>}
        />
      </div>

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
