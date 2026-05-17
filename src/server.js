const express = require('express');
const cors = require('cors');
const { sendTrackingEmail } = require('./mailer');

const app = express();
