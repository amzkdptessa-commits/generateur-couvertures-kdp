export type GalleryItem = {
  kind: 'fullcover' | 'background';
  collection: string;
  category: string;
  sub?: string | null;
  catSlug: string;
  subSlug?: string | null;
  path: string;
  filename: string;
  size: number;
  mtime: string;
  url: string;
  openInGen: string;
  tags: string[];
};

export async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await fetch('/gallery.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load gallery.json');
  return res.json();
}
