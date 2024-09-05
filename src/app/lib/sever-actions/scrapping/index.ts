import puppeteer, { Page } from 'puppeteer';
import { filesToDownload, linksToFollow } from '../../constants';

export async function fetchLinksFromCanadaOpen() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Navigate to the main page and filter links
    await page.goto('https://open.canada.ca/en/proactive-disclosure', { waitUntil: 'networkidle2' });

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(anchor => ({
        text: anchor.textContent?.trim() || 'No text available',
        href: anchor.href,
      }));
    });


    const filteredLinks = links.filter(link =>
      linksToFollow.some(follow => follow.text === link.text)
    );
    for (const link of filteredLinks) {
      await processLink(page, link.href);
    }
    return filteredLinks
  } catch (error) {
    console.error('Error fetching links:', error);
  } finally {
    await browser.close();
  }
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

async function processLink(page: Page, link: string) {
  try {
    await page.goto(link, { waitUntil: 'networkidle2' });
    const datasetLink = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a');
      for (const anchor of anchors) {
        const textContent = anchor.textContent?.trim().toLowerCase() || '';
        if (textContent.includes('dataset')) {
          return anchor.href;
        }
      }
      
      return null;
    });

    console.log("Datasets link:", datasetLink);
    if (datasetLink) {
      await page.goto(datasetLink, { waitUntil: 'networkidle2' });
      const links = await page.evaluate(() => {
        const allLinks: { text: string; href: string }[] = [];
        const resourceList = document.querySelectorAll('#resource_title a');
        resourceList.forEach((element: Element) => {
          const anchor = element as HTMLAnchorElement;
          allLinks.push({
            text: anchor.textContent?.trim() || '',
            href: anchor.href
          });
        });
        return allLinks;
      });

      const filteredDowloadPageLinks= links.filter(link =>
        filesToDownload.some(file => normalizeText(file.text) == normalizeText(link.text))
      );
      console.log("Links:", links);
      console.log("Links in the resource-list filteredd:", filteredDowloadPageLinks);
    } else {
      console.log('No dataset link found on this page.');
    }
  
  } catch (error) {
    console.error(`Error processing link ${link}:`, error);
  }
}





// import puppeteer from "puppeteer";
// import { linksToFollow } from "../../constants";

// export async function fetchLinksFromCanadaOpen() {
//     // Launch the browser
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     try {
//         await page.goto('https://open.canada.ca/en/proactive-disclosure', {
//             waitUntil: 'networkidle2',
//         });
//         const links = await page.evaluate(() => {
//             return Array.from(document.querySelectorAll('a')).map(anchor => ({
//                 text: anchor.textContent?.trim() || 'No text available',
//                 href: anchor.href,
//             }));
//         });
//         const filteredLinks = links.filter(link =>
//             linksToFollow.some(follow => follow.text === link.text)
//         );
//         return filteredLinks;
//     } catch (error) {
//         console.error('Error fetching links:', error);
//         return [];
//     } finally {
//         // Close the browser
//         await browser.close();
//     }
// }