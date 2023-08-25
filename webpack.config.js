import path from 'path'
export default {
    node: {
        global: true
    },
    entry: './src/index.ts',
    target: 'node',
    module: {
        exprContextCritical: false,
        rules: [
            {
                test: /\.ts/,
                exclude: /node_modules/,
                loader: "ts-loader"
            }
        ],
    },
    resolve: {
        extensions: ['.ts'],
        alias: {
            '*': path.resolve('node_modules/*')
        }
    },
    output: {
        filename: '[name].js'
    }
}