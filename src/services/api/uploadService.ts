/**
 * Image Upload Service
 * Uploads images to Imgur via their anonymous API
 * Docs: https://api.imgur.com/endpoints/image
 */

import { File } from 'expo-file-system';
import { Platform } from 'react-native';

const IMGUR_API_URL = 'https://api.imgur.com/3/image';
const IMGUR_CLIENT_ID = 'anonymous';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function fileToBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return uri.split(',')[1] || '';
  }
  const file = new File(uri);
  return await file.base64();
}

export async function uploadImage(uri: string): Promise<UploadResult> {
  try {
    const base64Data = await fileToBase64(uri);

    if (!base64Data) {
      return { success: false, error: 'Không thể đọc dữ liệu ảnh' };
    }

    const formData = new FormData();
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('image', blob);
      formData.append('type', 'blob');
    } else {
      formData.append('image', base64Data);
      formData.append('type', 'base64');
    }

    const response = await fetch(IMGUR_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return { success: true, url: data.data.link };
    }

    return { success: false, error: data.data?.error || 'Upload thất bại' };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload thất bại',
    };
  }
}
