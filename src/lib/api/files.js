import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const CV_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

/** Opens the file picker. Returns the chosen résumés, or [] when the user cancels. */
export async function pickCvFiles({ multiple = false } = {}) {
  const result = await DocumentPicker.getDocumentAsync({
    type: CV_MIME_TYPES,
    multiple,
    // The web default reads every file into a base64 string nobody uses.
    base64: false,
  });
  return result.canceled ? [] : result.assets;
}

export function appendFile(formData, field, asset) {
  // Web assets carry a real File; native FormData takes the { uri, name, type } descriptor.
  formData.append(
    field,
    Platform.OS === 'web' ? asset.file : { uri: asset.uri, name: asset.name, type: asset.mimeType },
  );
}
