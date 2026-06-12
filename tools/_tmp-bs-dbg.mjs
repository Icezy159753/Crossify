import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
const { chromium } = await import('playwright')
const url='http://localhost:5176/'; const fx=resolve(process.cwd(),'Edit 500+Booster.sav')
const br=await chromium.launch({headless:true}); const page=await (await br.newContext({viewport:{width:1365,height:768}})).newPage()
await page.route('**/supabase/**', r => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }))
const errs=[];page.on('pageerror',e=>errs.push(e.message.slice(0,120)))
async function clickRe(s){return page.evaluate(x=>{const re=new RegExp(x,'i');const b=Array.from(document.querySelectorAll('button')).find(y=>re.test(y.innerText));const k=Object.keys(b).find(i=>i.startsWith('__reactProps'));b[k].onClick({preventDefault(){},stopPropagation(){},target:b,currentTarget:b})},s)}
async function clickExact(t){return page.evaluate(tt=>{const b=Array.from(document.querySelectorAll('button')).filter(x=>x.innerText.trim()===tt)[0];if(!b)throw new Error('no '+tt);const k=Object.keys(b).find(i=>i.startsWith('__reactProps'));b[k].onClick({preventDefault(){},stopPropagation(){},target:b,currentTarget:b})},t)}
async function addVar(n){await page.evaluate(nn=>{const adds=Array.from(document.querySelectorAll('button')).filter(b=>b.innerText.trim()==='Add');const b=adds.find(i=>i.parentElement?.parentElement?.innerText?.includes(nn));if(!b)throw new Error('no add '+nn);b.click()},n);await page.waitForTimeout(300)}
try{
await page.addInitScript(()=>{window.__CX_AUTH_BYPASS=true;try{Object.defineProperty(window,'showOpenFilePicker',{value:undefined,configurable:true})}catch(_){}})
await page.goto(url,{waitUntil:'networkidle',timeout:20000}).catch(()=>null)
await page.waitForFunction(()=>Boolean(window.__crossifyRuntime),null,{timeout:10000})
await page.evaluate(()=>{const b=Array.from(document.querySelectorAll('button'))[3];const k=Object.keys(b).find(i=>i.startsWith('__reactProps'));b[k].onClick({preventDefault(){},stopPropagation(){},target:b,currentTarget:b})})
await page.waitForFunction(()=>document.body.innerText.includes('Workspace ready'),null,{timeout:10000})
const cp=page.waitForEvent('filechooser',{timeout:10000});await clickRe('Load SPSS File');const ch=await cp;await ch.setFiles(fx)
await page.waitForFunction(()=>document.body.innerText.includes('1,415 cases'),null,{timeout:90000})
await clickExact('Top');await addVar('area_group')
await clickExact('Side');await addVar('q021')
const ids=await page.evaluate(async()=>{
  window.__cxSaveSigSettings({enabled:true,level:95,sigLetters:'ABCDEF',minBase:0})
  await window.__cxBannerSaveCurrentForTest('SigBatch')
  return window.__cxGetBannerTemplates().map(b=>b.id)
})
console.log('banners:',ids.length)
// the run-click block from the smoke
await page.waitForTimeout(500)
const clicked=await page.evaluate(()=>{
  var b=Array.from(document.querySelectorAll('button')).find(x=>{var t=x.innerText.trim();return t==='Run Table'||t==='Run All'||/^Run\b/.test(t)})
  if(!b)return 'NO RUN BUTTON'
  var k=Object.keys(b).find(i=>i.startsWith('__reactProps'))
  if(b[k]&&b[k].onClick){b[k].onClick({preventDefault(){},stopPropagation(){},target:b,currentTarget:b});return 'clicked:'+b.innerText.trim()+' disabled:'+b.disabled}
  b.click();return 'native:'+b.innerText.trim()
})
console.log('run click:',clicked)
for(let i=0;i<6;i++){await page.waitForTimeout(2000);const st=await page.evaluate(()=>({tables:document.querySelectorAll('table').length,body:document.body.innerText.slice(0,140).replace(/\n/g,' / ')}));console.log('t+'+(i+1)*2+'s',JSON.stringify(st))}
console.log('errors:',JSON.stringify(errs.slice(0,4)))
}finally{await br.close()}
