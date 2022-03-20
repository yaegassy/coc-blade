const fs = require('fs');
const path = require('path');

const generate = (filename, outputPath) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    jsonData = JSON.parse(data);

    const output = {};
    for (const key of Object.keys(jsonData)) {
      let body = '';
      if (typeof jsonData[key]['body'] === 'string' || jsonData[key]['body'] instanceof String) {
        body = jsonData[key]['body'];
      } else if (Array.isArray(jsonData[key]['body'])) {
        body = jsonData[key]['body'].join('');
      }

      if (body) {
        matches = body.match(/@.[a-zA-Z_0-9]*/g);
        if (matches) {
          matches.forEach((v) => {
            if (v !== '@{') {
              output[v] = v;
            }
          });
        }
      }
    }

    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  });
};

generate(
  path.join(path.dirname(__dirname), 'data', 'snippets', 'snippets.json'),
  path.join(path.dirname(__dirname), 'data', 'completion', 'blade-directive.json')
);
generate(
  path.join(path.dirname(__dirname), 'data', 'snippets', 'livewire.json'),
  path.join(path.dirname(__dirname), 'data', 'completion', 'livewire-directive.json')
);
