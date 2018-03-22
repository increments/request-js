import typescript from "rollup-plugin-typescript2"
import uglify from "rollup-plugin-uglify"

export default [
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/request.es5.js",
      format: "iife",
      name: "Request",
      sourcemap: true,
    },
    plugins: [
      typescript(),
    ],
  },
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/request.es5.min.js",
      format: "iife",
      name: "Request",
    },
    plugins: [
      typescript(),
      uglify(),
    ],
  },
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/index.es.js",
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          }
        }
      }),
    ],
  },
  {
    input: "./src/index.ts",
    output: {
      file: "./dist/index.js",
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          }
        }
      }),
    ],
  }
]
