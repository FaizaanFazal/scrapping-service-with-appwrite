'use client'
import React, { useEffect } from "react";
import { createFullDataset } from "./lib/sever-actions/app-write/create-ops";
import { AllCategoriesCreation, listMajorCategories } from "./lib/sever-actions/app-write/creating-categories";
import { listAllDocumentsOfAllDatasets } from "./lib/sever-actions/app-write/get-list";
import { fetchLinksFromCanadaOpen } from "./lib/sever-actions/scrapping";
import { startBatchProcess } from "./lib/sever-actions/app-write/add-dataset";

export default function Home() {

  useEffect(() => {
    async function fetchData() {
      // Fetch links from Canada Open
      // const fetchedLinks = await fetchLinksFromCanadaOpen();
      // console.log(fetchedLinks);

      // // List all documents from datasets
      // const fetchedDocuments = await listAllDocumentsOfAllDatasets('66d7dd4400048f8fbd2f');
      // console.log(fetchedDocuments);

      // // Create the dataset if it doesn't exist
      // await createFullDataset('public/datasets/contracts.json');
      // console.log(true);

      // Create categories
      // await AllCategoriesCreation(
      //   'Proactive disclosure',
      //   'Proactively published government information for transparency and accountability.',
      //   [],
      //   'Contracts, spending and operations',
      //   '',
      //   'Contracts over $10,000',
      //   'Contracts over $10,000, standing offer agreements, supply arrangements'
      // );

      // List all major categories and set them to the state
      // const listedCategories = await listMajorCategories();
      // console.log(listedCategories);
      startBatchProcess('66d8593f002d6699dcad' ,'public/datasets/contracts.json',)//document id
    }

    // Call the async function inside useEffect
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ul>
        {/* {links?.map((link, index) => (
          <li key={index}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.text}
            </a>
          </li>
        ))} */}
      </ul>
    </main>
  );
}



