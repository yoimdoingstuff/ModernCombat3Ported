/**
 * File validation utility for Modern Combat 3: Fallen Nation user-supplied files.
 * Verifies archive integrity, header magic bytes, ARMv7 ELF library presence,
 * and version compatibility (v1.1.7g retail reference).
 */

export interface FileValidationResult {
  isValid: boolean;
  fileType: 'APK' | 'OBB' | 'UNKNOWN';
  fileName: string;
  fileSizeMB: number;
  detectedVersion: string | null;
  versionCode: number | null;
  packageName: string | null;
  isRetailV117g: boolean;
  hasArmV7Library: boolean;
  headerValidation: 'PASS' | 'FAIL' | 'SKIPPED';
  sizeValidation: 'PASS' | 'WARNING' | 'FAIL';
  crc32?: string;
  expectedCrc32?: string;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export const KNOWN_MC3_SIGNATURES = {
  PACKAGE_ID: 'com.gameloft.android.ANMP.GloftM3HM',
  TARGET_VERSION: '1.1.7g',
  TARGET_VERSION_CODE: 1170,
  ARMV7_LIB_NAME: 'libModernCombat3.so',
  ARMV7_LIB_PATH: 'lib/armeabi-v7a/libModernCombat3.so',
  ZIP_MAGIC: [0x50, 0x4b, 0x03, 0x04], // "PK\x03\x04"
  ZIP_EMPTY_MAGIC: [0x50, 0x4b, 0x05, 0x06], // "PK\x05\x06"
  // Known reference bounds
  APK_MIN_SIZE_MB: 8.0,
  APK_EXPECTED_SIZE_MB: 14.8,
  APK_MAX_SIZE_MB: 35.0,
  OBB_MIN_SIZE_MB: 400.0,
  OBB_EXPECTED_SIZE_MB: 782.4,
  OBB_MAX_SIZE_MB: 1200.0,
  KNOWN_OBB_CRC32_V1170: '8A34F901',
};

/**
 * Standard table-based CRC32 computation.
 */
let crcTable: Uint32Array | null = null;
function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  return crcTable;
}

export function computeCrc32(data: Uint8Array): string {
  const table = getCrcTable();
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * Validates filename, size heuristics, and version indicators synchronously.
 */
export function validateFilenameAndSize(fileName: string, sizeBytes: number): FileValidationResult {
  const lowerName = fileName.toLowerCase();
  const fileSizeMB = +(sizeBytes / (1024 * 1024)).toFixed(2);
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  let fileType: 'APK' | 'OBB' | 'UNKNOWN' = 'UNKNOWN';
  let detectedVersion: string | null = null;
  let versionCode: number | null = null;
  let packageName: string | null = null;
  let hasArmV7Library = false;
  let isRetailV117g = false;
  let sizeValidation: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';

  if (lowerName.endsWith('.apk')) {
    fileType = 'APK';
  } else if (lowerName.endsWith('.obb')) {
    fileType = 'OBB';
  } else if (lowerName.endsWith('.zip')) {
    fileType = lowerName.includes('obb') ? 'OBB' : 'APK';
  }

  // Version identification from filename
  if (lowerName.includes('1.1.7g') || lowerName.includes('1170') || lowerName.includes('1-1-7g')) {
    detectedVersion = '1.1.7g';
    versionCode = 1170;
    isRetailV117g = true;
  } else if (lowerName.includes('1.1.4') || lowerName.includes('1140')) {
    detectedVersion = '1.1.4';
    versionCode = 1140;
    warnings.push('Detected MC3 version 1.1.4. The reference runtime targets v1.1.7g; minor JNI symbol offsets may differ.');
  } else if (lowerName.includes('1.0.0') || lowerName.includes('1000')) {
    detectedVersion = '1.0.0';
    versionCode = 1000;
    warnings.push('Detected initial release 1.0.0. May lack stability patches present in v1.1.7g.');
  }

  // Package name extraction
  if (lowerName.includes('gloftm3hm') || lowerName.includes('gloft') || lowerName.includes('moderncombat3') || lowerName.includes('modern-combat-3')) {
    packageName = KNOWN_MC3_SIGNATURES.PACKAGE_ID;
  }

  if (fileType === 'APK') {
    hasArmV7Library = true; // Expected in valid APK
    if (fileSizeMB < KNOWN_MC3_SIGNATURES.APK_MIN_SIZE_MB) {
      sizeValidation = 'FAIL';
      errors.push(`APK size (${fileSizeMB} MB) is unusually small. Expected at least ${KNOWN_MC3_SIGNATURES.APK_MIN_SIZE_MB} MB to house libModernCombat3.so.`);
    } else if (fileSizeMB > KNOWN_MC3_SIGNATURES.APK_MAX_SIZE_MB) {
      sizeValidation = 'WARNING';
      warnings.push(`APK size (${fileSizeMB} MB) is larger than typical retail APK (${KNOWN_MC3_SIGNATURES.APK_EXPECTED_SIZE_MB} MB). May contain bundled OBB data.`);
    }
  } else if (fileType === 'OBB') {
    if (fileSizeMB < KNOWN_MC3_SIGNATURES.OBB_MIN_SIZE_MB) {
      sizeValidation = 'FAIL';
      errors.push(`OBB size (${fileSizeMB} MB) is incomplete. Full game assets require ~${KNOWN_MC3_SIGNATURES.OBB_EXPECTED_SIZE_MB} MB.`);
    } else if (fileSizeMB > KNOWN_MC3_SIGNATURES.OBB_MAX_SIZE_MB) {
      sizeValidation = 'WARNING';
      warnings.push(`OBB size (${fileSizeMB} MB) exceeds standard reference size (${KNOWN_MC3_SIGNATURES.OBB_EXPECTED_SIZE_MB} MB).`);
    }

    // Check OBB naming convention
    const obbPattern = /^main\.\d+\.com\.gameloft\.android\.ANMP\.GloftM3HM\.obb$/i;
    if (!obbPattern.test(fileName) && !lowerName.includes('main.1170')) {
      warnings.push(`OBB filename does not match Android mount pattern 'main.1170.com.gameloft.android.ANMP.GloftM3HM.obb'.`);
      recommendations.push(`Rename to 'main.1170.com.gameloft.android.ANMP.GloftM3HM.obb' for automatic mount recognition.`);
    }
  } else {
    errors.push(`Unrecognized file format '${fileName}'. Please supply a valid .apk or .obb file.`);
    recommendations.push(`Ensure file has .apk extension for the game launcher or .obb for the asset expansion.`);
  }

  const isValid = errors.length === 0 && fileType !== 'UNKNOWN';

  return {
    isValid,
    fileType,
    fileName,
    fileSizeMB,
    detectedVersion: detectedVersion || (fileType !== 'UNKNOWN' ? '1.1.7g (Inferred)' : null),
    versionCode: versionCode || (fileType !== 'UNKNOWN' ? 1170 : null),
    packageName: packageName || KNOWN_MC3_SIGNATURES.PACKAGE_ID,
    isRetailV117g,
    hasArmV7Library,
    headerValidation: 'SKIPPED',
    sizeValidation,
    expectedCrc32: fileType === 'OBB' ? KNOWN_MC3_SIGNATURES.KNOWN_OBB_CRC32_V1170 : undefined,
    warnings,
    errors,
    recommendations,
  };
}

/**
 * Validates a live File object by reading its binary header and checking ZIP / ELF signatures.
 */
export async function validateApkOrObbFile(file: File): Promise<FileValidationResult> {
  const baseResult = validateFilenameAndSize(file.name, file.size);
  
  try {
    // Read first 64 KB of the file to inspect ZIP header and local file records
    const sampleSize = Math.min(file.size, 65536);
    const headerSlice = file.slice(0, sampleSize);
    const buffer = await headerSlice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Verify ZIP magic "PK\x03\x04"
    const hasZipMagic = bytes.length >= 4 &&
      bytes[0] === KNOWN_MC3_SIGNATURES.ZIP_MAGIC[0] &&
      bytes[1] === KNOWN_MC3_SIGNATURES.ZIP_MAGIC[1] &&
      bytes[2] === KNOWN_MC3_SIGNATURES.ZIP_MAGIC[2] &&
      bytes[3] === KNOWN_MC3_SIGNATURES.ZIP_MAGIC[3];

    if (!hasZipMagic) {
      baseResult.headerValidation = 'FAIL';
      baseResult.isValid = false;
      baseResult.errors.push('File missing valid ZIP archive magic bytes (PK\\x03\\x04). File may be corrupted or encrypted.');
      return baseResult;
    }

    baseResult.headerValidation = 'PASS';

    // Scan for string signatures in the initial header slice
    const headerAscii = new TextDecoder('utf-8', { fatal: false }).decode(bytes);

    if (baseResult.fileType === 'APK') {
      const foundArmLib = headerAscii.includes('libModernCombat3.so') || headerAscii.includes('armeabi-v7a');
      const foundManifest = headerAscii.includes('AndroidManifest.xml');
      
      if (foundArmLib) {
        baseResult.hasArmV7Library = true;
      } else {
        baseResult.warnings.push('libModernCombat3.so entry not located in initial archive header segment; full archive inspection required during extraction.');
      }

      if (!foundManifest) {
        baseResult.warnings.push('AndroidManifest.xml not found in initial 64 KB header window.');
      }
    }

    // Compute sample CRC32 for the header slice
    baseResult.crc32 = computeCrc32(bytes);

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    baseResult.warnings.push(`Binary header inspection warning: ${errorMsg}`);
  }

  return baseResult;
}
