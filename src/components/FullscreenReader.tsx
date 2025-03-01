import { useEffect, useState, useCallback } from 'react';
import '../styles/FullscreenReader.css';

interface FullscreenReaderProps {
  images: Array<{ name: string; url: string; size: number; width?: number; height?: number }>;
  initialIndex: number;
  onClose: () => void;
}

export default function FullscreenReader({ images, initialIndex, onClose }: FullscreenReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  // 处理鼠标移动和控制栏显示
  useEffect(() => {
    let hideTimeout: number;

    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000); // 3秒后隐藏
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, []);

  // 导航到上一张图片
  const navigatePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetView();
    }
  }, [currentIndex]);

  // 导航到下一张图片
  const navigateNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetView();
    }
  }, [currentIndex, images.length]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        case '+':
          setScale(prev => Math.min(prev + 0.1, 3));
          break;
        case '-':
          setScale(prev => Math.max(prev - 0.1, 0.5));
          break;
        case '0':
          setScale(1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose, navigatePrev, navigateNext]);

  // 重置视图
  const resetView = () => {
    setScale(1);
  };



  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(scale + delta, 3));
    setScale(newScale);
  };

  // 当前显示的图片
  const currentImage = images[currentIndex];

  return (
    <div 
      className="fullscreen-reader"
      onWheel={handleWheel}
    >
      <div className={`reader-controls ${isControlsVisible ? 'visible' : 'hidden'}`}>
        <button onClick={navigatePrev} disabled={currentIndex === 0}>
          上一页
        </button>
        <span className="page-info">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={navigateNext} disabled={currentIndex === images.length - 1}>
          下一页
        </button>
        <button onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}>
          放大
        </button>
        <button onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}>
          缩小
        </button>
        <button onClick={resetView}>
          重置
        </button>
        <span className="image-info">
          {currentImage.width && currentImage.height ? `${currentImage.width}x${currentImage.height}px` : ''}
          {currentImage.size ? ` | ${(currentImage.size / 1024).toFixed(1)}KB` : ''}
        </span>
        <button onClick={onClose} className="close-button">
          关闭
        </button>
      </div>

      <div className="image-container">
        <img
          src={currentImage.url}
          alt={currentImage.name}
          style={{
            transform: `scale(${scale})`
          }}
          draggable="false"
        />
      </div>
    </div>
  );
}