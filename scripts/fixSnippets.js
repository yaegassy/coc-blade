const fs = require('fs');
const path = require('path');

const fixSnippets = (filename) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
    }

    // Delete line -> "_comment" : "...",
    const filteredText = data
      .split('\n')
      .filter((w) => !w.match(/\/\*/))
      .filter((w) => !w.match(/\/\//))
      .join('\n');

    fs.writeFile(filename, filteredText, () => {});
  });
};

fixSnippets(path.join(path.dirname(__dirname), 'data', 'snippets', 'snippets.json'));
fixSnippets(path.join(path.dirname(__dirname), 'data', 'snippets', 'helpers.json'));
fixSnippets(path.join(path.dirname(__dirname), 'data', 'snippets', 'blade.json'));
fixSnippets(path.join(path.dirname(__dirname), 'data', 'snippets', 'livewire.json'));
