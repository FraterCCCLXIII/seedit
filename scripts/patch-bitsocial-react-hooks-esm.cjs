#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const packageDistPath = path.join(__dirname, '..', 'node_modules', '@bitsocialnet', 'bitsocial-react-hooks', 'dist');
const logPrefix = '[patch-bitsocial-react-hooks-esm]';

if (!fs.existsSync(packageDistPath)) {
  console.log(`${logPrefix} Skip: @bitsocialnet/bitsocial-react-hooks dist not found.`);
  process.exit(0);
}

const relativeImportPattern = /(from\s+|import\s+)(['"])(\.\.?\/[^'"]+)\2/g;
let touchedFiles = 0;
let rewrittenImports = 0;
let appliedHardeningPatches = 0;

const splitSpecifier = (specifier) => {
  const suffixStart = specifier.search(/[?#]/);

  if (suffixStart === -1) {
    return { bareSpecifier: specifier, suffix: '' };
  }

  return {
    bareSpecifier: specifier.slice(0, suffixStart),
    suffix: specifier.slice(suffixStart),
  };
};

const resolveSpecifier = (filePath, specifier) => {
  const { bareSpecifier, suffix } = splitSpecifier(specifier);

  if (path.extname(bareSpecifier)) {
    return null;
  }

  const absoluteSpecifierPath = path.resolve(path.dirname(filePath), bareSpecifier);

  if (fs.existsSync(`${absoluteSpecifierPath}.js`)) {
    return `${bareSpecifier}.js${suffix}`;
  }

  if (fs.existsSync(path.join(absoluteSpecifierPath, 'index.js'))) {
    return `${bareSpecifier}/index.js${suffix}`;
  }

  return null;
};

const patchFile = (filePath) => {
  const source = fs.readFileSync(filePath, 'utf8');
  let fileImportCount = 0;

  const updated = source.replace(relativeImportPattern, (match, prefix, quote, specifier) => {
    const resolvedSpecifier = resolveSpecifier(filePath, specifier);

    if (!resolvedSpecifier || resolvedSpecifier === specifier) {
      return match;
    }

    fileImportCount += 1;
    return `${prefix}${quote}${resolvedSpecifier}${quote}`;
  });

  if (!fileImportCount) {
    return;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  touchedFiles += 1;
  rewrittenImports += fileImportCount;
};

const patchLegacyAccountMigration = () => {
  const accountsDatabasePath = path.join(packageDistPath, 'stores', 'accounts', 'accounts-database.js');

  if (!fs.existsSync(accountsDatabasePath)) {
    return;
  }

  const source = fs.readFileSync(accountsDatabasePath, 'utf8');

  if (source.includes('account.communities = legacyCommunities;')) {
    return;
  }

  const migrationNeedle = `    }\n    account.version = accountVersion;\n    return account;\n});`;
  const migrationPatch = `    }\n    if (!Array.isArray(account.subscriptions)) {\n        account.subscriptions = [];\n    }\n    if (!account.blockedAddresses || typeof account.blockedAddresses !== "object") {\n        account.blockedAddresses = {};\n    }\n    if (!account.blockedCids || typeof account.blockedCids !== "object") {\n        account.blockedCids = {};\n    }\n    if (!account.communities || typeof account.communities !== "object") {\n        const legacyCommunities = account.subplebbits && typeof account.subplebbits === "object" ? account.subplebbits : {};\n        account.communities = legacyCommunities;\n    }\n    account.version = accountVersion;\n    return account;\n});`;

  if (!source.includes(migrationNeedle)) {
    console.warn(`${logPrefix} Skip: could not find legacy account migration patch location.`);
    return;
  }

  fs.writeFileSync(accountsDatabasePath, source.replace(migrationNeedle, migrationPatch), 'utf8');
  appliedHardeningPatches += 1;
};

const patchAccountsCommunitiesHardening = () => {
  const accountsActionsInternalPath = path.join(packageDistPath, 'stores', 'accounts', 'accounts-actions-internal.js');
  const accountsUtilsPath = path.join(packageDistPath, 'stores', 'accounts', 'utils.js');

  if (fs.existsSync(accountsActionsInternalPath)) {
    const source = fs.readFileSync(accountsActionsInternalPath, 'utf8');

    if (!source.includes('const accountCommunities = account.communities && typeof account.communities === "object" ? account.communities : {};')) {
      const needle = `            const role = getRole(community, account.author.address);\n            if (!role) {\n                if (account.communities[community.address]) {\n                    toRemove.push(accountId);\n                }\n            }\n            else {\n                const currentRole = (_a = account.communities[community.address]) === null || _a === void 0 ? void 0 : _a.role;`;
      const replacement = `            const role = getRole(community, account.author.address);\n            const accountCommunities = account.communities && typeof account.communities === "object" ? account.communities : {};\n            if (!role) {\n                if (accountCommunities[community.address]) {\n                    toRemove.push(accountId);\n                }\n            }\n            else {\n                const currentRole = (_a = accountCommunities[community.address]) === null || _a === void 0 ? void 0 : _a.role;`;

      if (source.includes(needle)) {
        fs.writeFileSync(accountsActionsInternalPath, source.replace(needle, replacement), 'utf8');
        appliedHardeningPatches += 1;
      } else {
        console.warn(`${logPrefix} Skip: could not find accounts-actions-internal hardening patch location.`);
      }
    }
  }

  if (fs.existsSync(accountsUtilsPath)) {
    const source = fs.readFileSync(accountsUtilsPath, 'utf8');

    if (!source.includes('const storedAccountCommunities = account.communities && typeof account.communities === "object"')) {
      const needle = `    const roles = getAuthorAddressRolesFromCommunities(account.author.address, communities);\n    const accountCommunities = Object.assign({}, account.communities);`;
      const replacement = `    const roles = getAuthorAddressRolesFromCommunities(account.author.address, communities);\n    const storedAccountCommunities = account.communities && typeof account.communities === "object"\n        ? account.communities\n        : account.subplebbits && typeof account.subplebbits === "object"\n            ? account.subplebbits\n            : {};\n    const accountCommunities = Object.assign({}, storedAccountCommunities);`;

      if (source.includes(needle)) {
        fs.writeFileSync(accountsUtilsPath, source.replace(needle, replacement), 'utf8');
        appliedHardeningPatches += 1;
      } else {
        console.warn(`${logPrefix} Skip: could not find accounts-utils hardening patch location.`);
      }
    }
  }
};

const walk = (currentPath) => {
  for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
    const entryPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      patchFile(entryPath);
    }
  }
};

walk(packageDistPath);
patchLegacyAccountMigration();
patchAccountsCommunitiesHardening();

if (!touchedFiles && !appliedHardeningPatches) {
  console.log(`${logPrefix} No relative ESM imports or account migration patches were needed.`);
  process.exit(0);
}

console.log(
  `${logPrefix} Patched ${rewrittenImports} imports across ${touchedFiles} files and applied ${appliedHardeningPatches} account migration hardening patch(es).`,
);
