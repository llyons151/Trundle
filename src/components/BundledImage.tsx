import { Image, type ImageProps } from 'expo-image';

type Props = Omit<ImageProps, 'source' | 'placeholder'> & { source: number };

// Use the same bundled artwork during loading so remounting a page never
// replaces a cached image with an empty frame or a differently sized placeholder.
export function BundledImage({ source, contentFit = 'contain', ...props }: Props) {
  return (
    <Image
      {...props}
      source={source}
      placeholder={source}
      contentFit={contentFit}
      placeholderContentFit={contentFit}
      cachePolicy="memory-disk"
      transition={0}
    />
  );
}
