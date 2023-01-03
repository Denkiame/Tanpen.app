import typescript from "@rollup/plugin-typescript"

export default {
    input: './src/index.ts',
    plugins: [ typescript() ],
    output: {
        file: './scripts/index.js',
        format: 'cjs'
    }
}
