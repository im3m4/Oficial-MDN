import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../dist/server/index.js';
async function render(path){return worker.fetch(new Request('https://xmedyna.com'+path,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}})}
test('state and the previous address render the reorganized service with its canonical URL',async()=>{
 for(const path of ['/state','/decision']){
  const response=await render(path);assert.equal(response.status,200);
  const html=await response.text();assert.match(html,/<title>state — MEDYNA<\/title>/);
  assert.match(html,/rel="canonical" href="https:\/\/xmedyna.com\/state"/);
  assert.match(html,/<h1[^>]*>state<\/h1>/);
  for(const id of ['entregables','ejemplo','preguntas'])assert.ok(html.includes(`id="${id}"`));
  for(const option of ['Record','Review','Audit'])assert.ok(html.includes(option));
  assert.match(html,/Ejemplo ficticio/);assert.doesNotMatch(html,/Decision Audit|DECISION AUDIT/);
 }
});
test('public navigation and the sitemap use state instead of the previous project URL',async()=>{
 const home=await(await render('/')).text();assert.match(home,/href="\/state">state<\/a>/);assert.doesNotMatch(home,/href="\/decision"/);
 const map=await(await render('/sitemap.xml')).text();assert.match(map,/<loc>https:\/\/xmedyna.com\/state<\/loc>/);assert.doesNotMatch(map,/\/decision<\/loc>/);
});
