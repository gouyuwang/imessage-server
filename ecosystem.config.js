module.exports = {
    apps : [{
        name                : "IMessage-Server", // 应用名称
        error_file          : "./logs/err.log", // 错误日志
        out_file            : "./logs/out.log", // 输出日志
        log_date_format     : "YYYY-MM-DD HH:mm:ss", // 日志日期格式
        script              : "index.js",// 命令脚本
        instances           : 1, // 实例数量
        cwd                 : './', // 当前工作路径
        max_memory_restart  : '500M', // 内存大小限制
        watch               : [  // 监控变化的目录，一旦变化，自动重启
            ".env",
            "index.js",
            "app",
        ],
        ignore_watch        : [ // 忽略监听的目录
            'logs',
            'node_modules'
        ],
        watch_options       : {
            followSymlinks  : false
        },
        env                 : {
            "NODE_ENV": "dev"  // 环境参数，当前指定为生产环境
        }
    }]
}
