const fs = require('fs');
const logger = require('./winston').logger
const msgLogger = require('./winston').msgLogger
const moment = require('moment');
const jsonFile = fs.readFileSync('./config/key.json', 'utf8');
const config = JSON.parse(jsonFile);
const prefix = "!";
const { Client, Intents } = require('discord.js');
const sequelize = require('./models/index').sequelize;
const Redmine=require("./Redmine")
const { Issues } = require('./models');
const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const port = 4000;

const { Prometheus } = require('./metrics');

router.get('/metrics', async (ctx) => {
    const { metrics, contentType } = await Prometheus.get();

    ctx.set('Content-Type', contentType);
    ctx.body = metrics;
});

router.get('/metrics/:name', (ctx) => {
    const { name } = ctx.params;
    const randomNumber = Math.round(Math.random() * 10);
    console.info(name, randomNumber);
    // Prometheus.add({ name:'histogram', data:'start Redmine'});
    Prometheus.add({ name:'histogram', data: randomNumber,labels:{Project:'VNA(IHP)',Type:'New'} });
    // Prometheus.add({ name:'counter', data: randomNumber });
    // Prometheus.add({ name:'gauge', data: randomNumber });
    // Prometheus.add({ name:'summary', data: randomNumber });
    ctx.body = 'done';
});

const main=async ()=>{
    let result= await driver();
    if(result){
        client.login(config.Token);
        // Issues.create({
        //     id:"test",
        // }).then(()=>{
        //     console.log("!")
        // })
        //     .catch((e)=>{
        //       console.log(e)
        //     })
        //

        // Issues.findAll().then((data)=>{
        //     console.log(data);
        //    var temp =data[0].dataValues.createdAt.toLocaleString();
        //     console.log(temp)
        // })


    }
}

const driver = async () => {
    try {
        await sequelize.sync();
    } catch (err) {
        logger.error(err);
        return false;
    }
    logger.debug('????????? ??????')
    return true;
};

function trimString(value){
    var nextText= value.replace(/(\r|\r\n\t|\n|\r\t)/gm,"");
    nextText = nextText.replace(/(<([^>]+)>)/ig,"");
    nextText = nextText.replace(/&nbsp;/ig,"\n");
    nextText = nextText.replace(/&gt;/ig,">");
    nextText = nextText.replace(/\n\s*$/, "");
    // console.log(nextText)
    return nextText;
}

function Template(type,privous,next){

    switch (type) {
        case "status":
            return  `?????????(???) ${privous}?????? ${next}(???)??? ?????????????????????.`
        case "assgined_to":
            if(privous==null){
                return `????????????(???) ${next}(???)??? ?????????????????????.`
            }else{
                return `????????????(???) ${privous}?????? ${next}(???)??? ?????????????????????.`
            }
        case "tracker":
            return  `?????????(???) ${privous}?????? ${next}(???)??? ?????????????????????.`
        case "priority":
            return `???????????????(???) ${privous}?????? ${next}(???)??? ?????????????????????.`
        case "project":
            return `???????????????(???) ${privous}?????? ${next}(???)??? ?????????????????????.`
    }


    // "?????? ?????????(???) #106815(???)??? ?????????????????????."
    // "?????? ????????? ?????????:??? Defect #114079: [5021][HUG][ULite] Video Endoscopic Image ????????? ???????????? ????????? ?????????(???) ?????????????????????."
    //
    // "???????????????(???) VNA(IHP)?????? ????????? IHP(???)??? ?????????????????????."

    //????????? new -> conformed  0->10
    // confirmed -> working 10->30
    // working -> in reviewd 30-> 70
    //testin    70-> 90
    //tested    70-> 100
}

function GetStatusValue(val){
    switch (val) {
        case "New":
            return 0;
        case "Confirmed":
            return 10;
        case "Identifying":
            return 10;
        case "Working":
            return 30;
        case "Reviewed":
            return 30;
        case "In Review":
            return 70;
        case "Ready to Test":
            return 70;
        case "Test Failed":
            return 80;
        case "Testing":
            return 90;
        case "Tested":
            return 100;
        case "Closed":
            return 100;
        case "Rejected":
            return 100;
    }

}

function getJournals(jornals){
    // console.log(jornals)
    var msg=""
    jornals.forEach(x=>{
        if(x==""){
            return;
        }
        var who=`${x.user.name}???(???)${moment.tz(x.created_on, 'Asia/Seoul').format('YYYY/MM/DD')}??? ??????`
        if(x.notes==""&&details.property=="dmsf_file"){
            msg=msg+`\n\n${who}\n`+`????????? ${x.details.new_value}???(???) ?????????????????????.\n`;
        }else{
            msg=msg+`\n\n${who}\n`+trimString(x.notes);
        }
    })

    return msg;
}

function chunkSubstr(str, size) {
    const numChunks = Math.ceil(str.length / size)
    const chunks = new Array(numChunks)

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substr(o, size)
    }

    return chunks
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on("ready", () => {
    logger.debug("Start Discord Bot")
    // var temp=client.channels.cache.get("940942407258763264")
    // temp.send('some message')
    //   console.log(`Bot has started, with
    // ${client.users.size} users, in
    // ${client.channels.size} channels of
    // ${client.guilds.size} guilds.`);
    //   client.user.setActivity(`Serving
    // ${client.guilds.size} servers`);
    //   process.emit("notify")
    Redmine.main(config.RedmineAPIKey,Issues);
    var refreshTime=config.RefreshTime*1000*60
    setInterval(function() {
        Redmine.main(config.RedmineAPIKey,Issues);
    }, refreshTime);

    // setInterval(function() {
    //     logger.debug("Running Discord Bot "+ moment.tz(updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'))
    // }, 60000);

});



process.on("notify",(notificationItems)=>{
    logger.debug("Notify Event")
    var temp=client.channels.cache.get("940942407258763264")
    temp.send('some message')
})

process.on("notify-new",(issue)=>{
    logger.debug("Notify New Issue Event")
    var temp=client.channels.cache.get("940942407258763264")
    var url=`http://src.infinitt.com/issues/${issue.id}`
    var issueNumber=issue.tracker+" #"+issue.id
    var who=`${issue.author}???(???)${moment.tz(issue.updated_on, 'Asia/Seoul').format('YYYY/MM/DD')}??? ??????`
    if(issue.author!=issue.assigned_to){
        if(issue.assigned_to!=""){
            who+=`\n${issue.assigned_to}??? ??????`
        }
    }


    msgLogger.debug(`[Notify] New Issue Created\n${issueNumber}\n${issue.title}\n${who}\n\n${url}`);
    temp.send(`[Notify] New Issue Created\n${issueNumber}\n${issue.title}\n${who}\n\n${url}`);
    Prometheus.add({ name:'counter', data: 1,labels:{Project:issue.project,Type:'New'} });
});

process.on("notify-update",(issue,previous)=>{
    logger.debug("Notify Update Issue Event")
    var replyChanel=client.channels.cache.get("940942407258763264")
    var msg=""



    if(previous.status!=issue.status){
        //?????? ??????
        msg=msg+"\n"+Template("status",previous.status,issue.status)

        var previousVal,nextVal;
        previousVal=GetStatusValue(previous.status);
        nextVal=GetStatusValue(issue.status);

        if(previousVal!=nextVal){
            msg=msg+"\n"+`????????????(???) ${previousVal}?????? ${nextVal}(???)??? ?????????????????????.`
        }

    }
    if(previous.assigned_to!=issue.assigned_to){
        //????????? ??????
        msg=msg+"\n"+Template("assgined_to",previous.assigned_to,issue.assigned_to)
    }
    if(previous.tracker!=issue.tracker){
        //?????? ??????
        msg=msg+"\n"+Template("tracker",previous.tracker,issue.tracker)
    }
    if(previous.priority!=issue.priority){
        //???????????? ??????
        msg=msg+"\n"+Template("priority",previous.priority,issue.priority)
    }
    if(previous.project!=issue.project){
        msg=msg+"\n"+Template("project",previous.project,issue.project)
    }
    if(issue.jornals.length!=0){
        msg=msg+getJournals(issue.jornals)
    }


    var url=`http://src.infinitt.com/issues/${issue.id}`
    var issueNumber=issue.tracker+" #"+issue.id
    var reply=`[Notify] Issue Updated\n${issueNumber}\n${issue.title}\n${msg}\n\n${url}`;
    if(reply.length>1000){
        var chunk = chunkSubstr(reply,1000);
        chunk.forEach(x=>{
            replyChanel.send(x);
        })
    }else{
        replyChanel.send(reply);
    }
    msgLogger.debug(`[Notify] Issue Updated\n${issueNumber}\n${issue.title}}\n${msg}\n\n${url}`);
    Prometheus.add({ name:'counter', data: 1,labels:{Project:issue.project,Type:'Update'} });
});

client.on("message", function(message) {

    // message ???????????? ????????? ?????? return
    if (message.author.bot) return;
    // message ????????? prefix??? ????????? return
    if (!message.content.startsWith(prefix)) return;
    //
    if(message.channelId!="941279540049752075") return;

    logger.debug("message Event")

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "refresh") {
        Redmine.main(config.RedmineAPIKey,Issues);
        message.reply(`refresh Start!`);
    }
});

// main();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
    console.info(`Test server is listening on port #${port}`);
    main();
});
