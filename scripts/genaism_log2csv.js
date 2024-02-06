import fs from 'fs';

const inputFile = process.argv[2];
const outputFile = process.argv[3];

async function processFile() {
    try {
        const rawdata = await fs.promises.readFile(inputFile, 'utf8');
        const data = JSON.parse(rawdata);

        const csv = [];

        csv.push('User,Activity,Timestamp,Content,Value');

        data.forEach((userLogs) => {
            userLogs.log.forEach((log) => {
                csv.push(`${userLogs.id},${log.activity},${log.timestamp},${log.id || ''},${log.value || ''}`);
            });
        });

        await fs.promises.writeFile(outputFile, csv.join('\n'));
    } catch (e) {
        console.error(e);
    }
}

processFile();
