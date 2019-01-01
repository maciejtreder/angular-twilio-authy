import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import {enableProdMode} from '@angular/core';
import {ngExpressEngine} from '@nguniversal/express-engine';
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';
 
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as compression from 'compression';
 
enableProdMode();
 
export const app = express();
 
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');
 
app.engine('html', ngExpressEngine({
 bootstrap: AppServerModuleNgFactory,
 providers: [
   provideModuleMap(LAZY_MODULE_MAP)
 ]
}));
 
app.set('view engine', 'html');
app.set('views', './dist/browser');
 
app.post('/auth/login', (req, res) => {
 if (req.body.login === 'foo' && req.body.password === 'bar') {
   res.status(200).send({login: 'foo'});
 } else {
   res.status(401).send('Bad credentials');
 }
});
 
app.get('*.*', express.static('./dist/browser', {
 maxAge: '1y'
}));
 
app.get('/*', (req, res) => {
 res.render('index', {req, res}, (err, html) => {
   if (html) {
     res.send(html);
   } else {
     console.error(err);
     res.send(err);
   }
 });
});

