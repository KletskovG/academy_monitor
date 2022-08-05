import { Request, Response } from "express";
import { getMIRCurrencyCourse } from "scrapper/MIR";
import { sendNotification } from "telegram";
import { getCurrentDate } from "utils/getCurrentDate";
import { getCurrencyValue } from "lib";
import { CBR_COURSE_URL } from "const";
import got from "got";

export async function getMIRCurrencyHandler(_: Request, res: Response) {
  const requestDate = getCurrentDate();
  Promise.all([
    got(`${CBR_COURSE_URL}${requestDate}`),
    getMIRCurrencyCourse(),
  ])
    .then(values => {
      const CB = getCurrencyValue(values[0].body, "TRY");
      return [CB, values[1]];
    })
    .then(rates => {
      console.log(rates[0]);
      const notification = `
        MIR RATE
        ${rates[1]}

        CB RATE
        ${parseInt(rates[0], 10) / 10}
      `;

      res.send(notification).status(200);
      sendNotification(notification);
    })
    .catch(err => {
      console.log(err);
      res.send(`MIR RATE ERROR: ${err}`).status(500);
      sendNotification(`MIR RATE ERROR: ${err}`);
    });
}
