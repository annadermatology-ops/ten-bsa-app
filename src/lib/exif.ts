import exifr from 'exifr';

export interface PhotoMetadata {
  width?: number;
  height?: number;
  cameraMake?: string;
  cameraModel?: string;
  dateTaken?: string;
  focalLength?: number;
  fNumber?: number;
  exposureTime?: string;
  iso?: number;
  flash?: string;
  orientation?: number;
  software?: string;
  gpsRemoved?: boolean;
}

/**
 * Extract key EXIF metadata from a File object.
 * GPS data is intentionally excluded for privacy.
 * Returns null if no EXIF data is available.
 */
export async function extractPhotoMetadata(file: File): Promise<PhotoMetadata | null> {
  try {
    const parsed = await exifr.parse(file, {
      // Only read the tags we care about
      pick: [
        'ImageWidth', 'ImageHeight', 'ExifImageWidth', 'ExifImageHeight',
        'Make', 'Model',
        'DateTimeOriginal', 'CreateDate',
        'FocalLength', 'FocalLengthIn35mmFormat',
        'FNumber', 'ExposureTime', 'ISO', 'ISOSpeedRatings',
        'Flash', 'Orientation', 'Software',
      ],
      // Exclude GPS for patient privacy
      gps: false,
    });

    if (!parsed) return null;

    const meta: PhotoMetadata = {};

    // Dimensions
    const w = parsed.ExifImageWidth || parsed.ImageWidth;
    const h = parsed.ExifImageHeight || parsed.ImageHeight;
    if (w) meta.width = w;
    if (h) meta.height = h;

    // Camera
    if (parsed.Make) meta.cameraMake = String(parsed.Make).trim();
    if (parsed.Model) meta.cameraModel = String(parsed.Model).trim();

    // Date taken
    const dt = parsed.DateTimeOriginal || parsed.CreateDate;
    if (dt instanceof Date) {
      meta.dateTaken = dt.toISOString();
    } else if (dt) {
      meta.dateTaken = String(dt);
    }

    // Lens / exposure
    if (parsed.FocalLength) meta.focalLength = parsed.FocalLength;
    if (parsed.FNumber) meta.fNumber = parsed.FNumber;
    if (parsed.ExposureTime) {
      const et = parsed.ExposureTime;
      meta.exposureTime = et < 1 ? `1/${Math.round(1 / et)}` : `${et}`;
    }
    const iso = parsed.ISO || parsed.ISOSpeedRatings;
    if (iso) meta.iso = Array.isArray(iso) ? iso[0] : iso;

    // Flash
    if (parsed.Flash !== undefined) {
      if (typeof parsed.Flash === 'string') {
        meta.flash = parsed.Flash;
      } else if (typeof parsed.Flash === 'number') {
        meta.flash = parsed.Flash & 1 ? 'Fired' : 'No flash';
      }
    }

    if (parsed.Orientation) meta.orientation = parsed.Orientation;
    if (parsed.Software) meta.software = String(parsed.Software).trim();

    meta.gpsRemoved = true;

    // Only return if we got at least one useful field
    const useful = Object.keys(meta).filter(k => k !== 'gpsRemoved');
    return useful.length > 0 ? meta : null;
  } catch {
    // EXIF parsing failed — not all images have EXIF
    return null;
  }
}
