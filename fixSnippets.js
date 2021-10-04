const fs = require('fs');

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

fixSnippets('snippets/snippets.json');
fixSnippets('snippets/helpers.json');
fixSnippets('snippets/blade.json');
fixSnippets('snippets/livewire.json');
