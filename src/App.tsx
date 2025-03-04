import { useState, ChangeEvent, useEffect } from 'react'
import './App.css'
import './styles/theme.css'
import FullscreenReader from './components/FullscreenReader'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

interface ImageFile {
  name: string
  url: string
  size: number
  width: number
  height: number
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.url)
      })
    }
  }, [images])

  const handleFolderSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const imageFiles: ImageFile[] = []
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        const img = new Image()
        const imageFile = await new Promise<ImageFile>((resolve) => {
          img.onload = () => {
            resolve({
              name: file.name,
              url: url,
              size: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight,
            })
          }
          img.src = url
        })
        imageFiles.push(imageFile)
      }
    }

    imageFiles.sort((a, b) => a.name.localeCompare(b.name))

    images.forEach((image) => {
      URL.revokeObjectURL(image.url)
    })

    setImages(imageFiles)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files) {
      handleFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleFiles = async (files: FileList) => {
    setIsLoading(true)
    setError(null)
    const imageFiles: ImageFile[] = []

    if (files.length === 0) {
      setIsLoading(false)
      setError('未选择任何文件')
      return
    }

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        const img = new Image()
        const imageFile = await new Promise<ImageFile>((resolve) => {
          img.onload = () => {
            resolve({
              name: file.name,
              url: url,
              size: file.size,
              width: img.naturalWidth,
              height: img.naturalHeight,
            })
          }
          img.onerror = () => {
            resolve({
              name: file.name,
              url: '',
              size: 0,
              width: 0,
              height: 0,
            })
          }
          img.src = url
        })
        if (imageFile.url) {
          imageFiles.push(imageFile)
        }
      } else {
        setError('检测到非图像文件，已跳过')
      }
    }

    imageFiles.sort((a, b) => a.name.localeCompare(b.name))

    images.forEach((image) => {
      URL.revokeObjectURL(image.url)
    })

    setImages(imageFiles)
    setIsLoading(false)
  }

  return (
    <div className="app">
      <h1>漫画阅读器</h1>
      <div className="toolbar">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="切换主题"
        >
          {theme === 'light' ? <MdDarkMode /> : <MdLightMode />}
          {theme === 'light' ? '深色模式' : '浅色模式'}
        </button>
        <label className="file-select-button">
          选择文件夹
          <input
            {...({
              type: 'file',
              webkitdirectory: '',
              directory: '',
              multiple: true,
              onChange: handleFolderSelect,
              style: { display: 'none' },
            } as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </label>
      </div>

      {isLoading && <div className="loading">加载中...</div>}
      {error && <div className="error">{error}</div>}

      {!isLoading && (
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {images.length === 0 && (
            <p>将文件夹拖放到此处，或点击“选择文件夹”按钮</p>
          )}
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
        </div>
      )}

      {selectedImageIndex !== null && (
        <FullscreenReader
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </div>
  )
}

export default App
