/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

// ESM module version of ue5-helper.js

/**
 * 產生 UUID v4 字串
 */
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, t =>
    (t ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> t / 4).toString(16)
  );
}

// callback 註冊區（模組內部）
const ince = {};

function registerCallback(cb, timeoutSec) {
  if (typeof cb !== 'function') return '';
  const n = uuidv4();
  ince[n] = cb;
  setTimeout(() => { delete ince[n]; }, 1000 * Math.max(1, parseInt(timeoutSec) || 0));
  return n;
}

function getUeInterface() {
  if (typeof ue !== 'object') return null;
  if (typeof ue.interface === 'object' && typeof ue.interface.broadcast === 'function') {
    return ue.interface;
  }
  return null;
}

function ue5(event, payload, cb, timeoutSec) {
  if (typeof event !== 'string') return;
  if (typeof payload === 'function') {
    timeoutSec = cb;
    cb = payload;
    payload = null;
  }
  const callbackId = registerCallback(cb, timeoutSec);
  const i = getUeInterface();
  if (i) {
    // 有 broadcast
    if (payload !== undefined) {
      i.broadcast(event, JSON.stringify(payload), callbackId);
    } else {
      i.broadcast(event, '', callbackId);
    }
  } else {
    // 無 broadcast，使用 hash
    const arr = [event, '', callbackId];
    if (payload !== undefined) arr[1] = payload;
    const hashStr = encodeURIComponent(JSON.stringify(arr));
    if (typeof history === 'object' && typeof history.pushState === 'function') {
      history.pushState({}, '', '#' + hashStr);
      history.pushState({}, '', '#' + encodeURIComponent('[]'));
    } else {
      document.location.hash = hashStr;
      document.location.hash = encodeURIComponent('[]');
    }
  }
}
