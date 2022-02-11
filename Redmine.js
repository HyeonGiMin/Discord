var _logger= require("./winston");
const moment = require('moment');
const axios = require('axios')
const _ = require("lodash")
var notion
var databaseId
var redmineIssuesIdToDB = {}
const OPERATION_BATCH_SIZE = 10
var REDMINE_API_KEY
const REDMINE_API_LIMIT=100
var Issue

exports.main=function(redmineApi,issue){
    init();
    REDMINE_API_KEY=redmineApi
    Issue=issue;
    _logger.info(`Start Fetch Redmine Issues at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    setInitialRedmineToDatabaseMap().then(syncDatabaseWithRedmine)
}

exports.GetSpecific=function(redmineApi,issue){
    init();
    REDMINE_API_KEY=redmineApi
    Issue=issue;
    _logger.info(`Start Get Specific Redmine Issues at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    // setInitialRedmineToDatabaseMap().then(syncDatabaseWithRedmine)
}
function init(){
    notion=null;
    databaseId=null;
    REDMINE_API_KEY=null;

}
/**
 * Get and set the initial data store with issues currently in the database.
 */
async function setInitialRedmineToDatabaseMap() {
    const currentIssues = await getIssuesFromDatabase()
    for (const { id, updated_on,status,assigned_to,tracker,priority,project} of currentIssues) {
        var updated_on_string=moment.tz(updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        redmineIssuesIdToDB[id] = {id,updated_on:updated_on_string,status,assigned_to,tracker,priority,project}
    }
}

async function syncDatabaseWithRedmine() {
    // Get all issues currently in the provided GitHub repository.
    _logger.info("\nFetching issues from Notion DB...")
    const issues = await getRedmineIssuesForRepository()
    _logger.debug(`Fetched ${issues.IHPServerIssues.length} issues from Project:IHP Server.`)
    _logger.debug(`Fetched ${issues.VNAIssues.length} issues from Project:VNA.`)
    _logger.debug(`Fetched ${issues.ResearchIssues.length} issues from Project:Research IHP.`)
    _logger.debug(`Fetched ${issues.CUMobileIssues.length} issues from Project:CU Mobile.`)
    _logger.debug(`Fetched ${issues.GxDatabaseIssues.length} issues from Project:Gx Database.`)
    _logger.debug(`Fetched ${issues.RTMIssues.length} issues from Project:RTM`)
    // Group issues into those that need to be created or updated in the Notion database.
    const { pagesToCreates, pagesToUpdates } = getOperations(issues)

    // Create pages for new issues.
    _logger.debug(`\n${pagesToCreates.length} new issues to add to Notion.`)
    // await createPages(pagesToCreates)

    // TODO Update는 차후 개발
    _logger.debug(`\n${pagesToUpdates.length} issues to update in Notion.`)
     await updatePages(pagesToUpdates)

    // Success!
    _logger.debug("\n✅ Notion database is synced with Redmine.")
    _logger.info(`Finish Fetch Redmine Issueat ${moment().format('YYYY-MM-DD  HH:mm:ss')}`)
}

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */
async function getIssuesFromDatabase() {
    const resultRows=await Issue.findAll();
    //({where: {"status": { $not: 'Closed'}}})


    console.log(`${resultRows.length} issues successfully fetched.`)
    return resultRows.map(result => {
        let data=result.dataValues
        console.log(data)
        return {
            id: Number(data.id),
            project:data.project,
            status:data.status,
            tracker:data.tracker,
            priority:data.priority,
            author:data.author,
            assigned_to:data.assigned_to,
            title:data.title,
            updated_on:data.updated_on,
            createdAt:data.createdAt,
            updatedAt:data.updatedAt
        }
    })

}

/**
 * Gets issues from a GitHub repository. Pull requests are omitted.
 *
 * https://docs.github.com/en/rest/guides/traversing-with-pagination
 * https://docs.github.com/en/rest/reference/issues
 *
 * @returns {Promise<Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>>}
 */
async function getRedmineIssuesForRepository() {
    const IHPServerIssues = []
    const VNAIssues = []
    const ResearchIssues=[]
    const CUMobileIssues=[]
    const GxDatabaseIssues=[]
    const RTMIssues=[]

    //IHPServer Issues
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=ihp-server&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{
            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created= moment.tz(x.created_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=moment.tz(x.updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }
            //console.log(object)
            //getPropertiesFromIssue(object)
            IHPServerIssues.push(object);
        })
    })

    //VNA Issues
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=vna&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{
            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created= moment.tz(x.created_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=moment.tz(x.updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }

            //console.log(object)
            VNAIssues.push(object);
        })
    })

    //ResearchIHP Issues
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=ihp-research&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{
            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created= moment.tz(x.created_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=moment.tz(x.updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }
            // console.log(object)
            ResearchIssues.push(object);
        })
    })

    //CU Mobile
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=cum&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{
            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created= moment.tz(x.created_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=moment.tz(x.updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }

            // console.log(object)
            CUMobileIssues.push(object);
        })
    })

    //Gx Database
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=gxpacs-database&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{

            var filter =x.custom_fields.find((x)=>{
                if((x.name == "RTM-Product"||x.id==7)&&x.value=="IHP"){
                    return true;
                }
            })

            if(!filter){return;}


            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created=x.created_on.replace("T"," ").replace("Z","")
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=x.updated_on.replace("T"," ").replace("Z"," ")
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }


            //console.log(object)
            GxDatabaseIssues.push(object);
        })
    })

    //RTM Issues
    await axios.get(`http://src.infinitt.com/issues.json?key=${REDMINE_API_KEY}&project_id=rtm&offset=0&limit=${REDMINE_API_LIMIT}&status_id=*`).then((res)=>{
        let jsonData=res.data
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)

        jsonData.issues.map(x=>{

            var filter =x.custom_fields.find((x)=>{
                if((x.name == "RTM-Product"||x.id==7)&&x.value=="IHP"){
                    return true;
                }
            })

            if(!filter){return;}


            let issueNumber=x.id
            let assigned=x.assigned_to!=undefined?x.assigned_to.name:"";
            let author=x.author.name
            let created=x.created_on.replace("T"," ").replace("Z","")
            let tracker=x.tracker.name
            let priority=x.priority.name
            let project=x.project.name
            let title=x.subject
            let updated=x.updated_on.replace("T"," ").replace("Z"," ")
            let status=x.status.name
            let description=x.description
            var object={
                id: issueNumber,
                project:project,
                status:status,
                tracker:tracker,
                priority:priority,
                author:author,
                assigned_to:assigned,
                title:title,
                updated_on:updated,
            }


            //console.log(object)
            RTMIssues.push(object);
        })
    })

    return {
        IHPServerIssues,
        VNAIssues,
        ResearchIssues,
        CUMobileIssues,
        GxDatabaseIssues,
        RTMIssues
    }
}

/**
 * Determines which issues already exist in the Notion database.
 *
 * @param {Object{
 *     Array<{
 *           title:string,
             number:number
                product:string
                status:number,
                type:string,
                priority:string,
                url:string,
                subject:string,
                Description:string,
                assignedTo:string}>
 * }} issues
 * @returns {{
 *   pagesToCreate:   Array<{
 *           title:string,
             number:number
                product:string
                status:number,
                type:string,
                priority:string,
                url:string,
                subject:string,
                Description:string,
                assignedTo:string}>;
 *   pagesToUpdate:   Array<{
 *           title:string,
             number:number
                product:string
                status:number,
                type:string,
                priority:string,
                url:string,
                subject:string,
                Description:string,
                assignedTo:string}>
 * }}
 */
function getOperations(projects) {

    let pagesToCreates = []
    let pagesToUpdates = []

    var {pagesToCreate,pagesToUpdate}=getDBSubOperation(projects.IHPServerIssues);
    pagesToCreates=pagesToCreates.concat(pagesToCreate)
    pagesToUpdates=pagesToUpdates.concat(pagesToUpdate)
    var {pagesToCreate,pagesToUpdate}=getDBSubOperation(projects.VNAIssues);
    pagesToCreates=pagesToCreates.concat(pagesToCreate)
    pagesToUpdates=pagesToUpdates.concat(pagesToUpdate)
    var {pagesToCreate,pagesToUpdate}=getDBSubOperation(projects.ResearchIssues);
    pagesToCreates=pagesToCreates.concat(pagesToCreate)
    pagesToUpdates=pagesToUpdates.concat(pagesToUpdate)
    var {pagesToCreate,pagesToUpdate}=getDBSubOperation(projects.CUMobileIssues);
    pagesToCreates=pagesToCreates.concat(pagesToCreate)
    pagesToUpdates=pagesToUpdates.concat(pagesToUpdate)
    var {pagesToCreate,pagesToUpdate}=getDBSubOperation(projects.GxDatabaseIssues);
    pagesToCreates=pagesToCreates.concat(pagesToCreate)
    pagesToUpdates=pagesToUpdates.concat(pagesToUpdate)

    return { pagesToCreates, pagesToUpdates }
}

function getDBSubOperation(project){
    const pagesToCreate = []
    const pagesToUpdate = []


    for (const issue of project) {
        var pageObject= redmineIssuesIdToDB[issue.id]

        if (pageObject!=undefined) {
            //TODO Check Update 항목
            var checkUpdate=false;
            if(issue.updated_on!= pageObject.updated_on){checkUpdate=true}
            if(issue.assigned_to!=pageObject.assigned_to){checkUpdate=true}
            if(issue.status!=pageObject.status){checkUpdate=true}
            if(issue.priority!=pageObject.priority){checkUpdate=true}
            if(issue.tracker!=pageObject.tracker){checkUpdate=true}
            if(issue.project!=pageObject.project){checkUpdate=true}

            if(checkUpdate){
                let pageId=pageObject.id
                let lastUpdTime=pageObject.updated_on
                pagesToUpdate.push({
                    ...issue,
                    pageId,
                    lastUpdTime
                })
            }
        } else {
            pagesToCreate.push(issue)
        }
    }
    return { pagesToCreate, pagesToUpdate }
}

/**
 * Creates new pages in Notion.
 *
 * https://developers.notion.com/reference/post-page
 *
 * @param {Array<{ number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToCreate
 */
async function createPages(pagesToCreates) {

    const pagesToCreateChunks = _.chunk(pagesToCreates, OPERATION_BATCH_SIZE)
    for (const pagesToCreateBatch of pagesToCreateChunks) {
        await Promise.all(
            pagesToCreateBatch.map(issue =>{
                console.log(issue)
                Issue.create({
                    id: issue.id,
                    project:issue.project,
                    status:issue.status,
                    tracker:issue.tracker,
                    priority:issue.priority,
                    author:issue.author,
                    assigned_to:issue.assigned_to,
                    title:issue.title,
                    updated_on:issue.updated_on,
                }).then(()=>{
                    _logger.debug("Insert New Issue")
                    process.emit("notify-new",issue);
                }).catch((e)=>{
                    _logger.error("Insert New Issue Error "+e.message)
                })

                }
            )
        )
        _logger.debug(`Completed batch size: ${pagesToCreateBatch.length}`)
    }
}

/**
 * Updates provided pages in Notion.
 *
 * https://developers.notion.com/reference/patch-page
 *
 * @param {Array<{ pageId: string, number: number, title: string, state: "open" | "closed", comment_count: number, url: string }>} pagesToUpdate
 */

async function updatePages(updateIssues) {
    // const pagesToUpdateChunks = _.chunk(pagesToUpdates, OPERATION_BATCH_SIZE)
    // for (const pagesToUpdateBatch of pagesToUpdateChunks) {
    //     await Promise.all(
    //         pagesToUpdateBatch.map(({ pageId, ...issue }) =>
    //             notion.pages.update({
    //                 page_id: pageId,
    //                 properties: getPropertiesForUpdate(issue),
    //             })
    //         )
    //     )
    //     console.log(`Completed batch size: ${pagesToUpdateBatch.length}`)
    // }

    for(const updateIssue of updateIssues){
        GetDetailIssue(updateIssue.id,updateIssue.lastUpdTime);

    }
}

async function GetDetailIssue(id,updated_dttm){


    await axios.get(`http://src.infinitt.com/issues/${id}.json?key=${REDMINE_API_KEY}&&include=journals`).then((res)=>{
        let jsonData=res.data.issue
        // var xmlToJson=convert.xml2json(res.data);
        // let temp=JSON.parse(xmlToJson)
        //console.log(jsonData)
        let issueNumber=jsonData.id
        let assigned=jsonData.assigned_to!=undefined?jsonData.assigned_to.name:"";
        let tracker=jsonData.tracker.name
        let priority=jsonData.priority.name
        let project=jsonData.project.name
        let title=jsonData.subject
        let updated=moment.tz(jsonData.updated_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
        let status=jsonData.status.name
        let jornals=jsonData.journals.filter((x)=>{
            var createTime= moment.tz(x.created_on, 'Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
            if(createTime>updated_dttm){
                return true;
            }

        })


        var obj={
            id: id,
            project:project,
            status:status,
            tracker:tracker,
            priority:priority,
            assigned_to:assigned,
            updated_on:updated,
            jornals:jornals,
            title:title,
        }

        Issue.update({project:obj.project, status:obj.status,tracker:obj.tracker,priority:obj.priority,assigned_to:obj.assigned_to,updated_on:obj.updated_on}, {where: {id: id}})
            .then(()=>{
                process.emit("notify-update",obj,redmineIssuesIdToDB[id]);
            })
            .catch((e)=>{
               return null;
            })
    })


}



