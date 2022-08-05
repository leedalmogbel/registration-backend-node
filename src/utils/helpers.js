const networkInterfaces = require('os').networkInterfaces();

const ip = Object.values(networkInterfaces).flat().find(i => i.family == 'IPv4' && !i.internal).address;

const addMinutesToDate = (date, minutes) => {
  return new Date(date.getTime() + minutes*60000);
};

module.exports = { ip, addMinutesToDate }