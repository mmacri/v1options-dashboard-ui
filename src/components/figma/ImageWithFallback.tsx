import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function ImageWithFallback({ fallback, ...props }: Props) {
  const [src, setSrc] = useState(props.src);
  return (
    <img
      {...props}
      src={src}
      onError={() => {
        if (fallback) setSrc(fallback);
      }}
    />
  );
}
