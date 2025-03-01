import React from 'react';
import '../styles/ImageListView.css';

interface ImageListViewProps {
  images: Array<{ name: string; url: string; size?: number }>;
  onImageClick: (index: number) => void;
}

export default function ImageListView({ images, onImageClick }: ImageListViewProps) {
  return (
    <div className="image-list-view">
      <table>
        <thead>
          <tr>
            <th>预览</th>
            <th>文件名</th>
            <th>大小</th>
          </tr>
        </thead>
        <tbody>
          {images.map((image, index) => (
            <tr key={image.name} onClick={() => onImageClick(index)} className="image-list-item">
              <td className="preview-cell">
                <img src={image.url} alt={image.name} className="preview-image" />
              </td>
              <td>{image.name}</td>
              <td>{image.size ? `${(image.size / 1024 / 1024).toFixed(2)} MB` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}