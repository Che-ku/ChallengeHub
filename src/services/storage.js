import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { firebaseStorage } from '../config/firebase';
export async function uploadImage(fileUri, storagePath) {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const storageRef = ref(firebaseStorage, storagePath);
    const snapshot = await uploadBytes(storageRef, blob);
    return getDownloadURL(snapshot.ref);
}
export async function removeImage(storagePath) {
    await deleteObject(ref(firebaseStorage, storagePath));
}
