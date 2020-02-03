const express = require('express');
const debug = require('debug')('color-contrast-api');
const axios = require('axios');
const color = require('color');

const app = express();

const port = process.env.PORT || 3000;

const webaimUrl = (f, b) => `https://webaim.org/resources/contrastchecker/?fcolor=${f}&bcolor=${b}&api`;

const makeResponse = (opts) => {
  if (!opts.label) return false;
  if (!opts.message) return false;

  return {
    schemaVersion: 1,
    label: opts.label,
    message: opts.message,
    isError: opts.isError || true,
    // color
    // labelColor
    // namedLogo
    // logoSvg
    // logoColor
    // logoWidth
    // logoPosition
    // style: 'flat',
    // cacheSeconds: 300
  };
};

const doesItPass = (ratio, level) => {
  if (level === 'AA') {
    return parseFloat(ratio) > 4.5;
  } else if (level === 'AAA') {
    return parseFloat(ratio) > 7;
  }
};

app.get(['/:f/:b/:l', '/:f/:b'], async (req,res) => {

  const fColor = color(req.params.f);
  const bColor = color(req.params.b);
  const fHex = encodeURIComponent(fColor.hex());
  const bHex = encodeURIComponent(bColor.hex());
  const l = req.params.l || 'AA';
  const endpoint = webaimUrl(fHex, bHex);
  const response = await axios.get(endpoint).then((response) => {
    const options = {
      label: 'Error',
      message: 'n/a',
      isError: true
    }
    if (response.status === 200) {
      options.label = response.data[l];
      options.message = response.data.ratio;
      options.isError = doesItPass(response.data.ratio, l);
    }
    return makeResponse(options);
  });

  return res.send(response)
});

app.listen(port, () => {
 debug('Server is up and running on port ', port);
});