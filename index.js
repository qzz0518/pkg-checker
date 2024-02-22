#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const { Command } = require('commander');

const program = new Command();

program
    .version('0.0.1')
    .description('Check npm package download counts')
    .action(main);

program.parse();

function main() {
    // 读取package.json文件
    const rawData = fs.readFileSync('package.json');
    const jsonData = JSON.parse(rawData);

    // 获取dependencies和devDependencies
    const dependencies = Object.keys(jsonData.dependencies).concat(Object.keys(jsonData.devDependencies || {}));

    // 对每个依赖项查询下载量
    dependencies.forEach(dependency => {
        const options = {
            hostname: 'api.npmjs.org',
            port: 443,
            path: `/downloads/point/last-week/${dependency}`,
            method: 'GET'
        };

        const req = https.request(options, res => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                const response = JSON.parse(data);
                console.log(`The package [${dependency}](https://www.npmjs.com/package/${dependency}) has been downloaded ${response.downloads} times in the last week.`);
            });
        });

        req.on('error', error => {
            console.error(error);
        });

        req.end();
    });
}