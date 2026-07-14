import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Case, OperationType, FirestoreErrorInfo } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: 'manual_badge_system',
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveCase = async (caseData: Partial<Case>, userId: string, id?: string) => {
  const path = 'cases';
  try {
    const isUpdate = !!id;
    const caseRef = isUpdate ? doc(db, path, id) : doc(collection(db, path));
    
    const finalData = {
      ...caseData,
      userId: userId,
      updatedAt: serverTimestamp(),
      ...(isUpdate ? {} : { createdAt: serverTimestamp() })
    };

    if (isUpdate) {
      await updateDoc(caseRef, finalData);
    } else {
      await setDoc(caseRef, finalData);
    }
    return caseRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getCases = async (userId: string) => {
  const path = 'cases';
  try {
    const q = query(
      collection(db, path),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const deleteCase = async (id: string) => {
  const path = `cases/${id}`;
  try {
    await deleteDoc(doc(db, 'cases', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
