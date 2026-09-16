import mongoose from 'mongoose';
import { mapBook, mapOrder } from './serializers.js';

const eventListeners = new Map();
const changeStreams = [];

const setupChangeStream = async (model, eventName) => {
  try {
    const changeStream = model.watch([], { fullDocument: 'updateLookup' });
    changeStreams.push(changeStream);

    changeStream.on('change', (change) => {
      const operationType = change.operationType;
      const document = change.fullDocument || change;

      if (operationType === 'delete') {
        const docKey = change.documentKey || {};
        emit(eventName, { _deleted: true, id: docKey.book_id || docKey.id || docKey._id });
      } else if (eventName === 'books') {
        emit(eventName, mapBook(document));
      } else if (eventName === 'orders') {
        emit(eventName, mapOrder(document));
      } else {
        emit(eventName, document);
      }
    });

    changeStream.on('error', (err) => {
      console.warn(`Realtime stream error for ${eventName}:`, err.message);
    });

    console.log(`Change stream active for ${eventName}`);
    return changeStream;
  } catch (err) {
    console.warn(`Could not setup change stream for ${eventName}:`, err.message);
    return null;
  }
};

const initRealtime = async (models) => {
  const streams = [];
  if (models.Book) streams.push(setupChangeStream(models.Book, 'books'));
  if (models.Order) streams.push(setupChangeStream(models.Order, 'orders'));
  return Promise.all(streams);
};

const subscribe = (eventName, callback) => {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, []);
  }
  eventListeners.get(eventName).push(callback);

  return () => {
    const listeners = eventListeners.get(eventName) || [];
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
    if (listeners.length === 0) eventListeners.delete(eventName);
  };
};

const emit = (eventName, data) => {
  const listeners = eventListeners.get(eventName) || [];
  listeners.forEach((callback) => {
    try {
      callback(data);
    } catch (err) {
      console.error(`Error in realtime listener for ${eventName}:`, err.message);
    }
  });
};

const closeRealtime = async () => {
  await Promise.all(changeStreams.map((stream) => stream.close()));
  changeStreams.length = 0;
  eventListeners.clear();
};

export { initRealtime, subscribe, emit, closeRealtime };
export default { subscribe, emit, initRealtime, closeRealtime };
