/**
 * @license Copyright 2020 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * @fileoverview Identifies polyfills and transforms that should not be present if using module/nomodule pattern.
 * @see https://docs.google.com/document/d/1ItjJwAd6e0Ts6yMbvh8TN3BBh_sAd58rYE1whnpuxaA/edit Design document
 * @see https://docs.google.com/spreadsheets/d/1z28Au8wo8-c2UsM2lDVEOJcI3jOkb2c951xEBqzBKCc/edit?usp=sharing Legacy babel transforms / polyfills
 * ./lighthouse-core/scripts/legacy-javascript - verification tool.
 */

/** @typedef {{name: string, expression: string}} Pattern */
/** @typedef {{name: string, line: number, column: number}} PatternMatchResult */

const Audit = require('./audit.js');
const NetworkRecords = require('../computed/network-records.js');
const MainResource = require('../computed/main-resource.js');
const URL = require('../lib/url-shim.js');
const i18n = require('../lib/i18n/i18n.js');

const UIStrings = {
  /** Title of a Lighthouse audit that tells the user about legacy polyfills and transforms used on the page. This is displayed in a list of audit titles that Lighthouse generates. */
  title: 'Legacy JavaScript',
  // eslint-disable-next-line max-len
  // TODO: web.dev article. this codelab is good starting place: https://web.dev/codelab-serve-modern-code/
  /** Description of a Lighthouse audit that tells the user about old JavaScript that is no longer needed. This is displayed after a user expands the section to see more. No character length limits. 'Learn More' becomes link text to additional documentation. */
  description: 'Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren\'t necessary for modern browsers. For your bundled JavaScript, adopt a modern script deployment strategy using module/nomodule feature detection to reduce the amount of code shipped to modern browsers, while retaining support for legacy browsers. [Learn More](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

/**
 * Takes a list of patterns (consisting of a name identifier and a RegExp expression string)
 * and returns match results with line / column information for a given code input.
 */
class CodePatternMatcher {
  /**
   * @param {Pattern[]} patterns
   */
  constructor(patterns) {
    const patternsExpression = patterns.map(pattern => `(${pattern.expression})`).join('|');
    this.re = new RegExp(`(^\r\n|\r|\n)|${patternsExpression}`, 'g');
    this.patterns = patterns;
  }

  /**
   * @param {string} code
   * @return {PatternMatchResult[]}
   */
  match(code) {
    // Reset RegExp state.
    this.re.lastIndex = 0;

    const seen = new Set();
    /** @type {PatternMatchResult[]} */
    const matches = [];
    /** @type {RegExpExecArray | null} */
    let result;
    let line = 0;
    let lineBeginsAtIndex = 0;
    // Each pattern maps to one subgroup in the generated regex. For each iteration of RegExp.exec,
    // only one subgroup will be defined. Exec until no more matches.
    while ((result = this.re.exec(code)) !== null) {
      // Discard first value in `result` - it's just the entire match.
      const captureGroups = result.slice(1);
      // isNewline - truthy if matching a newline, used to track the line number.
      // `patternExpressionMatches` maps to each possible pattern in `this.patterns`.
      // Only one of [isNewline, ...patternExpressionMatches] is ever truthy.
      const [isNewline, ...patternExpressionMatches] = captureGroups;
      if (isNewline) {
        line++;
        lineBeginsAtIndex = result.index + 1;
        continue;
      }
      const pattern = this.patterns[patternExpressionMatches.findIndex(Boolean)];

      // Don't report more than one instance of a pattern for this code.
      // Would result in multiple matches for the same pattern, ex: if both '='
      // and 'Object.defineProperty' are used conditionally based on feature detection.
      // Would also result in many matches for transform patterns.
      if (seen.has(pattern)) {
        continue;
      }
      seen.add(pattern);

      matches.push({
        name: pattern.name,
        line,
        column: result.index - lineBeginsAtIndex,
      });
    }

    return matches;
  }
}

class LegacyJavascript extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      id: 'legacy-javascript',
      scoreDisplayMode: Audit.SCORING_MODES.INFORMATIVE,
      description: str_(UIStrings.description),
      title: str_(UIStrings.title),
      requiredArtifacts: ['devtoolsLogs', 'ScriptElements', 'URL'],
    };
  }

  /**
   * @param {string?} object
   * @param {string} property
   */
  static buildPolyfillExpression(object, property) {
    const qt = (/** @type {string} */ token) =>
      `['"]${token}['"]`; // don't worry about matching string delims

    let expression = '';

    if (object) {
      // String.prototype.startsWith =
      expression += `${object}\\.${property}\\s?=[^=]`;
    } else {
      // Promise =
      // window.Promise =// Promise =Z
      // but not: SomePromise =
      expression += `(?:window\\.|[\\s;]+)${property}\\s?=[^=]`;
    }

    // String.prototype['startsWith'] =
    if (object) {
      expression += `|${object}\\[${qt(property)}\\]\\s?=[^=]`;
    }

    // Object.defineProperty(String.prototype, 'startsWith'
    expression += `|defineProperty\\(${object || 'window'},\\s?${qt(property)}`;

    // core-js
    if (object) {
      const objectWithoutPrototype = object.replace('.prototype', '');
      // e(e.S,"Object",{values
      // Minified + mangled pattern found in CDN babel-polyfill.
      // see https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.2.5/polyfill.min.js
      // TODO: perhaps this is the wrong place to check for a CDN polyfill. Remove?
      // expression += `|;e\\([^,]+,${qt(objectWithoutPrototype)},{${property}:`;

      // Minified pattern.
      // $export($export.S,"Date",{now:function
      expression += `|\\$export\\([^,]+,${qt(objectWithoutPrototype)},{${property}:`;
    } else {
      // WeakSet, etc.
      expression += `|function ${property}\\(`;
    }

    return expression;
  }

  /**
   * @return {Pattern[]}
   */
  static getPolyfillPatterns() {
    return [
      'Array.fill',
      'Array.from',
      'Array.isArray',
      'Array.of',
      'Array.prototype.filter',
      'Array.prototype.find',
      'Array.prototype.findIndex',
      'Array.prototype.forEach',
      'Array.prototype.includes',
      'Array.prototype.lastIndexOf',
      'Array.prototype.map',
      'Array.prototype.reduce',
      'Array.prototype.reduceRight',
      'Array.prototype.some',
      'ArrayBuffer',
      'DataView',
      'Date.now',
      'Date.prototype.toISOString',
      'Date.prototype.toJSON',
      'Date.prototype.toString',
      'Float32Array',
      'Float64Array',
      'Function.prototype.name',
      'Int16Array',
      'Int32Array',
      'Int8Array',
      'Map',
      'Number.isInteger',
      'Number.isSafeInteger',
      'Number.parseFloat',
      'Number.parseInt',
      'Object.assign',
      'Object.create',
      'Object.defineProperties',
      'Object.defineProperty',
      'Object.entries',
      'Object.freeze',
      'Object.getOwnPropertyDescriptor',
      'Object.getOwnPropertyDescriptors',
      'Object.getOwnPropertyNames',
      'Object.getPrototypeOf',
      'Object.isExtensible',
      'Object.isFrozen',
      'Object.isSealed',
      'Object.keys',
      'Object.preventExtensions',
      'Object.seal',
      'Object.setPrototypeOf',
      'Object.values',
      'Promise',
      'Reflect.apply',
      'Reflect.construct',
      'Reflect.defineProperty',
      'Reflect.deleteProperty',
      'Reflect.get',
      'Reflect.getOwnPropertyDescriptor',
      'Reflect.getPrototypeOf',
      'Reflect.has',
      'Reflect.isExtensible',
      'Reflect.ownKeys',
      'Reflect.preventExtensions',
      'Reflect.set',
      'Reflect.setPrototypeOf',
      'Set',
      'String.fromCodePoint',
      'String.prototype.codePointAt',
      'String.prototype.endsWith',
      'String.prototype.includes',
      'String.prototype.padEnd',
      'String.prototype.padStart',
      'String.prototype.repeat',
      'String.prototype.startsWith',
      'String.prototype.trim',
      'String.raw',
      'Uint16Array',
      'Uint32Array',
      'Uint8Array',
      'Uint8ClampedArray',
      'WeakMap',
      'WeakSet',
    ].map(polyfillName => {
      const parts = polyfillName.split('.');
      const object = parts.length > 1 ? parts.slice(0, parts.length - 1).join('.') : null;
      const property = parts[parts.length - 1];
      return {
        name: polyfillName,
        expression: this.buildPolyfillExpression(object, property),
      };
    });
  }

  /**
   * @return {Pattern[]}
   */
  static getTransformPatterns() {
    return [
      {
        name: '@babel/plugin-transform-classes',
        expression: 'Cannot call a class as a function',
      },
      {
        name: '@babel/plugin-transform-regenerator',
        expression: /regeneratorRuntime\.a?wrap/.source,
      },
      {
        name: '@babel/plugin-transform-spread',
        expression: /\.apply\(void 0,\s?_toConsumableArray/.source,
      },
    ];
  }

  /**
   * Returns a collection of match results grouped by script url and with a mapping
   * to determine the order in which the matches were discovered.
   *
   * @param {CodePatternMatcher} matcher
   * @param {LH.GathererArtifacts['ScriptElements']} scripts
   * @param {LH.Artifacts.NetworkRequest[]} networkRecords
   * @return {Map<string, PatternMatchResult[]>}
   */
  static detectCodePatternsAcrossScripts(matcher, scripts, networkRecords) {
    /** @type {Map<string, PatternMatchResult[]>} */
    const urlToMatchResults = new Map();

    for (const {requestId, content} of Object.values(scripts)) {
      if (!content) continue;
      const networkRecord = networkRecords.find(record => record.requestId === requestId);
      if (!networkRecord) continue;
      const matches = matcher.match(content);
      if (!matches.length) continue;
      urlToMatchResults.set(networkRecord.url, matches);
    }

    return urlToMatchResults;
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {LH.Audit.Context} context
   * @return {Promise<LH.Audit.Product>}
   */
  static async audit(artifacts, context) {
    const devtoolsLog = artifacts.devtoolsLogs[LegacyJavascript.DEFAULT_PASS];
    const networkRecords = await NetworkRecords.request(devtoolsLog, context);
    const mainResource = await MainResource.request({
      URL: artifacts.URL,
      devtoolsLog,
    }, context);

    /** @type {Array<{url: string, signals: string[], locations: LH.Audit.Details.SourceLocationValue[]}>} */
    const tableRows = [];
    let signalCount = 0;

    // TODO(cjamcl): Use SourceMaps, and only pattern match if maps are not available.
    const matcher = new CodePatternMatcher([
      ...this.getPolyfillPatterns(),
      ...this.getTransformPatterns(),
    ]);

    const urlToMatchResults =
      this.detectCodePatternsAcrossScripts(matcher, artifacts.ScriptElements, networkRecords);
    urlToMatchResults.forEach((matches, url) => {
      /** @type {typeof tableRows[number]} */
      const row = {url, signals: [], locations: []};
      for (const match of matches) {
        const {name, line, column} = match;
        row.signals.push(name);
        row.locations.push({
          type: 'source-location',
          url,
          line,
          column,
          urlProvider: 'network',
        });
      }
      tableRows.push(row);
      signalCount += row.signals.length;
    });

    /** @type {LH.Audit.Details.Table['headings']} */
    const headings = [
      /* eslint-disable max-len */
      {key: 'url', itemType: 'url', subRows: {key: 'locations', itemType: 'source-location'}, text: str_(i18n.UIStrings.columnURL)},
      {key: null, itemType: 'code', subRows: {key: 'signals'}, text: ''},
      /* eslint-enable max-len */
    ];
    const details = Audit.makeTableDetails(headings, tableRows);

    // Only fail if first party code has legacy code.
    // TODO(cjamcl): Use third-party-web.
    const foundSignalInFirstPartyCode = tableRows.some(row => {
      return URL.rootDomainsMatch(row.url, mainResource.url);
    });
    return {
      score: foundSignalInFirstPartyCode ? 0 : 1,
      notApplicable: !foundSignalInFirstPartyCode,
      extendedInfo: {
        signalCount,
      },
      details,
    };
  }
}

module.exports = LegacyJavascript;
module.exports.UIStrings = UIStrings;
