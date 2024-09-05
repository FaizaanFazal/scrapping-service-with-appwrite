import { Client, Databases } from 'appwrite';

const client = new Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string) // API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string); // Project ID

const databases = new Databases(client);

export async function createDocumentInAppwrite(collectionId: string, data: any) {
  try {
    // Creating the document in the specified collection with the provided data
    const document = await databases.createDocument(
      collectionId, 
      'unique()',   
      data,         
      [
        {
          header: 'X-Appwrite-Key',
          value: process.env.APPWRITE_API_KEY as string, 
        },
      ]
    );

    return document; 

  } catch (error) {
    console.error('Error creating document in Appwrite:', error);
    throw new Error('Failed to create document');
  }
}
