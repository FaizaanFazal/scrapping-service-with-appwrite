'use server'
// // lib/appwrite-admin.ts
// import { Client, Databases } from 'appwrite';

// const client = new Client();

// client
//     .setEndpoint(process.env.NEXT_PUBLIC_API_KEY as string) // API Endpoint
//     .setProject(process.env.NEXT_PUBLIC_PROJECT_ID as string) // Project ID

// export const databases = new Databases(client);
// export default client;


import { Account, Client, Databases, Teams, Users } from 'node-appwrite';

const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || '')
    .setKey(process.env.NEXT_PUBLIC_API_KEY || '');

  return {
    get account() {
      return new Account(client);
    },

    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
    get teams() {
      return new Teams(client);
    }
  };
};


const createSessionClient = async (session: string) => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT ||  '')
    .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || '');

  if (session) {
    client.setSession(session);
  }

  return {
    get account() {
      return new Account(client);
    },

    get databases() {
      return new Databases(client);
    },
  };
};

export { createAdminClient, createSessionClient };
