const workerFunction = function () {
    //we perform every operation we want in this function right here
    self.onmessage = (event: MessageEvent) => {
        console.log(event.data);

        postMessage('Message has been gotten!');
    };
};

//This stringifies the whole function
const codeToString = workerFunction.toString();
//This brings out the code in the bracket in string
const mainCode = codeToString.substring(codeToString.indexOf('{') + 1, codeToString.lastIndexOf('}'));
//convert the code into a raw data
const blob = new Blob([mainCode], { type: 'application/javascript' });
//A url is made out of the blob object and we're good to go
const worker_script = URL.createObjectURL(blob);

const webWorker = new Worker(worker_script);

export default webWorker;
