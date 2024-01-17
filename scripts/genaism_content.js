import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputFolder = process.argv[2];
const outputFolder = process.argv[3];

const contentData = new Map();

async function processDir() {
    try {
        const outputImages = path.join(outputFolder, 'images');
        await fs.promises.mkdir(outputImages);
        const files = await fs.promises.readdir(inputFolder);

        for (const file of files) {
            const p = path.join(inputFolder, file);
            const stat = await fs.promises.stat(p);

            if (stat.isDirectory()) {
                const files2 = await fs.promises.readdir(p);

                for (const file2 of files2) {
                    if (file2 === 'images') {
                        const imagepath = path.join(p, file2);
                        const imageFiles = await fs.promises.readdir(imagepath);
                        //console.log('IMAGES', imageFiles);

                        for (const image of imageFiles) {
                            await sharp(path.join(imagepath, image))
                                .jpeg({ quality: 80 })
                                .toFile(path.join(outputImages, image));
                            //await fs.promises.copyFile(path.join(imagepath, image), path.join(outputImages, image));
                        }
                    } else if (file2 === 'content.json') {
                        const data = await fs.promises.readFile(path.join(p, file2), 'utf8');
                        const pdata = JSON.parse(data);
                        pdata.forEach((d) => {
                            if (contentData.has(d.id)) {
                                const old = contentData.get(d.id);
                                const set = new Set();
                                old.labels.forEach((l) => {
                                    set.add(l.label);
                                });
                                d.labels.forEach((l) => {
                                    set.add(l.label);
                                });
                                d.labels = Array.from(set).map((l) => ({ label: l, weight: 1 }));
                            }
                            contentData.set(d.id, d);
                        });
                    }
                }
            }
        }

        const contentArray = Array.from(contentData.values());
        await fs.promises.writeFile(
            path.join(outputFolder, 'content.json'),
            JSON.stringify(contentArray, undefined, 4)
        );
    } catch (e) {
        console.error(e);
    }
}

processDir();
