const networkInterfaces = require('os').networkInterfaces();
const fs = require('fs');
const QRCode = require('qrcode');
const { v4:uuidv4 } = require('uuid');

const ip = Object.values(networkInterfaces).flat().find(i => i.family == 'IPv4' && !i.internal).address;

const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes*60000);
};

const generateQR = async text => {
  const dir = `./uploads/qrcodes/${text.userId}`
  const uuid = uuidv4();
  let dataUrlQr = '';
  try {
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) throw err;
    });
    await QRCode.toFile(`${dir}/qrEntry-${new Date().valueOf()}.png`, JSON.stringify(text), {type: 'terminal'})
    dataUrlQr = await QRCode.toDataURL(uuid, JSON.stringify(text), {type: 'terminal'});
    console.log('uuidv4', uuid)
    console.log('text', text)
  } catch (err) {
    console.error(err)
  }

  return {
    dir: dir+`/qrEntry-${new Date().valueOf()}.png`,
    uuid: uuid,
    dataUrl: dataUrlQr
  }
}

module.exports = { ip, addMinutesToDate, generateQR }