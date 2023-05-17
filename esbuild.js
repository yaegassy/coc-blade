/* eslint-disable @typescript-eslint/no-var-requires */
async function start(watch) {
  await require('esbuild').build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    watch,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV === 'development',
    mainFields: ['module', 'main'],
    // add the large-sized dependencies of the stillat-blade-parser package to external
    // - 'prettier', '@prettier/plugin-php', '@stedi/prettier-plugin-jsonata', 'jsonata'
    external: ['coc.nvim', 'prettier', '@prettier/plugin-php', '@stedi/prettier-plugin-jsonata', 'jsonata'],
    platform: 'node',
    target: 'node14.14',
    outfile: 'lib/index.js',
    logLevel: 'error',
  });
}

let watch = false;
if (process.argv.length > 2 && process.argv[2] === '--watch') {
  console.log('watching...');
  watch = {
    onRebuild(error) {
      if (error) {
        console.error('watch build failed:', error);
      } else {
        console.log('watch build succeeded');
      }
    },
  };
}

start(watch).catch((e) => {
  console.error(e);
});
