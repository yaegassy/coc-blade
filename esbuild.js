async function start(watch) {
  const plugins = [
    {
      name: 'watch-mode-plugin',
      setup(build) {
        let count = 0;
        build.onEnd((result) => {
          if (count++ === 0) console.log('first build:', result);
          else console.log('subsequent build:', result);
        });
      },
    },
  ];

  const buildOptions = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV === 'development',
    mainFields: ['module', 'main'],
    external: ['coc.nvim'],
    platform: 'node',
    target: 'node14.4',
    outfile: 'lib/index.js',
  };

  if (watch) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ctx = await require('esbuild').context({ ...buildOptions, plugins });
    await ctx.watch();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ctx = await require('esbuild').context({ ...buildOptions });
    await ctx.rebuild();
    ctx.dispose();
  }
}

const watch = process.argv.length > 2 && process.argv[2] === '--watch' ? true : false;

start(watch).catch((e) => {
  console.error(e);
});
