const appRoot = require('app-root-path');    // app root 경로를 가져오는 lib
const winston = require('winston');            // winston lib
const moment = require('moment');

const winstonDaily = require('winston-daily-rotate-file');
const { combine,timestamp, label, printf } = winston.format;



const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${moment().format('YYYY-MM-DD HH:mm:ss')} ${level}: ${message}`;    // log 출력 포맷 정의
});
//{ emerg: 0, alert: 1, crit: 2, error: 3, warning: 4, notice: 5, info: 6, debug: 7 }
const options = {
    // log파일
    file: {
        level: 'debug',
        filename: `${appRoot}/logs/DiscordBot-${moment().format('YYYY-MM-DD')}.log`, // 로그파일을 남길 경로
        handleExceptions: true,
        json: false,
        maxsize: 52428800, // 50MB
        maxFiles: 5,
        colorize: false,
        format: combine(
            label({ label: 'winston-test' }),
            timestamp(),
            myFormat    // log 출력 포맷
        )
    },
    rolling:{
        level: 'debug',
        filename: `${appRoot}/logs/Msg/DiscordBotMsg.log`, // 로그파일을 남길 경로
        datePattern: 'YYYY-MM-DD',
        showlevel: true,
        json: false,
        maxsize: 1000000,
        maxFiles: 5,
        colorize: false,
        format: combine(
            label({ label: 'winston-test' }),
            timestamp(),
            myFormat    // log 출력 포맷
        )
    },
    // 개발 시 console에 출력
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false, // 로그형태를 json으로도 뽑을 수 있다.
        colorize: true,
        format: combine(
            label({ label: 'nba_express' }),
            timestamp(),
            myFormat
        )
    }
}

let logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.file) ,// 중요! 위에서 선언한 option으로 로그 파일 관리 모듈 transport
        new(winstonDaily)(options.rolling)
    ],
    exitOnError: false,
});

let msgLogger =new winston.createLogger(({
    transports: [
        new winston.transports.File(options.rolling) ,
        new(winstonDaily)(options.rolling)
    ],
    exitOnError: false,
}))

if(process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console(options.console)) // 개발 시 console로도 출력
}

module.exports = logger;
module.exports = msgLogger;
