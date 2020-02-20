require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const uuid = require('uuid/v4');
const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());


const addresses = [];

app.get('/address', (req, res) => {
  res.send(addresses);
});

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
}


app.post('/address', validateBearerToken, (req, res) => {
  //get the data
  const { firstName, lastName, address1, address2=false, city, state, zip} = req.query;

  //validation codes: 
  if (!firstName) {
    return res
      .status(400)
      .send('First name required');
  }

  if (!lastName) {
    return res
      .status(400)
      .send('Last name required');
  }

  if (!address1) {
    return res
      .status(400)
      .send('Address is required');
  }

  if (!city) {
    return res
      .status(400)
      .send('City is required');
  }

  if (!state) {
    return res
      .status(400)
      .send('State is required');
  }

  if (!zip) {
    return res
      .status(400)
      .send('Zip code is required');
  }

  const stateList = [
    'AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UM', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY' 
  ];

  if (!stateList.includes(state)) {
    return res
      .status(400)
      .send('Not a valid state')
  }

  const numZip = parseFloat(zip);

  if (zip.length !== 5 && typeof numZip !== 'number') {
    return res
      .status(400)
      .send('Zip code must be 5-digit number');
  }

  const id = uuid();
  const newAddress = {
    id, 
    firstName, 
    lastName, 
    address1, 
    address2, 
    city, 
    state, 
    zip
  };

  addresses.push(newAddress);

  res
    .status(201)
    .send(addresses);
});

app.delete('/address/:id', validateBearerToken, (req,res) => {
  const index = addresses.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return res
      .status(404)
      .send('Address not found');
  }

  addresses.splice(index, 1);
  res.send('Deleted');
})

// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next) { 
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});



module.exports = app;