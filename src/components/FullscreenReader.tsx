import { useEffect, useState, useCallback, MouseEvent } from 'react';
import '../styles/FullscreenReader.css';

interface FullscreenReaderProps {
  images: Array<{ name: string; url: string; size: number; width: number; height: number }>;
  initialIndex: number;
  onClose: () => void;
}

export default function FullscreenReader({ images, initialIndex, onClose }: FullscreenReaderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isRightToLeft, setIsRightToLeft] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const readerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  }, []);

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
    // 退出全屏时同时关闭阅读器
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      }
    };
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          isRightToLeft ? navigateNext() : navigatePrev();
          break;
        case 'ArrowRight':
          isRightToLeft ? navigatePrev() : navigateNext();
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
  }, [currentIndex, onClose, navigatePrev, navigateNext, isRightToLeft]);

  // 重置视图
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // 处理鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.max(0.5, Math.min(scale + delta, 3));
    setScale(newScale);
  };

  // 处理鼠标按下事件，开始拖动
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) { // 只响应左键点击
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // 处理鼠标移动事件，计算拖动位置
  const handleMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({ x: newX, y: newY });
      }
    },
    [isDragging, dragStart]
  );

  // 处理鼠标释放事件，结束拖动
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加和移除全局鼠标事件监听
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 当前显示的图片
  const currentImage = images[currentIndex];

  return (
    <div 
      ref={readerRef}
      className="fullscreen-reader"
      onWheel={handleWheel}
    >
      <div className={`reader-controls ${isControlsVisible ? 'visible' : 'hidden'}`}>
        <button onClick={isRightToLeft ? navigateNext : navigatePrev} disabled={currentIndex === 0}>
          上一页
        </button>
        <span className="page-info">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={isRightToLeft ? navigatePrev : navigateNext} disabled={currentIndex === images.length - 1}>
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
        <button onClick={() => setIsRightToLeft(prev => !prev)}>
          {isRightToLeft ? '从左到右' : '从右到左'}
        </button>
        <span className="image-info">
          {currentImage.width}x{currentImage.height}px · {(currentImage.size / 1024).toFixed(1)}KB
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
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          draggable="false"
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  );
}