/**
 * @file test.js unit test
 * @author tracy(qiushidev@gmail.com)
 */

import test from 'ava';
import fs from 'fs';
import path from 'path';
import {existsSync as exists} from 'fs';
import generate from '../lib/generate';
import {render} from '../lib/utils/render';
import inquirer from 'inquirer';

const TEMPLATE_OUTPUT_PATH = path.resolve('./test/mock/template-output');
const MOCK_DEFAULT_TEMPLATE_PATH = path.resolve('./test/mock/mock-default-template');

function monkeyPatchInquirer(answers) {
    // monkey patch inquirer
    inquirer.prompt = questions => {
        const key = questions[0].name
        const _answers = {}
        _answers[key] = answers[key]

        return Promise.resolve(_answers)
    }
}

const answers = {
    name: 'mip-cli-test',
    author: 'James (james@email.com)',
    description: 'mip cli test'
};

test.cb('generate template', t => {

    monkeyPatchInquirer(answers);

    generate('test', MOCK_DEFAULT_TEMPLATE_PATH, TEMPLATE_OUTPUT_PATH, err => {
        if (err) {
            t.fail(err);
        }

        // 文件是否生成
        t.is(exists(`${TEMPLATE_OUTPUT_PATH}/components/mip-example.vue`), true);
        t.is(exists(`${TEMPLATE_OUTPUT_PATH}/package.json`), true);

        // render 结果是否一致
        const generatedFile = fs.readFileSync(`${TEMPLATE_OUTPUT_PATH}/package.json`, 'utf8');
        const res = render(fs.readFileSync(`${MOCK_DEFAULT_TEMPLATE_PATH}/template/package.json`, 'utf8'), answers);
        t.is(generatedFile, res);
        t.end();
    });
});


