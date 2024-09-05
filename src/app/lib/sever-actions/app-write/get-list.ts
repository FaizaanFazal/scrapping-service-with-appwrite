import { Query } from "node-appwrite";
import { createAdminClient } from "../../app-write/appwrite-admin";

export const listAllDocumentsOfAllDatasets = async (collectionId: string) => {
  try {
    const { databases } = await createAdminClient();
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || '', // Database ID
      collectionId
    );
    
    return response.documents; // Returns the array of documents
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error; // Re-throw error after logging
  }
};

// export const getSubCategoriesByMajorId = async (id: string) => {
//     const { databases } = await createAdminClient();
//     try {
//       const data = await databases.listDocuments('66d6ed5c003dd25fb6f0', '66d6ee3700099dc89393', [
//         Query.equal('category_id', id)
//       ]);
//       console.log(data)
//       return data.documents;
//     } catch (error) {
//       console.log(error);
//       return null;
//     }
//   }
  