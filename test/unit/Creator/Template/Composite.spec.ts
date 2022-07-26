const pattern = '(?<placeholder>{{(?<title>.*?)}})'
const template = '{{right_space }} test'
const parts = template.match(new RegExp(pattern, 'g'));
// console.log(parts);
for (const part of parts) {
    console.log(part.match(pattern).groups);
    const { groups: { title } } = part.match(pattern);
    // console.log(title.trim(), title);
}
describe('', () => {
    test('', () => expect(true).toBeTruthy())
})