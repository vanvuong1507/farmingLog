#!/usr/bin/env node
/**
 * Syncs app version across Android (gradle.properties), iOS (project.pbxproj),
 * and package.json. Run from repo root: `npm run version:bump -- [command]`
 *
 * Commands:
 *   patch|minor|major — semver bump VERSION_NAME, UAT string, dev versionName (`VERSION_NAME_DEV`),
 *     increment **VERSION_CODE** (một mã cho cả dev/uat/prod — cùng applicationId) + iOS build; sync package.json.
 *   build — increment VERSION_CODE và iOS CURRENT_PROJECT_VERSION only.
 *
 * UI: `getFormattedAppVersion()` = DeviceInfo versionName + "-" + versionCode + " (" + APP_ENV + ")".
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const GRADLE_PROPS = path.join(root, 'android', 'gradle.properties');
const PBXPROJ = path.join(root, 'ios', 'farming.xcodeproj', 'project.pbxproj');
const PACKAGE_JSON = path.join(root, 'package.json');

function readProps(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_.]+)\s*=\s*(.*)$/);
    if (m) {
      out[m[1]] = m[2].trim();
    }
  }
  return {text, map: out};
}

function writeProps(filePath, text, map) {
  const keys = new Set(Object.keys(map));
  const lines = text.split('\n');
  const next = lines.map(line => {
    const m = line.match(/^\s*([A-Za-z0-9_.]+)\s*=/);
    if (m && keys.has(m[1])) {
      return `${m[1]}=${map[m[1]]}`;
    }
    return line;
  });
  let out = next.join('\n');
  for (const k of keys) {
    if (!out.includes(`${k}=`)) {
      out = out.trimEnd() + `\n${k}=${map[k]}\n`;
    }
  }
  fs.writeFileSync(filePath, out, 'utf8');
}

/** @param {string} v */
function parseSemverCore(v) {
  const core = v.replace(/-.*$/, '').trim();
  const parts = core.split('.').map(p => parseInt(p, 10));
  if (parts.length < 2 || parts.some(n => Number.isNaN(n))) {
    throw new Error(`Invalid semver core: "${v}"`);
  }
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
    suffix: v.includes('-') ? v.slice(v.indexOf('-')) : '',
  };
}

/** @param {string} v @param {'patch'|'minor'|'major'} part */
function bumpSemver(v, part) {
  const {major, minor, patch, suffix} = parseSemverCore(v);
  let M = major;
  let m = minor;
  let p = patch;
  if (part === 'major') {
    M += 1;
    m = 0;
    p = 0;
  } else if (part === 'minor') {
    m += 1;
    p = 0;
  } else {
    p += 1;
  }
  const core = `${M}.${m}.${p}`;
  return suffix ? `${core}${suffix}` : core;
}

/** UAT string keeps a -UAT style suffix on the semver core */
function bumpUatMarketing(prevUat, part) {
  const uatMatch = prevUat.match(/^(.+?)(-UAT)$/i);
  if (uatMatch) {
    const bumped = bumpSemver(uatMatch[1], part);
    return `${bumped}-UAT`;
  }
  return bumpSemver(prevUat.replace(/-UAT$/i, ''), part) + '-UAT';
}

function setIosBuildNumbers(pbxText, marketingVersion, currentProjectVersion) {
  return pbxText
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${marketingVersion};`)
    .replace(
      /CURRENT_PROJECT_VERSION = \d+;/g,
      `CURRENT_PROJECT_VERSION = ${currentProjectVersion};`,
    );
}

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function writePackageVersion(version) {
  const raw = fs.readFileSync(PACKAGE_JSON, 'utf8');
  const pkg = JSON.parse(raw);
  pkg.version = version;
  fs.writeFileSync(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

function main() {
  const cmd = (process.argv[2] || 'patch').toLowerCase();
  if (!['patch', 'minor', 'major', 'build'].includes(cmd)) {
    console.error(
      'Usage: node scripts/bump-app-version.mjs [patch|minor|major|build]',
    );
    process.exit(1);
  }

  const {text: gradleText, map: g} = readProps(GRADLE_PROPS);
  const versionName = g.VERSION_NAME || '1.0.0';
  const versionCode = parseInt(g.VERSION_CODE || '1', 10);
  const versionNameUat = g.VERSION_NAME_UAT || '0.0.1-UAT';
  const versionNameDev = g.VERSION_NAME_DEV || '0.0.1-dev';
  let pbx = fs.readFileSync(PBXPROJ, 'utf8');
  const iosBuildMatch = pbx.match(/CURRENT_PROJECT_VERSION = (\d+);/);
  const iosBuild = iosBuildMatch ? parseInt(iosBuildMatch[1], 10) : 1;

  if (cmd === 'build') {
    const nextCode = versionCode + 1;
    const nextIos = iosBuild + 1;
    writeProps(GRADLE_PROPS, gradleText, {
      VERSION_CODE: String(nextCode),
    });
    const mv = parseSemverCore(versionName);
    const marketing = `${mv.major}.${mv.minor}.${mv.patch}`;
    fs.writeFileSync(PBXPROJ, setIosBuildNumbers(pbx, marketing, nextIos), 'utf8');
    console.log(
      `Build numbers → Android VERSION_CODE ${nextCode} (all flavors), iOS ${nextIos} (marketing unchanged: ${marketing})`,
    );
    return;
  }

  const nextName = bumpSemver(versionName, cmd);
  const nextNameUat = bumpUatMarketing(versionNameUat, cmd);
  const nextCode = versionCode + 1;
  const nextIos = iosBuild + 1;
  const marketingIos = parseSemverCore(nextName);
  const marketingStr = `${marketingIos.major}.${marketingIos.minor}.${marketingIos.patch}`;
  const nextNameDev = `${marketingStr}-dev`;

  writeProps(GRADLE_PROPS, gradleText, {
    VERSION_NAME: nextName,
    VERSION_CODE: String(nextCode),
    VERSION_NAME_UAT: nextNameUat,
    VERSION_NAME_DEV: nextNameDev,
  });
  fs.writeFileSync(
    PBXPROJ,
    setIosBuildNumbers(pbx, marketingStr, nextIos),
    'utf8',
  );
  writePackageVersion(marketingStr);

  console.log(
    [
      'Version bump applied:',
      `  Production (Android prod): ${nextName} — VERSION_CODE ${nextCode} (dev/uat/prod)`,
      `  UAT versionName: ${nextNameUat}`,
      `  Dev versionName: ${nextNameDev}`,
      `  iOS: marketing ${marketingStr}, build ${nextIos}`,
      `  package.json version: ${marketingStr}`,
    ].join('\n'),
  );
}

main();
