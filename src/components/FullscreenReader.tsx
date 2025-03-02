import { useEffect, useState, useCallback } from 'react';
import '../styles/FullscreenReader.css';

interface FullscreenReaderProps {
  images: Array<{ name: string; url: string; size: number; width: number; height: number }>;
  initialIndex: number;
  onClose: () => void;
}

export default function FullscreenReader({ images, initialIndex, onClose }: FullscreenReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [rotation, setRotation] = useState(0);

  const readerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  }, []);

  // 重置视图到初始状态
  const resetView = useCallback(() => {
    setRotation(0);
  }, []);

  // 统一的导航控制器
  const navigationController = useCallback((action: 'next' | 'prev' | 'reset' | 'close' | 'rotateLeft' | 'rotateRight') => {
    switch (action) {
      case 'next':
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
          resetView();
        }
        break;
      case 'prev':
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          resetView();
        }
        break;
      case 'reset':
        resetView();
        break;
      case 'close':
        onClose();
        break;
      case 'rotateLeft':
        setRotation(prev => (prev - 90) % 360);
        break;
      case 'rotateRight':
        setRotation(prev => (prev + 90) % 360);
        break;
    }
  }, [currentIndex, images.length, onClose, resetView]);

  // 处理鼠标移动和控制栏显示
  useEffect(() => {
    let hideTimeout: number;

    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(hideTimeout);
      hideTimeout = window.setTimeout(() => {
        setIsControlsVisible(false);
      }, 1000); // 1秒后隐藏
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, []);

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
          navigationController('prev');
          break;
        case 'ArrowRight':
          navigationController('next');
          break;
        case '0':
          navigationController('reset');
          break;
        case 'Escape':
          navigationController('close');
          break;
        case 'r':
          navigationController('rotateRight');
          break;
        case 'l':
          navigationController('rotateLeft');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigationController]);

  // 当前显示的图片
  const currentImage = images[currentIndex];

  return (
    <div 
      ref={readerRef}
      className="fullscreen-reader"
    >
      <div className={`reader-controls ${isControlsVisible ? 'visible' : 'hidden'}`}>
        <button onClick={() => navigationController('prev')} disabled={currentIndex === 0}>
          上一页
        </button>
        <span className="page-info">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={() => navigationController('next')} disabled={currentIndex === images.length - 1}>
          下一页
        </button>
        <button onClick={() => navigationController('reset')}>
          重置
        </button>
        <button onClick={() => navigationController('rotateLeft')}>
          向左旋转
        </button>
        <button onClick={() => navigationController('rotateRight')}>
          向右旋转
        </button>

        <span className="image-info">
          {currentImage.width}x{currentImage.height}px · {(currentImage.size / 1024).toFixed(1)}KB
        </span>
        <button onClick={onClose} className="close-button">
          关闭
        </button>
      </div>

      <div 
        className="image-container"
        onClick={() => navigationController('next')}
        onContextMenu={(e) => {
          e.preventDefault();
          navigationController('prev');
        }}
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          style={{
            transform: `rotate(${rotation}deg)`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
          draggable="false"
        />
      </div>
    </div>
  );
}