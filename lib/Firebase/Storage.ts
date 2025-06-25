import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './Config';

// Upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Upload a resume
export const uploadResume = async (
  uid: string,
  file: File
): Promise<string> => {
  const fileExtension = file.name.split('.').pop();
  const path = `resumes/${uid}/resume-${Date.now()}.${fileExtension}`;
  return uploadFile(file, path);
};