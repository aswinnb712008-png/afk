// guard.js

const _encodedExpiry = 'MjAyNy0wMS0wMVQwMDowMDowMC4wMDBa';

function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString('utf8');
}

const _expiryIso  = decodeBase64(_encodedExpiry);
const _expiryDate = new Date(_expiryIso);

function internalGuard () {
  return Date.now() <= _expiryDate.getTime();
}

function getExpireDate () {
  return _expiryDate;
}

function getHumanExpiry () {
  const d = _expiryDate;
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function expiredMessage () {
  console.log('------------------------------------------');
  console.log('This bot script has expired.');
  console.log('New file download link:');
  console.log('https://gplinks.co/7u0lpSuh');
  console.log('------------------------------------------');
}

module.exports = { internalGuard, getExpireDate, getHumanExpiry, expiredMessage };
