import fs from 'fs';
import path from 'path';

const inputFolder = process.argv[2];
const outputFile = process.argv[3];
const outputUserFile = process.argv[4];

async function processSchool(logCSV, userCSV, school) {
    const p = path.join(inputFolder, school);

    const rawlogdata = await fs.promises.readFile(path.join(p, 'logs.json'), 'utf8');
    const logdata = JSON.parse(rawlogdata);

    const seen = new Set();

    logdata.forEach((userLogs) => {
        seen.add(userLogs.id);
        userLogs.log.forEach((log) => {
            logCSV.push(`${userLogs.id},${log.activity},${log.timestamp},${log.id || ''},${log.value || ''}`);
        });
    });

    const rawuserdata = await fs.promises.readFile(path.join(p, 'research.json'), 'utf8');
    const userdata = JSON.parse(rawuserdata);

    userdata.forEach((userLogs) => {
        if (userLogs.action === 'enter_username') {
            seen.delete(userLogs.userId);
            userCSV.push(`${userLogs.userId},"${userLogs.details.fullname}",${school}`);
        }
    });

    seen.forEach((s) => {
        userCSV.push(`${s},,${school}`);
    });
}

async function processAll() {
    try {
        const logCSV = [];
        const userCSV = [];

        logCSV.push('User,Activity,Timestamp,Content,Value');
        userCSV.push('UserID,Name,School');

        const dirs = await fs.promises.readdir(inputFolder);
        for (const school of dirs) {
            const p = path.join(inputFolder, school);
            const stat = await fs.promises.stat(p);

            if (stat.isDirectory()) {
                await processSchool(logCSV, userCSV, school);
            }
        }

        await fs.promises.writeFile(outputFile, logCSV.join('\n'));
        await fs.promises.writeFile(outputUserFile, userCSV.join('\n'));
    } catch (e) {
        console.error(e);
    }
}

processAll();
