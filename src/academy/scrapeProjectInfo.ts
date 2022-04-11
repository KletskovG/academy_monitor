import puppeteer from "puppeteer";
import * as config from "./config";

function isCurrentUserRoot() {
  return process.getuid() == 0; // UID 0 is always root
}

async function scrapeCourse(link: string): Promise<boolean> {
  console.info("LAUNCHING PUPETEER");
  const browser = await puppeteer.launch({
    headless: true,
    args: isCurrentUserRoot() ? ["--no-sandbox"] : undefined
  });
  console.info("LAUNCHED PUPETEER");
  const page = await browser.newPage();
  
  await page.goto(link);
  await page.waitForTimeout(5000);
  console.log("CHECK FOR AUTH");  
  await page.type("#login-email", process.env.ACADEMY_EMAIL);
  await page.type("#login-password", process.env.ACADEMY_PWD);
  await page.click("input.button");
  await page.waitForNavigation();

  const isAuthFail = await page.evaluate(() => {
    return Boolean(document.querySelector("#login-email"));
  });

  if (isAuthFail) {
    await page.screenshot({ path: "dist/auth-error.png" });
    throw new Error("Academy scrape: AUTH ERROR");
  } else {
    const isProjectsPresented = await page.evaluate(() => {
      return Boolean(document.querySelector(".up-info--check .button--green"));
    });

    if (isProjectsPresented) {
      await browser.close();
      return true;
    }
    await browser.close();
    return false;
  }
}

export async function scrapeProjectInfo(): Promise<string> {
  let result = "";
  

  const courses = Object.keys(config.scrapeConfig);

  for (let i = 0; i < courses.length; i++) {
    const courseName = courses[i];
    const courseLink = config.scrapeConfig[courses[i]];
    const isProjectsPresented = await scrapeCourse(courseLink);

    if (isProjectsPresented) {
      result += `\n\n ${courseName} \n ${courseLink}`;
    } else {
      result += `\n\n ${courseName} \n No projects`
    }
  }

  return result;
}