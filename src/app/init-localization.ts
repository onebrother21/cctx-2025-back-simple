import { Express } from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as i18nextMiddleware from 'i18next-http-middleware';
import path from 'path';

import Utils from '../utils';

const i18nextconfig = {
  backend: {
    loadPath: path.join(__dirname,'../utils/locales/{{lng}}/translation.json'),
    //addPath: path.join(__dirname,'../utils/locales/ar/{{ns}}.json'),
  },
  fallbackLng: 'en',
  preload: ['en'],
  supportedLngs: ['en'],
  cleanCode: true,
};

export default function (app:Express) {
  i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init(i18nextconfig,(err, t) => {
    if (err) return console.log('something went wrong loading', err);
    Utils.print("debug","i18next","Localization set",t('api.ready')); 
  });
  app.use(i18nextMiddleware.handle(i18next,{}));
}