import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import {enableProdMode} from '@angular/core';
import {ngExpressEngine} from '@nguniversal/express-engine';
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';
 
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
 
const API_KEY = 'Production API key';
const authy = require('authy')(API_KEY);
 
enableProdMode();
 
export const app = express();
 
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
 
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
   authy.send_approval_request('authy id', {
       message: 'Request to login to Angular two factor authentication with Twilio'
     }, null, null,  function(err, authResponse) {
       if (err) {
         res.status(400).send('Bad Request');
       } else {
         res.status(200).send({token: authResponse.approval_request.uuid});
       }
   });
 } else {
   res.status(401).send('Bad credentials');
 }
});
 
app.get('/auth/status', (req, res) => {
  authy.check_approval_status(req.headers.token, (err, authResponse) => {
    if (err) {
      res.status(400).send('Bad Request.');
    } else {
      if (authResponse.approval_request.status === 'approved') {
        res.cookie('authentication', 'super-encrypted-value-indicating-that-user-is-authenticated!', {
          maxAge: 5 * 60 * 60,
          httpOnly: true
        });
        if (req.headers.remember === 'true') {
         res.cookie('remember', authResponse.approval_request._authy_id, {
           maxAge: 10 * 365 * 24 * 60 * 60,
           httpOnly: true
         });
       }
      }
      res.status(200).send({status: authResponse.approval_request.status});
    }
  });
});
 
app.get('/auth/isLogged', (req, res) => {
 res.status(200).send({authenticated: req.cookies.authentication === 'super-encrypted-value-indicating-that-user-is-authenticated!'});
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

