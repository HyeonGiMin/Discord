const fs = require('fs');
const logger = require('./winston')
const moment = require('moment');
const jsonFile = fs.readFileSync('./config/key.json', 'utf8');
const config = JSON.parse(jsonFile);
const prefix = "!";
const { Client, Intents } = require('discord.js');
const sequelize = require('./models/index').sequelize;
const Redmine=require("./Redmine")
const { Issues } = require('./models');

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
    logger.debug('초기화 완료')
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
            return  `상태을(를) ${privous}에서 ${next}(으)로 변경되었습니다.`
        case "assgined_to":
            if(privous==null){
                return `담당자을(를) ${next}(으)로 지정되었습니다.`
            }else{
                return `담당자을(를) ${privous}에서 ${next}(으)로 변경되었습니다.`
            }
        case "tracker":
            return  `유형을(를) ${privous}에서 ${next}(으)로 변경되었습니다.`
        case "priority":
            return `우선순위을(를) ${privous}에서 ${next}(으)로 변경되었습니다.`
        case "project":
            return `프로젝트을(를) ${privous}에서 ${next}(으)로 변경되었습니다.`
    }


    // "상위 일감을(를) #106815(으)로 지정되었습니다."
    // "다음 일감과 관련됨:에 Defect #114079: [5021][HUG][ULite] Video Endoscopic Image 영상이 플레이가 안되는 현상이(가) 추가되었습니다."
    //
    // "프로젝트을(를) VNA(IHP)에서 연구용 IHP(으)로 변경되었습니다."

    //진척도 new -> conformed  0->10
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
        case "Working":
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
    }

}

function getJournals(jornals){
    // console.log(jornals)
    var msg=""
    jornals.forEach(x=>{
        if(x==""){
            return;
        }
        msg=msg+"\n"+trimString(x.notes);
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

    setInterval(function() {
        logger.debug("Running Discord Bot "+ moment.tz(updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss'))
    }, 60000);

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

    temp.send(`[Notify] New Issue Created\n${issueNumber}\n${issue.title}\n\n${url}`);
});

process.on("notify-update",(issue,previous)=>{
    logger.debug("Notify Update Issue Event")
    var replyChanel=client.channels.cache.get("940942407258763264")
    var msg;



    if(previous.status!=issue.status){
        //상태 변경
        msg=msg+"\n"+Template("status",previous.status,issue.status)

        var previousVal,nextVal;
        previousVal=GetStatusValue(previous.status);
        nextVal=GetStatusValue(issue.status);

        if(previousVal!=nextVal){
            msg=msg+"\n"+`진척도을(를) ${previousVal}에서 ${nextVal}(으)로 변경되었습니다.`
        }

    }
    if(previous.assigned_to!=issue.assigned_to){
        //담당자 변경
        msg=msg+"\n"+Template("assgined_to",previous.assigned_to,issue.assigned_to)
    }
    if(previous.tracker!=issue.tracker){
        //유형 변경
        msg=msg+"\n"+Template("tracker",previous.tracker,issue.tracker)
    }
    if(previous.priority!=issue.priority){
        //우선순위 변경
        msg=msg+"\n"+Template("priority",previous.priority,issue.priority)
    }
    if(previous.project!=issue.project){
        msg=msg+"\n"+Template("project",previous.project,issue.project)
    }
    if(issue.jornals.length!=0){
        msg=msg+getJournals(issue.jornals)
    }


    var who=`${previous.assigned_to}이(가)${moment.tz(issue.updated_on, 'Asia/Seoul').format('YYYY/MM/DD')}에 변경`
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

});

client.on("message", function(message) {

    // message 작성자가 봇이면 그냥 return
    if (message.author.bot) return;
    // message 시작이 prefix가 아니면 return
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

main();

