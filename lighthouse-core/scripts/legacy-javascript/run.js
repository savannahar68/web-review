/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-disable no-console */

const fs = require('fs');
const glob = require('glob');
const {execFileSync} = require('child_process');
const LegacyJavascript = require('../../audits/legacy-javascript.js');
const networkRecordsToDevtoolsLog = require('../../test/network-records-to-devtools-log.js');
const VARIANT_DIR = `${__dirname}/variants`;

// build, audit, all.
const STAGE = process.env.STAGE || 'all';

const mainCode = fs.readFileSync(`${__dirname}/main.js`, 'utf-8');

const plugins = LegacyJavascript.getTransformPatterns().map(pattern => pattern.name);

// TODO(cjamcl): Get this from `LegacyJavascript`. Data isn't structured ideally yet, but should be
// done when SourceMap support is in.
const polyfills = [
  'es6.array.copy-within',
  'es6.array.every',
  'es6.array.fill',
  'es6.array.filter',
  'es6.array.find-index',
  'es6.array.find',
  'es6.array.for-each',
  'es6.array.from',
  'es6.array.index-of',
  'es6.array.is-array',
  'es6.array.iterator',
  'es6.array.last-index-of',
  'es6.array.map',
  'es6.array.of',
  'es6.array.reduce-right',
  'es6.array.reduce',
  'es6.array.some',
  'es6.array.species',
  'es6.date.now',
  'es6.date.to-iso-string',
  'es6.date.to-json',
  'es6.date.to-primitive',
  'es6.date.to-string',
  'es6.function.bind',
  'es6.function.has-instance',
  'es6.function.name',
  'es6.map',
  'es6.math.acosh',
  'es6.math.asinh',
  'es6.math.atanh',
  'es6.math.cbrt',
  'es6.math.clz32',
  'es6.math.cosh',
  'es6.math.expm1',
  'es6.math.fround',
  'es6.math.hypot',
  'es6.math.imul',
  'es6.math.log10',
  'es6.math.log1p',
  'es6.math.log2',
  'es6.math.sign',
  'es6.math.sinh',
  'es6.math.tanh',
  'es6.math.trunc',
  'es6.number.constructor',
  'es6.number.epsilon',
  'es6.number.is-integer',
  'es6.number.is-safe-integer',
  'es6.number.max-safe-integer',
  'es6.number.min-safe-integer',
  'es6.number.parse-float',
  'es6.number.parse-int',
  'es6.object.assign',
  'es6.object.create',
  'es6.object.define-properties',
  'es6.object.define-property',
  'es6.object.freeze',
  'es6.object.get-own-property-descriptor',
  'es6.object.get-own-property-names',
  'es6.object.get-prototype-of',
  'es6.object.is-extensible',
  'es6.object.is-frozen',
  'es6.object.is-sealed',
  'es6.object.keys',
  'es6.object.prevent-extensions',
  'es6.object.seal',
  'es6.object.set-prototype-of',
  'es6.object.to-string',
  'es6.promise',
  'es6.reflect.apply',
  'es6.reflect.construct',
  'es6.reflect.define-property',
  'es6.reflect.delete-property',
  'es6.reflect.get-own-property-descriptor',
  'es6.reflect.get-prototype-of',
  'es6.reflect.get',
  'es6.reflect.has',
  'es6.reflect.is-extensible',
  'es6.reflect.own-keys',
  'es6.reflect.prevent-extensions',
  'es6.reflect.set-prototype-of',
  'es6.reflect.set',
  'es6.set',
  'es6.string.code-point-at',
  'es6.string.ends-with',
  'es6.string.from-code-point',
  'es6.string.includes',
  'es6.string.iterator',
  'es6.string.raw',
  'es6.string.repeat',
  'es6.string.starts-with',
  'es6.string.trim',
  'es6.typed.array-buffer',
  'es6.typed.data-view',
  'es6.typed.float32-array',
  'es6.typed.float64-array',
  'es6.typed.int16-array',
  'es6.typed.int32-array',
  'es6.typed.int8-array',
  'es6.typed.uint16-array',
  'es6.typed.uint32-array',
  'es6.typed.uint8-array',
  'es6.typed.uint8-clamped-array',
  'es6.weak-map',
  'es6.weak-set',
  'es7.array.includes',
  'es7.object.entries',
  'es7.object.get-own-property-descriptors',
  'es7.object.values',
  'es7.string.pad-end',
  'es7.string.pad-start',
];

/**
 * @param {string} command
 * @param {string[]} args
 */
function runCommand(command, args) {
  execFileSync(command, args, {cwd: __dirname});
}

/**
 * @param {number} version
 */
function installCoreJs(version) {
  runCommand('yarn', [
    'add',
    `core-js@${version}`,
  ]);
}

function removeCoreJs() {
  try {
    runCommand('yarn', [
      'remove',
      'core-js',
    ]);
  } catch (e) { }
}

/**
 * @param {{group: string, name: string, code: string, babelrc?: *}} options
 */
async function createVariant(options) {
  const {group, name, code, babelrc} = options;
  const dir = `${VARIANT_DIR}/${group}/${name.replace(/[^a-zA-Z0-9]+/g, '-')}`;

  if (!fs.existsSync(`${dir}/main.bundle.js`) && (STAGE === 'build' || STAGE === 'all')) {
    fs.mkdirSync(dir, {recursive: true});
    fs.writeFileSync(`${dir}/main.js`, code);
    fs.writeFileSync(`${dir}/.babelrc`, JSON.stringify(babelrc || {}, null, 2));
    // Not used in this script, but useful for running Lighthouse manually.
    // Just need to start a web server first.
    fs.writeFileSync(`${dir}/index.html`, `<title>${name}</title><script src=main.bundle.min.js>`);

    // Note: No babelrc will make babel a glorified `cp`.
    runCommand('yarn', [
      'babel',
      `${dir}/main.js`,
      '--config-file', `${dir}/.babelrc`,
      '--ignore', 'node_modules/**/*.js',
      '-o', `${dir}/main.transpiled.js`,
    ]);

    // Transform any require statements (like for core-js) into a big bundle.
    runCommand('yarn', [
      'browserify',
      `${dir}/main.transpiled.js`,
      '-o', `${dir}/main.bundle.js`,
    ]);

    // Minify.
    runCommand('yarn', [
      'terser',
      `${dir}/main.bundle.js`,
      '-o', `${dir}/main.bundle.min.js`,
    ]);
  }

  if (STAGE === 'audit' || STAGE === 'all') {
    // Instead of running Lighthouse, use LegacyJavascript directly. Requires some setup.
    // Much faster than running Lighthouse.
    const documentUrl = 'http://localhost/index.html'; // These URLs don't matter.
    const scriptUrl = 'https://localhost/main.bundle.min.js';
    const networkRecords = [
      {url: documentUrl},
      {url: scriptUrl},
    ];
    const devtoolsLogs = networkRecordsToDevtoolsLog(networkRecords);
    const jsRequestWillBeSentEvent = devtoolsLogs.find(e =>
      e.method === 'Network.requestWillBeSent' && e.params.request.url === scriptUrl);
    if (!jsRequestWillBeSentEvent) throw new Error('jsRequestWillBeSentEvent is undefined');
    // @ts-ignore - the log event is not narrowed to 'Network.requestWillBeSent' event from find
    const jsRequestId = jsRequestWillBeSentEvent.params.requestId;
    const code = fs.readFileSync(`${dir}/main.bundle.min.js`, 'utf-8').toString();
    /** @type {Pick<LH.Artifacts, 'devtoolsLogs'|'URL'|'ScriptElements'>} */
    const artifacts = {
      URL: {finalUrl: documentUrl, requestedUrl: documentUrl},
      devtoolsLogs: {
        [LegacyJavascript.DEFAULT_PASS]: devtoolsLogs,
      },
      ScriptElements: [
        // @ts-ignore - partial ScriptElement excluding unused DOM properties
        {requestId: jsRequestId, content: code},
      ],
    };
    // @ts-ignore: partial Artifacts.
    const legacyJavascriptResults = await LegacyJavascript.audit(artifacts, {
      computedCache: new Map(),
    });
    fs.writeFileSync(`${dir}/legacy-javascript.json`,
      JSON.stringify(legacyJavascriptResults.details.items, null, 2));
  }
}

function makeSummary() {
  let totalSignals = 0;
  const variants = [];
  for (const dir of glob.sync('*/*', {cwd: VARIANT_DIR})) {
    /** @type {Array<{signals: string[]}>} */
    const legacyJavascriptItems = require(`${VARIANT_DIR}/${dir}/legacy-javascript.json`);
    const signals = legacyJavascriptItems.reduce((acc, cur) => {
      totalSignals += cur.signals.length;
      return acc.concat(cur.signals);
    }, /** @type {string[]} */ ([])).join(', ');
    variants.push({name: dir, signals});
  }
  return {
    totalSignals,
    variantsMissingSignals: variants.filter(v => !v.signals).map(v => v.name),
    variants,
  };
}

async function main() {
  for (const plugin of plugins) {
    await createVariant({
      group: 'only-plugin',
      name: plugin,
      code: mainCode,
      babelrc: {
        plugins: [plugin],
      },
    });
  }

  for (const coreJsVersion of [2, 3]) {
    removeCoreJs();
    installCoreJs(coreJsVersion);

    for (const esmodules of [true, false]) {
      await createVariant({
        group: `core-js-${coreJsVersion}-preset-env-esmodules`,
        name: String(esmodules),
        code: mainCode,
        babelrc: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {esmodules},
                useBuiltIns: 'entry',
                corejs: coreJsVersion,
              },
            ],
          ],
        },
      });
    }

    for (const polyfill of polyfills) {
      await createVariant({
        group: `core-js-${coreJsVersion}-only-polyfill`,
        name: polyfill,
        code: `require("core-js/modules/${polyfill}")`,
      });
    }
  }

  removeCoreJs();

  const summary = makeSummary();
  fs.writeFileSync(`${__dirname}/summary-signals.json`, JSON.stringify(summary, null, 2));
  console.log({
    totalSignals: summary.totalSignals,
    variantsMissingSignals: summary.variantsMissingSignals,
  });
  console.table(summary.variants);

  runCommand('sh', [
    'update-sizes.sh',
  ]);
}

main();
