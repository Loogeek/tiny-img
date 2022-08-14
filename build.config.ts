import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./src/index', './src/utils', './src/config'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
});
