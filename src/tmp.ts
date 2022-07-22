import Container from './inversify.config';

const d = Container.get('dispatcher');
console.log(d);

const s = Container.get('dispatcher');
console.log(s);

console.log(Container.get('fa'));