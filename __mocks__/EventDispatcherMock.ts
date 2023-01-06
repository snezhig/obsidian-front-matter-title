import EventDispatcherInterface, { Callback } from "../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "../src/Components/EventDispatcher/Interfaces/ListenerRef";

export default class EventDispatcherMock<E> implements EventDispatcherInterface<E>{


    constructor(
        private map: Map<ListenerRef<keyof E>, Callback<E[keyof E]>>
    ){

    }
    addListener = jest.fn(({name, cb}) => {
        const ref = {getName: () => name};
        this.map.set(ref, cb);
        return ref;
    })
    removeListener = jest.fn(ref => {
        this.map.delete(ref);
    });
    dispatch = jest.fn((name, e) => {
        for(const [r, cb] of this.map.entries()){
            if(r.getName() === name){
                cb(e);
            }
        }
    })

  
    
}