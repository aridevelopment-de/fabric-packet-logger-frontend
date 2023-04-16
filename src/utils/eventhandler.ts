export enum EventType {
  DATA_CLEAR = "DATA_CLEAR",
}

const EventHandler = {
  callbacks: {} as { [key in EventType]: { [id: string]: Function } },

  emit: (eventName: EventType, data: any=null) => {
      console.debug("[Event] Event published: " + eventName);
      console.debug(data);
      
      if (EventHandler.callbacks[eventName]) {
          Object.keys(EventHandler.callbacks[eventName]).forEach((id) => {
              EventHandler.callbacks[eventName][id](data);
          });
      }
  },

  emits: (eventNames: Array<EventType>, datas: Array<any>=[]) => {
      eventNames.forEach((eventName, index) => {
          if (datas === null) {
              EventHandler.emit(eventName);
          } else {
              EventHandler.emit(eventName, datas[index]);
          }
      });
  },

  on: (eventName: EventType, id: string, callback: Function) => {
      if (!EventHandler.callbacks[eventName]) {
          EventHandler.callbacks[eventName] = {};
      }

      EventHandler.callbacks[eventName][id] = callback;
  },

  off: (eventName: EventType, id: string) => {
      if (EventHandler.callbacks[eventName]) {
          delete EventHandler.callbacks[eventName][id];
      }
  }
}

export default EventHandler;