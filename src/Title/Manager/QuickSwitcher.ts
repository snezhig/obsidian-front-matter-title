// Example
import {Modal, SuggestModal} from "obsidian";
import FunctionReplacer from "../../Utils/FunctionReplacer";

const S = this;
await (async () => {
    //@ts-ignore
    global.a = Modal;
    // const c = Modal.prototype.open;
    const test = {
        m: null,
        r: null,
    }
    test.m = new FunctionReplacer<SuggestModal<any>, 'open', () => void>(
        SuggestModal.prototype,
        'open',
        (c) => {
            test.r = new FunctionReplacer(c, 'setSuggestions', [], function (args, defaultArgs, vanilla) {
                console.log(defaultArgs);
                const i = [];
                for (const item of defaultArgs[0]){
                    // if(item.type === 'file'){
                    item.alias = S.resolver.getResolved(item.file);
                    item.type = 'alias'
                    i.push(item)
                    // }
                }
                console.log(i);
                vanilla.call(this, i);

            });
            console.log(test)
            test.r.enable();
        },
        function (args, defaultArgs, vanilla)
        {
            console.log('open')
            console.log(defaultArgs);
            args(this.chooser);
            console.log(this);
            vanilla.call(this);
            console.log(args);
            test.m.disable();
        }
    )

    test.m.enable();

    // Modal.prototype.open = function () {
    //     console.log(this);
    //     c.call(this)
    // }
})();