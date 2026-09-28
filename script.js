const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// เก็บข้อมูลเดิมไว้ ไม่ล้างคะแนนนักเรียนอัตโนมัติเมื่ออัปเดตเว็บไซต์
let user=null,preScore=null,postScore=null,records=(()=>{try{return JSON.parse(localStorage.getItem('pyRecords')||'[]')}catch{return []}})(),quizIdx=0,quizAnswers={},quizType='';
const CHALLENGE_STATE_PREFIX='pyChallengeState_v1_';
const lessonData=[
['2.1 ตัวอย่างระบบคำนวณค่าโดยสารประจำทาง','วิเคราะห์ข้อมูลผู้โดยสาร เงื่อนไขค่าโดยสาร และคำนวณยอดชำระตามสถานการณ์ในบทเรียน','distance = 12\nrate = 3\nfare = distance * rate\nprint(fare)'],
['2.2 ตัวดำเนินการบูลีน','ใช้ตัวดำเนินการเปรียบเทียบและตรรกะ เช่น and, or, not เพื่อตรวจสอบเงื่อนไข','age = 14\nhas_card = True\nprint(age >= 12 and has_card)'],
['2.3 การทำงานซ้ำด้วย while','ทำซ้ำคำสั่งตราบใดที่เงื่อนไขเป็นจริง และปรับค่าตัวแปรเพื่อให้ลูปสิ้นสุด','n = 1\nwhile n <= 5:\n    print(n)\n    n += 1'],
['2.4 เงื่อนไขทางเลือก if / elif / else','เลือกทำงานตามเงื่อนไขที่กำหนด และใช้ else เมื่อไม่เข้าเงื่อนไขก่อนหน้า','score = 78\nif score >= 80:\n    print("ดีมาก")\nelif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ฝึกเพิ่ม")'],
['2.5 ฟังก์ชัน (function)','สร้างและเรียกใช้ฟังก์ชัน พร้อมฝึกใช้พารามิเตอร์และ return เพื่อส่งค่ากลับ','def greet(name):\n    return "สวัสดี " + name\nprint(greet("มีนา"))']
];
const randomChallenges=[
{title:'คำนวณค่าโดยสาร',starterCode:'distance = ___  # เติมระยะทางเป็นตัวเลข\nrate = 3\nfare = distance * rate\nprint(fare)',solutionCode:'distance = 5\nrate = 3\nfare = distance * rate\nprint(fare)',topic:'การคำนวณ',task:'เขียนโปรแกรมรับระยะทางเป็นกิโลเมตร แล้วคำนวณค่าโดยสารโดยคิดกิโลเมตรละ 3 บาท',hint:'ใช้ตัวแปรและเครื่องหมายคูณ',goal:'ทดลองระยะทาง 5 และ 12 กิโลเมตร แล้วแสดงค่าโดยสาร'},
{title:'ตรวจสอบสิทธิ์ส่วนลด',starterCode:'age = ___  # เติมอายุเป็นตัวเลข\nhas_card = ___  # เติม True หรือ False\nif age < 15 or has_card:\n    print("มีสิทธิ์รับส่วนลด")\nelse:\n    print("ไม่มีสิทธิ์รับส่วนลด")',solutionCode:'age = 14\nhas_card = False\nif age < 15 or has_card:\n    print("มีสิทธิ์รับส่วนลด")\nelse:\n    print("ไม่มีสิทธิ์รับส่วนลด")',topic:'เงื่อนไขบูลีน',task:'กำหนดตัวแปรอายุและมีบัตรสมาชิก แล้วตรวจสอบว่าผู้โดยสารมีสิทธิ์รับส่วนลดเมื่ออายุต่ำกว่า 15 ปี หรือมีบัตรสมาชิก',hint:'ใช้ or และตัวดำเนินการเปรียบเทียบ',goal:'ทดสอบทั้งกรณีมีสิทธิ์และไม่มีสิทธิ์'},
{title:'นับเลข 1 ถึง 10',starterCode:'n = 1\nwhile n <= ___:  # เติมตัวเลขสุดท้าย\n    print(n)\n    n += 1',solutionCode:'n = 1\nwhile n <= 10:\n    print(n)\n    n += 1',topic:'while',task:'เขียนโปรแกรมใช้ while แสดงตัวเลขตั้งแต่ 1 ถึง 10 ทีละบรรทัด',hint:'อย่าลืมเพิ่มค่าตัวแปรในลูป',goal:'ผลลัพธ์ต้องมีตัวเลข 1 ถึง 10 ครบและลูปหยุดได้'},
{title:'แปลผลคะแนน',starterCode:'score = ___  # เติมคะแนน 0–100\nif score >= ___:  # เติมเกณฑ์คะแนน\n    print("ดีมาก")\nelif score >= ___:  # เติมเกณฑ์คะแนน\n    print("ผ่าน")\nelse:\n    print("ฝึกเพิ่ม")',solutionCode:'score = 75\nif score >= 80:\n    print("ดีมาก")\nelif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ฝึกเพิ่ม")',topic:'if / elif / else',task:'กำหนดคะแนน 0–100 แล้วแสดง “ดีมาก” เมื่อคะแนนตั้งแต่ 80, “ผ่าน” เมื่อคะแนนตั้งแต่ 50 แต่ต่ำกว่า 80 และ “ฝึกเพิ่ม” เมื่อคะแนนต่ำกว่า 50',hint:'ใช้ if, elif และ else',goal:'ทดลองคะแนน 90, 65 และ 40'},
{title:'สร้างฟังก์ชันทักทาย',starterCode:'def greet(name):\n    return "สวัสดี " + name\n\nprint(greet("___"))  # เติมชื่อของตนเอง',solutionCode:'def greet(name):\n    return "สวัสดี " + name\n\nprint(greet("มีนา"))\nprint(greet("ต้น"))',topic:'ฟังก์ชัน',task:'สร้างฟังก์ชัน greet(name) ให้คืนข้อความ “สวัสดี” ตามด้วยชื่อ แล้วเรียกใช้ฟังก์ชันกับชื่อของตนเอง',hint:'ใช้ def และ return',goal:'เรียกใช้ฟังก์ชันอย่างน้อย 2 ชื่อ'},
{title:'รวมยอดซื้อสินค้า',starterCode:'price1 = ___  # เติมราคาสินค้าชิ้นที่ 1\nprice2 = ___  # เติมราคาสินค้าชิ้นที่ 2\nprice3 = ___  # เติมราคาสินค้าชิ้นที่ 3\ntotal = price1 + price2 + price3\nprint(total)',solutionCode:'price1 = 20\nprice2 = 35\nprice3 = 15\ntotal = price1 + price2 + price3\nprint(total)',topic:'การคำนวณ',task:'กำหนดราคาสินค้า 3 ชิ้น แล้วคำนวณและแสดงยอดรวมทั้งหมด',hint:'ใช้ตัวแปรและเครื่องหมาย +',goal:'แสดงยอดรวมเป็นตัวเลขที่ถูกต้อง'},
{title:'ตรวจสอบเลขคู่เลขคี่',starterCode:'number = ___  # เติมจำนวนเต็ม\nif number % 2 == ___:  # เติมเศษที่ใช้ตรวจเลขคู่\n    print("เลขคู่")\nelse:\n    print("เลขคี่")',solutionCode:'number = 8\nif number % 2 == 0:\n    print("เลขคู่")\nelse:\n    print("เลขคี่")',topic:'if / else',task:'กำหนดจำนวนเต็มหนึ่งจำนวน แล้วตรวจสอบว่าเป็นเลขคู่หรือเลขคี่ พร้อมแสดงข้อความให้เหมาะสม',hint:'ใช้เครื่องหมาย % และ if/else',goal:'ทดสอบทั้งเลขคู่และเลขคี่'},
{title:'นับถอยหลัง',starterCode:'n = ___  # เติมเลขเริ่มต้น\nwhile n >= ___:  # เติมเลขสุดท้าย\n    print(n)\n    n -= 1\nprint("เริ่ม!")',solutionCode:'n = 5\nwhile n >= 1:\n    print(n)\n    n -= 1\nprint("เริ่ม!")',topic:'while',task:'ใช้ while แสดงตัวเลขจาก 5 ลงมาถึง 1 แล้วแสดงคำว่า “เริ่ม!”',hint:'ลดค่าตัวแปรในแต่ละรอบ',goal:'ลูปต้องหยุดหลังแสดง 1'},
{title:'ตรวจสอบช่วงคะแนน',starterCode:'score = ___  # เติมคะแนน\nif score >= ___ and score <= ___:  # เติมขอบเขตคะแนน\n    print("อยู่ในช่วง")\nelse:\n    print("อยู่นอกช่วง")',solutionCode:'score = 75\nif score >= 50 and score <= 100:\n    print("อยู่ในช่วง")\nelse:\n    print("อยู่นอกช่วง")',topic:'ตัวดำเนินการบูลีน',task:'กำหนดคะแนน แล้วตรวจสอบว่าคะแนนอยู่ระหว่าง 50 ถึง 100 รวมขอบเขตหรือไม่',hint:'ใช้ and ร่วมกับ >= และ <=',goal:'ทดลองคะแนน 49, 50, 75 และ 100'},
{title:'ฟังก์ชันคำนวณพื้นที่',starterCode:'def area(width, height):\n    return width * height\n\nprint(area(___, ___))  # เติมความกว้างและความสูง',solutionCode:'def area(width, height):\n    return width * height\n\nprint(area(5, 3))\nprint(area(8, 4))',topic:'ฟังก์ชันและการคำนวณ',task:'สร้างฟังก์ชัน area(width, height) เพื่อคืนค่าพื้นที่สี่เหลี่ยมผืนผ้า แล้วเรียกใช้พร้อมแสดงผล',hint:'ใช้ def, return และการคูณ',goal:'ทดสอบอย่างน้อย 2 ชุดค่าความกว้างและความยาว'}
];
let challengeDeck=[],currentChallenge=null;
function challengeStateKey(){return CHALLENGE_STATE_PREFIX+(user?[user.name,user.cls,user.no].join('|'):'guest');}
function getChallengeState(){try{const x=JSON.parse(localStorage.getItem(challengeStateKey())||'{}');return {cycle:Array.isArray(x.cycle)?x.cycle:[],passed:Array.isArray(x.passed)?x.passed:[]};}catch{return {cycle:[],passed:[]};}}
function saveChallengeState(state){localStorage.setItem(challengeStateKey(),JSON.stringify(state));}
function challengeProgress(){const state=getChallengeState();return {drawn:state.cycle.length,passed:state.passed.length,total:randomChallenges.length};}
function drawChallenge(){
  if(!challengeDeck.length){
    const state=getChallengeState();
    const remaining=randomChallenges.map((_,i)=>i).filter(i=>!state.cycle.includes(i));
    if(!remaining.length){saveChallengeState({cycle:[],passed:[]});}
    challengeDeck=(remaining.length?remaining:randomChallenges.map((_,i)=>i)).sort(()=>Math.random()-.5);
  }
  const idx=challengeDeck.pop();
  const state=getChallengeState();
  if(!state.cycle.includes(idx))state.cycle.push(idx);
  saveChallengeState(state);
  return randomChallenges[idx];
}
function markChallengePassed(){if(!currentChallenge)return;const idx=randomChallenges.indexOf(currentChallenge),state=getChallengeState();if(idx>=0&&!state.passed.includes(idx))state.passed.push(idx);saveChallengeState(state);}
function challengeProgressText(){const p=challengeProgress();return `ทำแล้ว ${p.drawn}/${p.total} โจทย์ · ผ่าน ${p.passed}/${p.total} โจทย์`;}
function progressKey(){return 'pyLessonProgress_v2_'+(user?[user.name,user.cls,user.no].join('|'):'guest');}
function completedLessons(){try{return JSON.parse(localStorage.getItem(progressKey())||'[]').map(Number).filter(n=>n>=1&&n<=5);}catch{return [];}}
function isLessonUnlocked(n){const done=completedLessons();return n===1||done.includes(n-1);}
function markLessonComplete(n){const done=new Set(completedLessons());done.add(n);localStorage.setItem(progressKey(),JSON.stringify([...done].sort((a,b)=>a-b)));}
const pre=[
['การแก้ปัญหาด้วยโปรแกรมควรเริ่มจากสิ่งใด',['ทำความเข้าใจปัญหา','เขียนโค้ดทันที','ตกแต่งหน้าจอ','สุ่มคำสั่ง'],0],
['ตัวแปรใน Python ใช้สำหรับอะไร',['เก็บข้อมูล','แสดงภาพเท่านั้น','ปิดโปรแกรม','ลบไฟล์'],0],
['ผลลัพธ์ของ 8 + 4 คือข้อใด',['12','84','4','2'],0],
['ค่าความจริงใน Python มีอะไรบ้าง',['True และ False','Yes และ No','On และ Off','1 และ 2 เท่านั้น'],0],
['and ให้ผลเป็น True เมื่อใด',['เงื่อนไขทั้งสองเป็นจริง','มีเงื่อนไขหนึ่งจริง','ทั้งสองเท็จ','ไม่มีเงื่อนไข'],0],
['คำสั่งใดใช้ตรวจสอบเงื่อนไข',['if','repeat','loop','check'],0],
['while ใช้ทำอะไร',['วนซ้ำตามเงื่อนไข','สร้างตัวแปรเท่านั้น','แสดงข้อความอย่างเดียว','ประกาศฟังก์ชัน'],0],
['ต้องการเลือกหนึ่งในหลายกรณีใช้โครงสร้างใด',['if / elif / else','print','input','import'],0],
['def ใช้สำหรับอะไร',['สร้างฟังก์ชัน','รับข้อมูล','หยุดลูป','เปรียบเทียบค่า'],0],
['print() มีหน้าที่ใด',['แสดงผลข้อมูล','รับข้อมูล','วนซ้ำ','กำหนดเงื่อนไข'],0]];
// กระจายตำแหน่งคำตอบที่ถูกต้อง และใช้ชุดตัวเลือกเดียวกันในข้อร่วมของก่อน–หลังเรียน
function reorderChoices(q, order){const old=q[1],correct=q[2];return [q[0],order.map(i=>old[i]),order.indexOf(correct)];}
const choiceOrders=[[1,0,2,3],[2,1,0,3],[3,1,2,0],[1,3,2,0],[2,0,3,1],[3,2,0,1],[1,2,3,0],[2,3,1,0],[3,0,1,2],[1,0,3,2]];
for(let i=0;i<pre.length;i++)pre[i]=reorderChoices(pre[i],choiceOrders[i]);
const post=[
// ข้อสอบหลังเรียนใช้เนื้อหาเดียวกับก่อนเรียน แต่สลับลำดับข้อ
pre[6],pre[3],pre[8],pre[0],pre[5],pre[2],pre[9],pre[4],pre[1],pre[7],
['ถ้า distance = 6 และ rate = 5 แล้ว fare = distance * rate มีค่าเท่าใด',['11','30','65','1.2'],1],
['ถ้า A=True และ B=False นิพจน์ A or B ได้ค่าใด',['False','None','True','0'],2],
['เมื่อกำหนด n = 1 และ while n <= 3 โดยเพิ่ม n ทีละ 1 จะแสดงตัวเลขกี่ครั้ง',['2 ครั้ง','4 ครั้ง','1 ครั้ง','3 ครั้ง'],3],
['ถ้า score = 85 และตรวจ if score >= 80: จะเข้าเงื่อนไขใด',['elif','else','ไม่มีเงื่อนไข','if'],3],
['เมื่อเรียกใช้ฟังก์ชัน add(2, 3) ที่ return a + b จะได้ค่าใด',['23','2','3','5'],3]
];
const preExplain=[
'ควรเริ่มจากทำความเข้าใจปัญหาและเป้าหมายก่อน เพื่อวางแผนวิธีแก้ปัญหาให้เหมาะสม',
'ตัวแปรใช้เก็บข้อมูล เช่น ตัวเลขหรือข้อความ เพื่อนำไปใช้และประมวลผลในโปรแกรม',
'เครื่องหมาย + ใช้บวกตัวเลข ดังนั้น 8 + 4 มีค่าเท่ากับ 12',
'Python ใช้ True แทนค่าจริง และ False แทนค่าเท็จ',
'and จะเป็น True เมื่อเงื่อนไขทั้งสองด้านเป็นจริงพร้อมกัน',
'คำสั่ง if ใช้ตรวจสอบเงื่อนไขและเลือกทำงานเมื่อเงื่อนไขเป็นจริง',
'while ใช้ทำซ้ำคำสั่งตราบเท่าที่เงื่อนไขยังเป็นจริง',
'โครงสร้าง if / elif / else ใช้เลือกทำงานตามเงื่อนไขในหลายกรณี',
'def ใช้ประกาศหรือสร้างฟังก์ชัน ซึ่งเป็นชุดคำสั่งที่เรียกใช้ได้',
'print() ใช้แสดงข้อมูลหรือผลลัพธ์ออกทางหน้าจอ'
];
const postExplain=[
'while ใช้ทำซ้ำคำสั่งตราบเท่าที่เงื่อนไขยังเป็นจริง',
'Python ใช้ True แทนค่าจริง และ False แทนค่าเท็จ',
'def ใช้ประกาศหรือสร้างฟังก์ชัน ซึ่งเป็นชุดคำสั่งที่เรียกใช้ได้',
'ควรเริ่มจากทำความเข้าใจปัญหาและเป้าหมายก่อน เพื่อวางแผนวิธีแก้ปัญหาให้เหมาะสม',
'คำสั่ง if ใช้ตรวจสอบเงื่อนไขและเลือกทำงานเมื่อเงื่อนไขเป็นจริง',
'เครื่องหมาย + ใช้บวกตัวเลข ดังนั้น 8 + 4 มีค่าเท่ากับ 12',
'print() ใช้แสดงข้อมูลหรือผลลัพธ์ออกทางหน้าจอ',
'and จะเป็น True เมื่อเงื่อนไขทั้งสองด้านเป็นจริงพร้อมกัน',
'ตัวแปรใช้เก็บข้อมูล เช่น ตัวเลขหรือข้อความ เพื่อนำไปใช้และประมวลผลในโปรแกรม',
'โครงสร้าง if / elif / else ใช้เลือกทำงานตามเงื่อนไขในหลายกรณี',
'คำนวณค่า fare จากระยะทางคูณอัตราต่อกิโลเมตร: 6 × 5 = 30',
'or ให้ผล True เมื่อมีอย่างน้อยหนึ่งเงื่อนไขเป็นจริง',
'ลูปทำงานเมื่อ n เป็น 1, 2 และ 3 จึงแสดงผลทั้งหมด 3 ครั้ง',
'85 >= 80 เป็นจริง จึงทำงานในส่วน if',
'ฟังก์ชันรับค่า 2 และ 3 แล้ว return ผลบวก 5'
];
function record(kind,extra={}){let r={kind,name:user?.name||'',className:user?.cls||'',no:user?.no||'',at:new Date().toISOString(),...extra};records.push(r);localStorage.setItem('pyRecords',JSON.stringify(records));if(window.GAS_URL)fetch(window.GAS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(r)}).catch(()=>{});}
$('#stTab').onclick=()=>{ $('#stTab').classList.add('active');$('#tcTab').classList.remove('active');$('#stForm').hidden=false;$('#tcForm').hidden=true;};
$('#tcTab').onclick=()=>{ $('#tcTab').classList.add('active');$('#stTab').classList.remove('active');$('#stForm').hidden=true;$('#tcForm').hidden=false;};
function loadLatestScores(){
  preScore=null;postScore=null;
  if(!user||user.mode==='teacher')return;
  const mine=records.filter(r=>r.name===user.name&&r.className===user.cls&&String(r.no)===String(user.no));
  const preRows=mine.filter(r=>r.kind==='pretest'),postRows=mine.filter(r=>r.kind==='posttest');
  if(preRows.length)preScore=preRows[preRows.length-1].score;
  if(postRows.length)postScore=postRows[postRows.length-1].score;
}
function enter(u){user=u;loadLatestScores();$('#login').hidden=true;$('#app').hidden=false;$('#who').textContent=u.mode==='teacher'?'ครู '+u.name:`${u.name} · ${u.cls} เลขที่ ${u.no}`;renderNav();go(u.mode==='teacher'?'teacher':'home');}
$('#stForm').onsubmit=e=>{e.preventDefault();enter({mode:'student',name:$('#name').value.trim(),cls:$('#cls').value,no:$('#no').value});record('login');};
const TEACHER_PASSWORD='Python1';
$('#tcForm').onsubmit=e=>{
 e.preventDefault();
 const password=$('#teacherPassword').value;
 if(password!==TEACHER_PASSWORD){$('#teacherError').hidden=false;$('#teacherPassword').value='';$('#teacherPassword').focus();return;}
 $('#teacherError').hidden=true;
 enter({mode:'teacher',name:$('#teacher').value.trim()});
 $('#teacherPassword').value='';
};
$('#logout').onclick=()=>{user=null;preScore=null;postScore=null;currentChallenge=null;challengeDeck=[];$('#app').hidden=true;$('#login').hidden=false;};
$('#hamb').onclick=()=>$('#nav').classList.toggle('open');
const nav=[['home','หน้าแรก'],['guide','คู่มือการใช้งาน'],['objectives','วัตถุประสงค์'],['pre','ก่อนเรียน'],['lessons','บทเรียน'],['activities','กิจกรรม'],['playground','สนามทดลอง'],['post','หลังเรียน'],['results','ผลการเรียน'],['about','ครูผู้สอน'],['teacher','สำหรับครู']];
function renderNav(){$('#nav').innerHTML=nav.filter(x=>x[0]!=='teacher'||user.mode==='teacher').map(x=>`<button data-p="${x[0]}">${x[1]}</button>`).join('');}
function go(p){
 const chapterMatch=/^chapter([1-5])$/.exec(p);
 if(chapterMatch&&!isLessonUnlocked(Number(chapterMatch[1]))){const n=Number(chapterMatch[1]);alert(`🔒 บทนี้ยังล็อกอยู่ค่ะ กรุณาเรียนบทที่ ${n-1} และกด “เรียนจบบทนี้” ก่อนนะคะ`);p='lessons';}
 $('#content').innerHTML=pages[p]();$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.p===p));$('#nav').classList.remove('open');addCopyButtons();if(p==='pre'||p==='post')startQuiz(p);
}
function addCopyButtons(){ $$('#content pre.code').forEach((pre,i)=>{if(pre.parentElement.querySelector(':scope > .copy-code'))return;const b=document.createElement('button');b.className='copy-code';b.type='button';b.textContent='คัดลอกโค้ด';b.dataset.copyTarget=String(i);pre.insertAdjacentElement('afterend',b);}); }

const feature=(i,t,d,p)=>`<article class="card"><div class="icon">${i}</div><h3>${t}</h3><p>${d}</p><button class="link" data-g="${p}">เปิดดู →</button></article>`;
const pages={
home:()=>`<section class="hero"><div><small>LEARN · THINK · CODE</small><h1>คิดให้เป็น<br><em>โค้ดให้ได้</em> ด้วย Python</h1><p>เรียนรู้บทที่ 2 การแก้ปัญหาด้วยภาษาไพทอน ตั้งแต่การคำนวณค่าโดยสาร ตัวดำเนินการบูลีน การวนซ้ำ เงื่อนไขทางเลือก และฟังก์ชัน สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 2</p><button class="primary" data-g="pre">เริ่มแบบทดสอบก่อนเรียน →</button></div><div class="orb">Py</div></section><div class="stats"><div class="stat"><b>บทที่ 2</b>การแก้ปัญหาด้วยภาษาไพทอน</div><div class="stat"><b>10 + 15</b>ข้อสอบก่อน–หลังเรียน</div><div class="stat"><b>Python</b>คิดและทดลอง</div></div><div class="grid">${feature('🧭','วัตถุประสงค์','รู้เป้าหมายการเรียนรู้','objectives')}${feature('📚','บทเรียน','เรียนรู้หัวข้อ 2.1–2.5','lessons')}${feature('🧪','กิจกรรม','ฝึกแก้ปัญหาผ่านภารกิจ','activities')}${feature('📝','ก่อนเรียน','สำรวจความรู้เดิม','pre')}${feature('🎯','หลังเรียน','ตรวจสอบความเข้าใจ','post')}${feature('📊','ผลการเรียน','ดูคะแนนและพัฒนาการ','results')}</div>`,
guide:()=>`<section class="banner guide-banner"><span class="journey-kicker">📖 HOW TO LEARN</span><h1 class="title">คู่มือการใช้งานเว็บไซต์</h1><p class="lead">ทำตามขั้นตอนทีละข้อ เพื่อเรียนรู้เรื่องการแก้ปัญหาด้วยภาษาไพทอนอย่างเป็นลำดับ</p></section><div class="guide-track">${[['01','👋','เข้าสู่เว็บไซต์','กรอกชื่อ–นามสกุล เลือกชั้นเรียน และระบุเลขที่ เพื่อเข้าสู่ระบบนักเรียน.'],['02','🎯','อ่านวัตถุประสงค์','ดูเป้าหมายการเรียนรู้และแหล่งอ้างอิงก่อนเริ่มเรียน'],['03','📝','ทำแบบทดสอบก่อนเรียน','ตอบคำถาม 10 ข้อเพื่อสำรวจความรู้เดิมของตนเอง'],['04','🗺️','เรียนตามแผนที่บทเรียน','เริ่มจากด่านแรก อ่านแนวคิด ตัวอย่าง และภาพสรุป จากนั้นกด “เรียนจบบทนี้” เพื่อปลดล็อกด่านถัดไป'],['05','🧩','ทำกิจกรรมฝึกปฏิบัติ','อ่านโจทย์แต่ละภารกิจ แล้วลงมือเขียนโค้ดด้วยตนเอง'],['06','💻','ทดลองเขียน Python','ใช้สนามทดลองพิมพ์โค้ด กดทดลองแสดงผล และแก้ไขจนได้ผลตามต้องการ'],['07','🚀','ทำภารกิจท้ายบท','นำความรู้จากบทเรียนไปแก้ปัญหาด้วยตนเอง'],['08','🏁','ทำแบบทดสอบหลังเรียน','ทำแบบทดสอบ 15 ข้อเพื่อทบทวนความเข้าใจหลังเรียน'],['09','📊','ตรวจสอบผลการเรียน','เปิดหน้าผลการเรียนเพื่อดูคะแนนก่อนเรียนและหลังเรียนของตนเอง']].map((x,i)=>`<article class="guide-step"><div class="guide-step-number">${x[0]}</div><div class="guide-step-icon">${x[1]}</div><div class="guide-step-text"><h3>${x[2]}</h3><p>${x[3]}</p></div></article>`).join('')}</div><div class="guide-actions"><button class="guide-cta" data-g="pre">เริ่มเรียน: ทำแบบทดสอบก่อนเรียน <span>→</span></button><button class="guide-cta guide-cta-alt" data-g="lessons">ไปยังแผนที่บทเรียน <span>🗺️</span></button></div>`,
summary:()=>`<section class="banner"><h1 class="title">สรุปบทเรียนทั้งหน่วย</h1><p class="lead">ภาพรวมสรุปเนื้อหาทั้งหมดของบทที่ 2 การแก้ปัญหาด้วยภาษาไพทอน ใช้ทบทวนหลังเรียนครบทุกหัวข้อ</p></section><section class="card summary-card"><h2>🖼️ อินโฟกราฟิกสรุปเนื้อหาทั้งหมด</h2><p>สรุปภาพรวมของบทเรียน ตั้งแต่ระบบคำนวณค่าโดยสารประจำทางไปจนถึงการใช้ฟังก์ชัน</p><img class="lesson-poster" src="summary-overview.png" alt="อินโฟกราฟิกสรุปเนื้อหาทั้งหมดของบทที่ 2" loading="lazy"></section><div class="chapter-controls"><button class="secondary" data-g="lessons">← กลับหน้ารวมบทเรียน</button><button class="primary" data-g="post">ทำแบบทดสอบหลังเรียน →</button></div>`,
objectives:()=>`<section class="objectives-hero"><div class="objectives-kicker">🎯 LEARNING GOALS</div><h1 class="title">วัตถุประสงค์การเรียนรู้</h1><p class="lead">เมื่อเรียนรู้ผ่านเว็บไซต์นี้ นักเรียนจะได้ฝึกคิด วิเคราะห์ ทดลอง และสร้างโปรแกรมอย่างเป็นขั้นตอน</p></section><div class="objectives-grid">${[['01','🧩','เข้าใจหลักการแก้ปัญหา','อธิบายการแยกปัญหาและลำดับขั้นตอนการแก้ปัญหาได้','pink'],['02','💻','ใช้คำสั่ง Python','เลือกใช้ Boolean, while, เงื่อนไข และฟังก์ชันได้เหมาะสม','blue'],['03','🚀','ประยุกต์ใช้แก้ปัญหา','เขียนโปรแกรมอย่างง่ายเพื่อแก้ปัญหาในชีวิตประจำวัน','yellow'],['04','⚙️','คิดอย่างเป็นระบบ','วิเคราะห์เงื่อนไข ตรวจสอบผลลัพธ์ และปรับปรุงวิธีแก้ปัญหา','green'],['05','📈','ประเมินพัฒนาการ','เปรียบเทียบคะแนนก่อนเรียนและหลังเรียน','purple']].map(x=>`<article class="objective-card ${x[4]}"><div class="objective-top"><span class="objective-number">${x[0]}</span><span class="objective-icon">${x[1]}</span></div><h3>${x[2]}</h3><p>${x[3]}</p></article>`).join('')}</div><section class="references-heading"><span>📚 แหล่งข้อมูล</span><h2>ที่มาและเอกสารอ้างอิง</h2><p>เว็บไซต์นี้จัดทำโดยอ้างอิงจากแหล่งข้อมูล 3 แหล่งต่อไปนี้</p></section><div class="references-grid"><article class="reference-card"><span class="reference-number">แหล่งที่ 01</span><h3>หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551</h3><p>กระทรวงศึกษาธิการ. กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี ใช้เป็นกรอบในการกำหนดแนวทางการเรียนรู้และวัตถุประสงค์ของบทเรียน</p></article><article class="reference-card"><span class="reference-number">แหล่งที่ 02</span><h3>หนังสือเรียนวิทยาการคำนวณ ม.2</h3><p>บทที่ 2 เรื่องการแก้ปัญหาด้วยภาษาไพทอน ใช้ประกอบการกำหนดหัวข้อและตัวอย่างเนื้อหา</p><a href="https://fliphtml5.com/byquw/hyri/basic" target="_blank" rel="noopener">เปิดหนังสือบน FlipHTML5 ↗</a></article><article class="reference-card"><span class="reference-number">แหล่งที่ 03</span><h3>ห้องเรียนออนไลน์ครูรพี</h3><p>วิชาวิทยาการคำนวณ ม.2 · บทที่ 2 การแก้ปัญหาด้วยภาษาไพทอน ใช้เป็นแหล่งเรียนรู้ประกอบการจัดทำเว็บไซต์</p><a href="https://sites.google.com/pbn2.go.th/classroomkrurapee/classroom/%E0%B8%AB%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99-%E0%B8%A1-2/%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%B3%E0%B8%99%E0%B8%A7%E0%B8%93-%E0%B8%A1-2/%E0%B8%9A%E0%B8%97%E0%B8%97-2-%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%81%E0%B9%89%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B9%89%E0%B8%A7%E0%B8%A2%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B9%84%E0%B8%พ%E0%B8%97%E0%B8%AD%E0%B8%99" target="_blank" rel="noopener">เปิดบทเรียนต้นฉบับ ↗</a></article></div>`,
lessons:()=>{const done=completedLessons();return `<section class="banner journey-banner"><span class="journey-kicker">🗺️ LEARNING ADVENTURE</span><h1 class="title">แผนที่ผจญภัยแห่ง Python</h1><p class="lead">เริ่มจากจุดเริ่มต้น แล้วเดินทางไปทีละด่าน เมื่อเรียนจบและกด “เรียนจบบทนี้” ด่านถัดไปจึงจะเปิดให้เข้าเรียนได้</p><div class="map-legend"><span>🟢 เรียนจบแล้ว</span><span>🔵 ด่านที่เปิดเรียน</span><span>🔒 ด่านที่ยังล็อก</span></div></section><section class="journey-map real-road-map" aria-label="เส้นทางการเรียนรู้แบบลำดับ"><div class="map-start">🌱 จุดเริ่มต้น</div><div class="map-road" aria-hidden="true"></div>${lessonData.map((l,i)=>{const n=i+1,unlocked=isLessonUnlocked(n),complete=done.includes(n);return `<article class="journey-stop stop-${n} ${complete?'is-complete':''} ${unlocked?'is-unlocked':'is-locked'}"><div class="journey-marker"><span>${complete?'✓':String(n).padStart(2,'0')}</span><small>${complete?'ผ่านด่านแล้ว':n===1?'เริ่มที่นี่':unlocked?'ด่านที่ '+n:'🔒 ล็อกอยู่'}</small></div><div class="journey-card"><div class="journey-card-top"><span class="journey-emoji">${['🚌','🔎','🔁','🚦','🧩'][i]}</span><span class="journey-step">${complete?'✓ เรียนจบแล้ว':unlocked?'บทที่ '+n+' / 5':'🔒 บทที่ '+n}</span></div><h2>${l[0]}</h2><p>${l[1]}</p>${unlocked?`<button class="journey-button" data-g="chapter${n}">${complete?'ทบทวนบทนี้':'เริ่มเรียนบทนี้'} <span>➜</span></button>`:`<button class="journey-button is-disabled" type="button" disabled>เรียนบทก่อนหน้าให้จบก่อน <span>🔒</span></button>`}</div></article>`;}).join('')}<div class="map-finish">🏆 เส้นชัย · เรียนครบทุกบท</div></section><section class="card summary-card"><h2>🧠 สรุปบทเรียนทั้งหน่วย</h2><p>เมื่อเดินทางครบทั้ง 5 ด่านแล้ว สามารถใช้ภาพนี้ทบทวนภาพรวมเนื้อหาบทที่ 2</p><img class="lesson-poster" src="summary-overview.png" alt="อินโฟกราฟิกสรุปเนื้อหาทั้งหมดของบทที่ 2" loading="lazy"></section>`;},
chapter1:()=>chapterPage(0),
chapter2:()=>chapterPage(1),
chapter3:()=>chapterPage(2),
chapter4:()=>chapterPage(3),
chapter5:()=>chapterPage(4),
activities:()=>`<section class="activity-hero"><div class="activity-hero-copy"><span class="activity-kicker">🧩 LEARN BY DOING</span><h1 class="title">ภารกิจฝึกเขียนโค้ด</h1><p class="lead">อ่านโจทย์ คิดเป็นขั้นตอน แล้วลงมือเขียนโปรแกรมด้วยตนเอง ลองทำทีละภารกิจเพื่อฝึกใช้ Python ให้คล่องขึ้น</p><div class="activity-hero-meta"><span>🎯 4 ภารกิจ</span><span>💻 ฝึกเขียนโค้ด</span><span>🌱 เรียนรู้ด้วยการลงมือทำ</span></div></div><div class="activity-hero-art" aria-hidden="true"><span class="activity-art-orbit">✦</span><span class="activity-art-emoji">🧠</span><span class="activity-art-code">{ Py }</span></div></section><div class="activity-section-head"><div><span class="activity-section-kicker">YOUR MISSIONS</span><h2>เลือกภารกิจที่ต้องการทำ</h2></div><p>เริ่มจากภารกิจที่ 1 แล้วค่อย ๆ พัฒนาทักษะไปด้วยกัน</p></div><div class="activity-grid">${[['คำนวณค่าโดยสาร','เขียนโปรแกรมคำนวณค่าโดยสาร โดยกำหนดระยะทาง 8 กิโลเมตร และอัตราค่าโดยสาร 5 บาทต่อกิโลเมตร จากนั้นแสดงค่าโดยสารที่ต้องจ่าย','🚌','การคำนวณ','pink','ใช้ตัวแปรและการคูณ'],['นับเลขด้วย while','ใช้คำสั่ง while แสดงตัวเลขตั้งแต่ 1 ถึง 5 ทีละบรรทัด','🔁','การทำซ้ำ','blue','ฝึกใช้เงื่อนไขและการวนซ้ำ'],['ตรวจสอบคะแนน','กำหนดคะแนน 67 คะแนน แล้วใช้ if/else ตรวจสอบว่าคะแนนตั้งแต่ 50 ขึ้นไปให้แสดง “ผ่าน” มิฉะนั้นแสดง “ฝึกเพิ่ม”','🎯','เงื่อนไข if/else','yellow','ฝึกตัดสินใจตามเงื่อนไข'],['สร้างฟังก์ชัน','สร้างฟังก์ชัน add(a, b) เพื่อรับตัวเลขสองจำนวนและส่งผลบวกกลับ จากนั้นเรียกใช้ฟังก์ชันกับ 7 และ 5','🧩','ฟังก์ชัน','purple','ฝึกสร้างและเรียกใช้ฟังก์ชัน']].map((x,i)=>`<article class="activity-card activity-${x[4]}"><div class="activity-card-top"><span class="activity-number">0${i+1}</span><span class="activity-icon">${x[2]}</span></div><span class="activity-topic">${x[3]}</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="activity-card-foot"><span>✦ ${x[5]}</span><button class="activity-start" data-activity="${i}">เริ่มทำภารกิจ <span>→</span></button></div></article>`).join('')}</div><div class="activity-note"><span>💡</span><p><strong>เคล็ดลับ:</strong> ลองเขียนโค้ดด้วยตนเองก่อน หากติดขัดสามารถเปิดสนามทดลองเพื่อฝึกเพิ่มเติมได้</p></div>`,
playground:()=>`<section class="banner"><h1 class="title">สนามทดลองเขียนโค้ด Python</h1><p class="lead">ลองเขียนและทดลองรัน Python ด้วยตนเอง หรือสุ่มโจทย์จากกล่องภารกิจทั้ง 10 ข้อ (ต้องเชื่อมต่ออินเทอร์เน็ตเพื่อโหลดระบบ Python)</p></section><section class="card random-challenge-card"><div class="random-box-wrap"><div class="random-box" id="random-box" aria-hidden="true">🎁</div><div><span class="challenge-kicker">🎲 RANDOM CHALLENGE</span><h2>กล่องสุ่มโจทย์ Python</h2><p>กดสุ่มเพื่อรับโจทย์ใหม่ แต่ละรอบจะสุ่มโจทย์ที่ยังไม่เคยออกจนครบ 10 ข้อ</p><div id="challenge-progress" class="challenge-progress">${challengeProgressText()}</div><button class="primary draw-challenge-btn" id="draw-challenge">✨ สุ่มโจทย์เลย!</button></div></div><div id="challenge-result" class="challenge-result" aria-live="polite"><p>กล่องนี้มีโจทย์ 10 แบบ รอให้คุณมาสุ่มและลงมือเขียนโค้ด!</p></div></section><div class="grid two"><article class="card"><h3>✍️ เขียนโค้ดของคุณ</h3><textarea id="editor" spellcheck="false" placeholder="พิมพ์โค้ด Python ที่นี่..."></textarea><div class="play-actions"><button class="primary" id="run">▶ ทดลองแสดงผล</button><button class="secondary" id="reset-editor">ล้างโค้ด</button><button class="secondary" id="check-challenge" style="display:none">✅ ตรวจคำตอบ</button><button class="secondary" id="show-solution" style="display:none">💡 ดูเฉลยโจทย์</button></div><section id="solution-panel" class="solution-panel" hidden><h4>🔎 เฉลยโค้ดตัวอย่าง</h4><p>ลองทำด้วยตนเองก่อนนะคะ จากนั้นจึงเปิดดูแนวคำตอบและนำไปทดลองแก้ไขได้</p><textarea id="solution-code" readonly spellcheck="false"></textarea><div class="starter-actions"><button class="secondary" id="copy-solution">📋 คัดลอกเฉลย</button><button class="primary" id="use-solution">นำเฉลยไปใส่ในช่องโค้ด</button></div></section><p id="py-status" class="notice">พร้อมทดลอง · เขียนโค้ดก่อนกด “ทดลองแสดงผล”</p></article><article class="card"><h3>ผลลัพธ์</h3><pre id="output" class="out">ผลลัพธ์จะแสดงที่นี่</pre><div id="challenge-check" class="challenge-check" hidden></div><p class="lead">พิมพ์โค้ดเพื่อทดลองตัวแปร การคำนวณ เงื่อนไข while และฟังก์ชัน · ปุ่ม “ตรวจคำตอบ” จะตรวจโครงสร้างและการทำงานเบื้องต้นตามโจทย์</p></article></div>`,
pre:()=>quizResult(preScore,'ก่อนเรียน'),post:()=>quizResult(postScore,'หลังเรียน'),
results:()=>user.mode==='teacher'?pages.teacher():`<section class="banner"><h1 class="title">สรุปผลการเรียน</h1><p class="lead">ผลการทำแบบทดสอบของ ${user.name}</p></section><div class="stats"><div class="stat"><b>${preScore===null?'—':preScore+'/10'}</b>คะแนนก่อนเรียน</div><div class="stat"><b>${postScore===null?'—':postScore+'/15'}</b>คะแนนหลังเรียน</div><div class="stat"><b>${preScore===null||postScore===null?'—':((Math.round(postScore/15*100)-Math.round(preScore/10*100))>0?'+':'')+(Math.round(postScore/15*100)-Math.round(preScore/10*100))+' จุดเปอร์เซ็นต์'}</b>ผลต่างร้อยละ</div></div><div class="card"><h3>🧪 ความก้าวหน้าสนามทดลอง</h3><p>${challengeProgressText()}</p><p>เปรียบเทียบคะแนนเป็นร้อยละ เนื่องจากก่อนเรียนเต็ม 10 คะแนน และหลังเรียนเต็ม 15 คะแนน</p><button class="primary" data-g="pre">แบบทดสอบก่อนเรียน</button> <button class="primary" data-g="post">แบบทดสอบหลังเรียน</button> <button class="secondary" data-g="playground">ไปสนามทดลอง →</button></div>`,
sources:()=>`<section class="banner"><h1 class="title">แหล่งอ้างอิง</h1><p class="lead">ใช้เป็นแนวทางจัดลำดับหัวข้อบทเรียนเรื่องการแก้ปัญหาด้วยภาษาไพทอน</p></section><div class="grid two"><article class="card"><h3>แหล่งเรียนรู้หลัก</h3><p>ห้องเรียนออนไลน์ครูรพี · วิชาวิทยาการคำนวณ ม.2 · บทที่ 2 การแก้ปัญหาด้วยภาษาไพทอน</p><p><a href="https://sites.google.com/pbn2.go.th/classroomkrurapee/classroom/%E0%B8%AB%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%A3%E0%B8%A2%E0%B8%99-%E0%B8%A1-2/%E0%B8%A7%E0%B8%B4%E0%B8%8A%E0%B8%B2%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%84%E0%B8%B3%E0%B8%99%E0%B8%A7%E0%B8%93-%E0%B8%A1-2/%E0%B8%9A%E0%B8%97%E0%B8%97-2-%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%81%E0%B8%9B%E0%B8%8D%E0%B8%AB%E0%B8%B2%E0%B8%94%E0%B8%A7%E0%B8%A2%E0%B8%A0%E0%B8%B2%E0%B8%A9%E0%B8%B2%E0%B9%84%E0%B8%9E%E0%B8%97%E0%B8%AD%E0%B8%99" target="_blank" rel="noopener">เปิดบทเรียนต้นฉบับ ↗</a></p></article><article class="card"><h3>หนังสือประกอบ</h3><p>หนังสือเรียนวิทยาการคำนวณ ม.2 บทที่ 2 เรื่องการแก้ปัญหาด้วยภาษาไพทอน (ภาพหน้าหนังสือที่ผู้ใช้แนบประกอบการกำหนดหัวข้อ)</p><p><a href="https://fliphtml5.com/byquw/hyri/basic" target="_blank" rel="noopener">เปิดหนังสือบน FlipHTML5 ↗</a></p></article><article class="card"><h3>ขอบเขตเนื้อหาในเว็บไซต์</h3><p>หัวข้อ 2.1 ระบบคำนวณค่าโดยสารประจำทาง · 2.2 ตัวดำเนินการบูลีน · 2.3 while · 2.4 if/elif/else · 2.5 ฟังก์ชัน</p><p class="notice">ตัวอย่างโค้ดและข้อคำถามในเว็บไซต์เรียบเรียงขึ้นเพื่อการฝึกเรียนรู้ ไม่ใช่การคัดลอกข้อสอบต้นฉบับ</p></article></div>`,
about:()=>`<section class="banner"><h1 class="title">ครูผู้สอน</h1><p class="lead">แนะนำผู้จัดทำและผู้สร้างสรรค์สื่อการเรียนรู้ “คิดให้เป็น โค้ดให้ได้ ด้วย Python”</p></section><section class="card teacher-profile-card"><img class="teacher-profile-poster" src="teacher-profile.png" alt="อินโฟกราฟิกแนะนำครูผู้สอน นางสาวนิฟาเดียนา วัน นักศึกษาชั้นปีที่ 4 วิชาเอกเทคโนโลยีและสื่อสารการศึกษา มหาวิทยาลัยทักษิณ" loading="lazy"></section>`,
teacher:()=>teacherPage()
};
const chapterDetails=[
{title:'2.1 ระบบคำนวณค่าโดยสารประจำทาง',intro:'บทนี้ฝึกเปลี่ยนสถานการณ์การเดินทางให้เป็นขั้นตอนคำนวณด้วย Python โดยเริ่มจากรับหรือกำหนดข้อมูลระยะทางและอัตราค่าโดยสาร แล้วนำมาคำนวณยอดเงินที่ต้องจ่าย',analogy:'ลองนึกถึงตั๋วรถโดยสารที่คิดราคา 3 บาทต่อกิโลเมตร หากเดินทาง 12 กิโลเมตร เราต้องนำระยะทางคูณกับราคาต่อกิโลเมตร จึงได้ค่าโดยสาร 36 บาท',concepts:[['ข้อมูลนำเข้า (Input)','ข้อมูลที่ต้องรู้ก่อนคำนวณ เช่น ระยะทางและอัตราค่าโดยสาร'],['การประมวลผล (Process)','นำระยะทางคูณอัตราค่าโดยสาร'],['ผลลัพธ์ (Output)','แสดงยอดค่าโดยสารที่คำนวณได้']],code:'distance = 12\nrate = 3\nfare = distance * rate\nprint("ค่าโดยสาร", fare, "บาท")',output:'ค่าโดยสาร 36 บาท',explain:'บรรทัดแรกกำหนดระยะทาง 12 กิโลเมตร บรรทัดที่สองกำหนดอัตรา 3 บาทต่อกิโลเมตร จากนั้นนำ 12 × 3 เก็บไว้ในตัวแปร fare และใช้ print() แสดงผล',mission:'ถ้าผู้โดยสารเดินทาง 8 กิโลเมตร และคิดค่าโดยสาร 5 บาทต่อกิโลเมตร ให้แก้โปรแกรมเพื่อแสดงค่าโดยสาร 40 บาท',missionCode:'distance = 8\nrate = 5\nfare = distance * rate\nprint(fare)',image:'summary-overview.png',tips:['ตั้งชื่อตัวแปรให้สื่อความหมาย เช่น distance, rate และ fare','เครื่องหมาย * ใช้คูณ ไม่ใช่ x','ตรวจสอบหน่วยและตัวเลขก่อนคำนวณ']},
{title:'2.2 ตัวดำเนินการบูลีน (Boolean Operators)',intro:'ตัวดำเนินการบูลีนใช้เชื่อมเงื่อนไขหรือกลับค่าความจริง ผลลัพธ์จะเป็นค่าความจริงเพียงสองแบบ คือ True (จริง) หรือ False (เท็จ) เหมาะกับปัญหาที่ต้องตรวจสอบหลายข้อพร้อมกัน',analogy:'เหมือนการตรวจสิทธิ์เข้าร่วมกิจกรรม: ต้องมีอายุอย่างน้อย 12 ปี “และ” มีบัตรนักเรียน จึงจะผ่านเงื่อนไข หรือบางกิจกรรมอาจเข้าร่วมได้หากมีบัตรสมาชิก “หรือ” ได้รับอนุญาต',concepts:[['and','เป็น True เมื่อเงื่อนไขทั้งสองด้านเป็นจริงทั้งหมด'],['or','เป็น True เมื่อมีอย่างน้อยหนึ่งเงื่อนไขเป็นจริง'],['not','กลับค่าความจริง: True เป็น False และ False เป็น True']],code:'age = 14\nhas_card = True\nprint(age >= 12 and has_card)\nprint(age < 12 or has_card)\nprint(not has_card)',output:'True\nTrue\nFalse',explain:'อายุ 14 มากกว่าหรือเท่ากับ 12 และ has_card เป็น True จึงได้ True ในบรรทัดที่สอง เงื่อนไขด้านขวาเป็นจริงจึงทำให้ or ได้ True ส่วน not กลับ True ให้เป็น False',mission:'กำหนด age = 11 และ has_card = False แล้วตรวจว่าผู้เรียนผ่านเงื่อนไข age >= 12 and has_card หรือไม่',missionCode:'age = 11\nhas_card = False\nprint(age >= 12 and has_card)',image:'summary-boolean.png',tips:['True และ False ต้องขึ้นต้นด้วยตัวพิมพ์ใหญ่','and ต้องจริงทั้งสองด้าน ส่วน or ขอเพียงด้านใดด้านหนึ่งจริง','ใช้ not เมื่อต้องการกลับค่าความจริง']},
{title:'2.3 การทำงานซ้ำด้วย while',intro:'คำสั่ง while ใช้สั่งให้โปรแกรมทำชุดคำสั่งซ้ำตราบใดที่เงื่อนไขยังเป็นจริง เหมาะกับงานนับจำนวนหรือทำซ้ำจนกว่าจะถึงเงื่อนไขที่กำหนด',analogy:'ลองนึกถึงการนับเลข 1 ถึง 5: เริ่มที่ 1 ตรวจว่าตัวเลขยังไม่เกิน 5 หรือไม่ ถ้ายังใช่ก็แสดงตัวเลขแล้วเพิ่มทีละ 1 เมื่อเป็น 6 เงื่อนไขเป็นเท็จและหยุดทำซ้ำ',concepts:[['ค่าเริ่มต้น','กำหนดค่าตัวแปรก่อนเริ่มวนซ้ำ'],['เงื่อนไข while','ตรวจสอบก่อนทำคำสั่งในแต่ละรอบ'],['การเปลี่ยนค่า','ปรับตัวแปรให้เงื่อนไขเปลี่ยนเป็น False เพื่อหยุดลูป']],code:'number = 1\nwhile number <= 5:\n    print(number)\n    number = number + 1',output:'1\n2\n3\n4\n5',explain:'เริ่ม number ที่ 1 จากนั้น while ตรวจว่า number <= 5 หรือไม่ เมื่อจริงจะแสดงค่าและเพิ่ม number ทีละ 1 ทำซ้ำจน number เป็น 6 ซึ่งเงื่อนไขเป็นเท็จ จึงหยุด',mission:'ปรับโปรแกรมให้นับเลขตั้งแต่ 1 ถึง 10 โดยแสดงทีละบรรทัด',missionCode:'number = 1\nwhile number <= 10:\n    print(number)\n    number = number + 1',image:'summary-while.png',tips:['อย่าลืมเครื่องหมาย : หลังเงื่อนไข while','คำสั่งภายในลูปต้องเยื้องบรรทัด','อย่าลืมปรับค่าตัวแปร มิฉะนั้นอาจวนซ้ำไม่สิ้นสุด']},
{title:'2.4 เงื่อนไขทางเลือก if / elif / else',intro:'ใช้เลือกให้โปรแกรมทำงานแตกต่างกันตามเงื่อนไขที่ตรวจสอบ โดย if ตรวจเงื่อนไขแรก elif ใช้ตรวจเงื่อนไขเพิ่มเติม และ else ทำงานเมื่อไม่มีเงื่อนไขก่อนหน้าเป็นจริง',analogy:'เหมือนการแบ่งระดับผลคะแนน: คะแนนตั้งแต่ 80 ขึ้นไปได้ระดับดีมาก คะแนนตั้งแต่ 50 แต่ไม่ถึง 80 ได้ระดับผ่าน และคะแนนต่ำกว่า 50 ให้ฝึกเพิ่มเติม โปรแกรมจะเลือกทำเพียงกรณีที่ตรงตามเงื่อนไข',concepts:[['if','ตรวจสอบเงื่อนไขแรก หากเป็นจริงให้ทำชุดคำสั่งนั้น'],['elif','ตรวจเงื่อนไขอื่นต่อเมื่อเงื่อนไขก่อนหน้าไม่จริง'],['else','เป็นทางเลือกสุดท้ายเมื่อไม่มีเงื่อนไขก่อนหน้าเป็นจริง']],code:'score = 78\nif score >= 80:\n    print("ดีมาก")\nelif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ฝึกเพิ่ม")',output:'ผ่าน',explain:'คะแนน 78 ไม่ถึง 80 จึงไม่เข้า if แต่ผ่านเงื่อนไข score >= 50 ใน elif โปรแกรมจึงแสดง “ผ่าน” และไม่ตรวจส่วน else ต่อ',mission:'ทดลองเปลี่ยน score เป็น 45 แล้วสังเกตว่าผลลัพธ์เปลี่ยนเป็น “ฝึกเพิ่ม” เพราะเหตุใด',missionCode:'score = 45\nif score >= 80:\n    print("ดีมาก")\nelif score >= 50:\n    print("ผ่าน")\nelse:\n    print("ฝึกเพิ่ม")',image:'summary-if-else.png',tips:['ใช้เครื่องหมาย : หลัง if, elif และ else','เยื้องคำสั่งภายในแต่ละเงื่อนไขให้ถูกต้อง','เรียงเงื่อนไขจากกรณีเฉพาะไปหากรณีทั่วไปอย่างรอบคอบ']},
{title:'2.5 ฟังก์ชัน (Function)',intro:'ฟังก์ชันคือชุดคำสั่งที่ตั้งชื่อไว้เพื่อเรียกใช้งานได้หลายครั้ง ช่วยแบ่งโปรแกรมให้เป็นส่วนย่อย ลดการเขียนโค้ดซ้ำ และทำให้ดูแลแก้ไขได้ง่ายขึ้น',analogy:'เหมือนเครื่องปั่นน้ำผลไม้: เราใส่ส่วนผสมเข้าไป เครื่องทำงานตามขั้นตอน แล้วได้ผลลัพธ์ออกมา ฟังก์ชันก็รับข้อมูลผ่านพารามิเตอร์ ประมวลผล และอาจส่งค่ากลับด้วย return',concepts:[['def','ใช้ประกาศสร้างฟังก์ชันพร้อมตั้งชื่อ'],['พารามิเตอร์ (parameter)','ช่องรับข้อมูลที่ฟังก์ชันต้องใช้ เช่น name หรือ a, b'],['return','ส่งค่าผลลัพธ์กลับไปยังจุดที่เรียกใช้ฟังก์ชัน']],code:'def greet(name):\n    return "สวัสดี " + name\n\nmessage = greet("มีนา")\nprint(message)',output:'สวัสดี มีนา',explain:'def สร้างฟังก์ชันชื่อ greet ที่รับข้อมูล name เมื่อเรียก greet("มีนา") ค่าข้อความจะถูกส่งเข้าไปและ return ส่งข้อความ “สวัสดี มีนา” กลับมาเก็บใน message ก่อนแสดงผล',mission:'สร้างฟังก์ชัน add(a, b) ให้ส่งผลบวกกลับด้วย return แล้วเรียกใช้กับ 7 และ 5 เพื่อให้ได้ 12',missionCode:'def add(a, b):\n    return a + b\n\nprint(add(7, 5))',image:'summary-functions.png',tips:['บรรทัดที่อยู่ในฟังก์ชันต้องเยื้อง','การประกาศฟังก์ชันยังไม่ทำงานจนกว่าจะเรียกใช้','return ใช้ส่งค่ากลับ ส่วน print ใช้แสดงผล']}
];
function chapterPage(i){const d=chapterDetails[i];return `<section class="banner chapter-banner"><small>บทเรียนที่ ${i+1} จาก 5</small><h1 class="title">${d.title}</h1><p class="lead">${d.intro}</p></section><article class="card lesson-section"><h2>💡 ลองนึกภาพตาม</h2><p>${d.analogy}</p></article><article class="card lesson-section"><h2>📘 แนวคิดสำคัญ</h2><div class="concept-list">${d.concepts.map(c=>`<div class="concept-item"><h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('')}</div></article><article class="card lesson-section"><h2>💻 ตัวอย่างโค้ด</h2><p>อ่านโค้ดทีละบรรทัด แล้วลองคาดเดาผลลัพธ์ก่อนดูเฉลย</p><pre class="code">${d.code}</pre><h3>ผลลัพธ์ที่ได้</h3><pre class="output-code">${d.output}</pre><div class="explanation"><b>อธิบายการทำงาน:</b> ${d.explain}</div><button class="primary" data-code="${i}">เปิดโค้ดตัวอย่างในสนามทดลอง →</button></article><article class="card lesson-section"><h2>🧠 จุดที่ควรจำ</h2><ul class="tip-list">${d.tips.map(t=>`<li>${t}</li>`).join('')}</ul></article><article class="card mission-card"><small>MISSION · ภารกิจท้ายบท</small><h2>🎯 ลองทำด้วยตนเอง</h2><p>${d.mission}</p><pre class="code">${d.missionCode}</pre><button class="primary" data-mission-code="${encodeURIComponent(d.missionCode)}">เปิดภารกิจในสนามทดลอง →</button></article><article class="card summary-card"><h2>🖼️ ${i===0?'อินโฟกราฟิกประกอบบทเรียน':'สรุปเนื้อหาประจำบท'}</h2><p>${i===0?'ทบทวนขั้นตอนการแก้ปัญหาและทำความรู้จักเครื่องมือ IDE ซึ่งช่วยในการเขียนและทดสอบโปรแกรม':'ใช้ภาพนี้ทบทวนแนวคิดสำคัญหลังเรียนจบ'}</p>${i===0?`<div class="overview-poster-grid"><figure><img src="summary-problem-solving.png" alt="อินโฟกราฟิกขั้นตอนการแก้ปัญหาด้วยโปรแกรม" loading="lazy"><figcaption>ขั้นตอนการแก้ปัญหาด้วยโปรแกรม</figcaption></figure><figure><img src="summary-ide.png" alt="อินโฟกราฟิกความหมายและเครื่องมือของ IDE" loading="lazy"><figcaption>IDE: เครื่องมือช่วยเขียนและทดสอบโปรแกรม</figcaption></figure></div>`:`<img class="lesson-poster" src="${d.image}" alt="ภาพสรุปเนื้อหาประจำบท ${i+1}" loading="lazy">`}</article><div class="chapter-controls lesson-finish-controls"><button class="secondary" data-g="lessons">🗺️ กลับแผนที่</button><button class="primary" data-complete-lesson="${i+1}">${completedLessons().includes(i+1)?'✓ เรียนจบแล้ว · ไปต่อ':'🌟 เรียนจบบทนี้และปลดล็อกด่านถัดไป'} →</button></div>`;}
function quizResult(score,title){
 if(score!==null){
  const qs=title==='ก่อนเรียน'?pre:post, explanations=title==='ก่อนเรียน'?preExplain:postExplain, total=qs.length;
  const review=qs.map((q,i)=>{const chosen=quizAnswers[i],correct=q[2],ok=chosen===correct;return `<article class="card review-card"><div class="review-head"><strong>ข้อ ${i+1}</strong><span class="review-badge ${ok?'correct':'wrong'}">${ok?'✓ ตอบถูก':'✗ ตอบผิด'}</span></div><h3>${q[0]}</h3><p><b>คำตอบที่เลือก:</b> ${chosen===undefined?'ไม่ได้ตอบ':`${['ก','ข','ค','ง'][chosen]}. ${q[1][chosen]}`}</p><p><b>เฉลย:</b> ${['ก','ข','ค','ง'][correct]}. ${q[1][correct]}</p><div class="explanation"><b>คำอธิบาย:</b> ${explanations[i]}</div></article>`;}).join('');
  return `<section class="banner"><h1 class="title">ผลแบบทดสอบ${title}</h1><p class="lead">ตรวจคำตอบพร้อมอ่านเฉลยและคำอธิบายรายข้อ</p></section><div class="card score-card"><h1 style="font-size:55px;color:var(--blue)">${score} / ${total}</h1><p>คะแนนที่ได้ · ${Math.round(score/total*100)}%</p><p>${score/total>=0.8?'ทำได้ดีมาก ลองทบทวนข้อที่ตอบผิดเพื่อเพิ่มความเข้าใจ':score/total>=0.5?'ทำได้ดี ลองอ่านคำอธิบายข้อที่ตอบผิดและทบทวนบทเรียน':'ลองอ่านเฉลยและคำอธิบาย แล้วกลับไปทบทวนบทเรียนอีกครั้ง'}</p><button class="primary" data-g="${title==='ก่อนเรียน'?'lessons':'results'}">${title==='ก่อนเรียน'?'ไปยังบทเรียน →':'ดูผลการเรียน →'}</button></div><section class="review-list"><h2>เฉลยและคำอธิบายรายข้อ</h2>${review}</section>`;
 }
 return `<section class="banner"><h1 class="title">แบบทดสอบ${title}</h1><p class="lead">เลือกคำตอบที่ถูกต้องที่สุด จำนวน ${title==='ก่อนเรียน'?pre.length:post.length} ข้อ คะแนนเต็ม ${title==='ก่อนเรียน'?pre.length:post.length} คะแนน</p><div class="progress"><span id="bar" style="width:0"></span></div><div id="qnum">ข้อ 1 จาก ${title==='ก่อนเรียน'?pre.length:post.length}</div></section><div id="qbox"></div><button class="primary" id="next" disabled>ถัดไป →</button>`;
}
function startQuiz(type){if((type==='pre'?preScore:postScore)!==null)return;quizType=type;quizIdx=0;quizAnswers={};setTimeout(showQ,0);}
function showQ(){const qs=quizType==='pre'?pre:post,q=qs[quizIdx];if(!q)return;$('#bar').style.width=((quizIdx+1)/qs.length*100)+'%';$('#qnum').textContent=`ข้อ ${quizIdx+1} จาก ${qs.length}` ;$('#qbox').innerHTML=`<article class="card"><small>QUESTION ${quizIdx+1}</small><h3>${q[0]}</h3>${q[1].map((o,i)=>`<button class="opt ${quizAnswers[quizIdx]===i?'selected':''}" data-opt="${i}">${['ก','ข','ค','ง'][i]}. ${o}</button>`).join('')}</article>`;$('#next').disabled=quizAnswers[quizIdx]===undefined;$('#next').textContent=quizIdx===qs.length-1?'ส่งคำตอบและดูคะแนน ✓':'ถัดไป →';$('#qbox').querySelectorAll('[data-opt]').forEach(b=>b.onclick=()=>{quizAnswers[quizIdx]=+b.dataset.opt;showQ();});}
async function executePythonCode(code){
  const py=await loadPyodideRuntime();let captured='';
  py.setStdout({batched:(text)=>{captured+=text+'\n';}});
  await py.runPythonAsync(code);
  return captured.trimEnd();
}
function validateChallengeCode(code,output){
  if(!currentChallenge)return {ok:false,message:'กรุณาสุ่มโจทย์ก่อน'};
  if(code.includes('___'))return {ok:false,message:'ยังมีช่องว่าง ___ อยู่ค่ะ ลองเติมตัวเลขหรือข้อมูลให้ครบก่อนนะ'};
  const has=(...xs)=>xs.every(x=>code.includes(x));
  let ok=false,detail='';
  switch(currentChallenge.title){
    case 'คำนวณค่าโดยสาร': ok=has('distance','rate','fare','*','print'); detail='ตรวจพบตัวแปรระยะทาง อัตราค่าโดยสาร การคูณ และการแสดงผล'; break;
    case 'ตรวจสอบสิทธิ์ส่วนลด': ok=has('age','has_card','or','if','print'); detail='ตรวจพบการใช้ตัวแปรและตัวดำเนินการ or ร่วมกับ if'; break;
    case 'นับเลข 1 ถึง 10': ok=has('while','print','n += 1') && /while\s+n\s*<=\s*10/.test(code); detail='ตรวจพบ while และการเพิ่มค่าตัวนับจนถึง 10'; break;
    case 'แปลผลคะแนน': ok=has('score','if','elif','else','80','50','print'); detail='ตรวจพบ if/elif/else และเกณฑ์คะแนนที่โจทย์กำหนด'; break;
    case 'สร้างฟังก์ชันทักทาย': ok=has('def greet(name):','return','print','greet('); detail='ตรวจพบฟังก์ชัน greet การรับพารามิเตอร์ การคืนค่า และการเรียกใช้'; break;
    case 'รวมยอดซื้อสินค้า': ok=has('price1','price2','price3','total','+','print'); detail='ตรวจพบตัวแปรราคาทั้ง 3 รายการ การบวก และการแสดงยอดรวม'; break;
    case 'ตรวจสอบเลขคู่เลขคี่': ok=has('number','% 2','if','else','print'); detail='ตรวจพบการใช้เศษจากการหาร 2 เพื่อแยกเลขคู่และเลขคี่'; break;
    case 'นับถอยหลัง': ok=has('while','print','n -= 1','เริ่ม!') && /while\s+n\s*>=\s*1/.test(code); detail='ตรวจพบ while การลดค่าตัวนับ และการแสดง “เริ่ม!”'; break;
    case 'ตรวจสอบช่วงคะแนน': ok=has('score','and','>= 50','<= 100','if','else','print'); detail='ตรวจพบการใช้ and เพื่อตรวจช่วง 50–100'; break;
    case 'ฟังก์ชันคำนวณพื้นที่': ok=has('def area(width, height):','return','width * height','print','area('); detail='ตรวจพบฟังก์ชัน area พารามิเตอร์ และ return สำหรับคำนวณพื้นที่'; break;
  }
  if(!ok)return {ok:false,message:'โครงสร้างโค้ดยังไม่ครบตามภารกิจ ลองอ่าน “แนวทาง” แล้วแก้ไขอีกครั้งนะ'};
  if(!output || /Traceback|Error|SyntaxError|NameError|TypeError/.test(output))return {ok:false,message:'โค้ดมีข้อผิดพลาดหรือยังไม่แสดงผลลัพธ์ ลองกด “ทดลองแสดงผล” และแก้ไขก่อนค่ะ'};
  return {ok:true,message:'เยี่ยมมาก! โค้ดมีโครงสร้างสอดคล้องกับโจทย์และทำงานได้',detail};
}
async function checkChallenge(){
  const box=$('#challenge-check'),editor=$('#editor'),checkBtn=$('#check-challenge');
  if(!currentChallenge||!editor||!box)return;
  if(checkBtn)checkBtn.disabled=true;
  box.hidden=false;box.className='challenge-check checking';box.innerHTML='<b>🔍 กำลังตรวจคำตอบ…</b><p>กำลังทดลองรันโค้ดและตรวจโครงสร้างตามโจทย์</p>';
  try{
    const output=await executePythonCode(editor.value),result=validateChallengeCode(editor.value,output);
    if(result.ok){markChallengePassed();record('challenge_complete',{challenge:currentChallenge.title});box.className='challenge-check success';box.innerHTML=`<b>🎉 ผ่านภารกิจ!</b><p>${result.message}</p><small>${result.detail}</small><div class="challenge-progress-inline">${challengeProgressText()}</div>`;const progress=$('#challenge-progress');if(progress)progress.textContent=challengeProgressText();}
    else{box.className='challenge-check fail';box.innerHTML=`<b>💡 ลองอีกครั้ง</b><p>${result.message}</p><small>ยังไม่เปิดเฉลยนะ ลองปรับโค้ดตามโจทย์แล้วตรวจใหม่ได้เลย</small>`;}
  }catch(err){box.className='challenge-check fail';box.innerHTML=`<b>⚠️ ตรวจไม่ได้</b><p>${String(err)}</p><small>ลองแก้โค้ดให้รันได้ก่อน แล้วตรวจอีกครั้ง</small>`;}
  finally{if(checkBtn)checkBtn.disabled=false;}
}
document.addEventListener('click',e=>{
  const target=e.target instanceof Element ? e.target : null;
  if(!target) return;
  const navBtn=target.closest('#nav [data-p]');
  if(navBtn){e.preventDefault();go(navBtn.dataset.p);return;}
  const finishLesson=target.closest('[data-complete-lesson]');
  if(finishLesson){e.preventDefault();const n=Number(finishLesson.dataset.completeLesson);markLessonComplete(n);record('lesson_complete',{lesson:n});if(n<5){alert(`🎉 เยี่ยมมาก! จบบทที่ ${n} แล้ว ปลดล็อกบทที่ ${n+1} เรียบร้อยค่ะ`);go('lessons');}else{alert('🏆 ยินดีด้วย! เรียนครบทั้ง 5 บทแล้ว');go('lessons');}return;}
  const g=target.closest('[data-g]');
  if(g){e.preventDefault();go(g.dataset.g);return;}
  if(target.closest('#draw-challenge')){e.preventDefault();const btn=target.closest('#draw-challenge'),box=$('#random-box'),result=$('#challenge-result');if(!box||!result)return;btn.disabled=true;box.classList.remove('spinning');void box.offsetWidth;box.classList.add('spinning');result.innerHTML='<p class="drawing-text">🎲 กำลังสุ่มโจทย์…</p>';setTimeout(()=>{currentChallenge=drawChallenge();box.classList.remove('spinning');box.textContent='🎉';const solutionBtn=$('#show-solution'),solutionPanel=$('#solution-panel');if(solutionBtn)solutionBtn.style.display='inline-flex';if(solutionPanel)solutionPanel.hidden=true;const editor=$('#editor'),output=$('#output'),status=$('#py-status'),checkBtn=$('#check-challenge'),checkBox=$('#challenge-check'),progress=$('#challenge-progress');if(editor)editor.value='';if(output)output.textContent='ผลลัพธ์จะแสดงที่นี่';if(checkBox){checkBox.hidden=true;checkBox.innerHTML='';}if(checkBtn)checkBtn.style.display='inline-flex';if(status)status.textContent='สุ่มโจทย์แล้ว · ลองทำด้วยตนเองก่อน แล้วกด “ตรวจคำตอบ” เมื่อพร้อม';if(progress)progress.textContent=challengeProgressText();result.innerHTML=`<div class="challenge-tag">โจทย์สุ่ม · ${getChallengeState().cycle.length}/10</div><h3>${currentChallenge.title}</h3><p class="challenge-topic">${currentChallenge.topic}</p><p>${currentChallenge.task}</p><div class="challenge-hint"><b>💡 แนวทาง:</b> ${currentChallenge.hint}</div><div class="challenge-goal"><b>🎯 เป้าหมาย:</b> ${currentChallenge.goal}</div><div class="starter-code-box"><h4>🧩 โค้ดตั้งต้น (เติมตัวเลข/ข้อมูลในช่องว่าง)</h4><p>กด “นำโค้ดไปใส่ในสนามทดลอง” หรือคัดลอกโค้ดไปวาง แล้วแทนที่เครื่องหมาย ___ ด้วยตัวเลขหรือข้อมูลที่เหมาะสม โค้ดตั้งต้นยังไม่สมบูรณ์จนกว่าคุณจะแก้ไข</p><textarea id="challenge-starter" readonly spellcheck="false">${currentChallenge.starterCode}</textarea><div class="starter-actions"><button class="secondary" id="copy-challenge-starter">📋 คัดลอกโค้ด</button><button class="primary" id="use-challenge">นำโค้ดไปใส่ในสนามทดลอง ↓</button></div></div>`;btn.disabled=false;},850);return;}
  if(target.closest('#show-solution')){e.preventDefault();if(!currentChallenge){alert('กรุณาสุ่มโจทย์ก่อน จึงจะดูเฉลยได้');return;}const panel=$('#solution-panel'),code=$('#solution-code');if(panel&&code){code.value=currentChallenge.solutionCode||'ยังไม่มีเฉลยสำหรับโจทย์นี้';panel.hidden=!panel.hidden;if(!panel.hidden)panel.scrollIntoView({behavior:'smooth',block:'nearest'});}return;}
  if(target.closest('#use-solution')){e.preventDefault();const ed=$('#editor');if(ed&&currentChallenge){ed.value=currentChallenge.solutionCode||'';ed.focus();ed.scrollIntoView({behavior:'smooth',block:'center'});}return;}
  if(target.closest('#copy-solution')){e.preventDefault();const code=$('#solution-code');if(code)copyText(code.value,target.closest('#copy-solution'));return;}
  if(target.closest('#use-challenge')){e.preventDefault();const ed=$('#editor');if(ed){ed.value=currentChallenge?.starterCode||'';ed.placeholder='เติมตัวเลขหรือข้อมูลในโค้ดตั้งต้น แล้วทดลองรัน';ed.focus();ed.scrollIntoView({behavior:'smooth',block:'center'});}return;}
  if(target.closest('#copy-challenge-starter')){e.preventDefault();const starter=$('#challenge-starter');if(starter)copyText(starter.value,target.closest('#copy-challenge-starter'));return;}
  const codeBtn=target.closest('[data-code]');
  if(codeBtn){e.preventDefault();go('playground');return;}
  const missionCode=target.closest('[data-mission-code]');
  if(missionCode){e.preventDefault();go('playground');return;}
  const activityBtn=target.closest('[data-activity]');
  if(activityBtn){e.preventDefault();go('playground');return;}
  const openCode=target.closest('[data-open-code]');
  if(openCode){e.preventDefault();go('playground');setTimeout(()=>{const ed=$('#editor');if(ed)ed.value=openCode.dataset.openCode.replace(/\\\\n/g,'\\n');},50);return;}
  const copyBtn=target.closest('[data-copy-target]');
  if(copyBtn){e.preventDefault();const pres=$$('#content pre.code');const pre=pres[Number(copyBtn.dataset.copyTarget)];if(pre)copyText(pre.textContent,copyBtn);return;}
  if(target.closest('#clear-student-data')){e.preventDefault();if(confirm('ยืนยันลบข้อมูลนักเรียนทั้งหมดที่บันทึกไว้ในเบราว์เซอร์นี้หรือไม่? การลบไม่สามารถย้อนกลับได้ และจะไม่ลบข้อมูลใน Google Sheets')){records=[];localStorage.removeItem('pyRecords');go('teacher');}return;}
  if(target.closest('#copy-editor')){e.preventDefault();const ed=$('#editor');if(ed)copyText(ed.value,target.closest('#copy-editor'));return;}
  if(target.closest('#reset-editor')){e.preventDefault();const ed=$('#editor');if(ed)ed.value="";const out=$('#output');if(out)out.textContent='ผลลัพธ์จะแสดงที่นี่';const st=$('#py-status');if(st)st.textContent='ล้างโค้ดแล้ว · เขียนโค้ดใหม่ได้เลย';return;}
  if(target.closest('#next')){
    const qs=quizType==='pre'?pre:post;
    if(quizIdx<qs.length-1){quizIdx++;showQ();}
    else{const score=qs.reduce((s,q,i)=>s+(quizAnswers[i]===q[2]?1:0),0);if(quizType==='pre')preScore=score;else postScore=score;record(quizType==='pre'?'pretest':'posttest',{score,total:qs.length});go(quizType);}
    return;
  }
  if(target.closest('#check-challenge')){e.preventDefault();checkChallenge();return;}
  if(target.closest('#run')){
    e.preventDefault();runPythonCode();return;
  }
});
async function copyText(textValue,button){
  try{await navigator.clipboard.writeText(textValue);}
  catch{const ta=document.createElement('textarea');ta.value=textValue;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}
  const old=button.textContent;button.textContent='คัดลอกแล้ว ✓';setTimeout(()=>button.textContent=old,1400);
}
let pyodideInstance=null,pyodideLoading=null;
async function loadPyodideRuntime(){
  if(pyodideInstance)return pyodideInstance;
  if(!pyodideLoading){
    pyodideLoading=new Promise((resolve,reject)=>{
      if(window.loadPyodide){resolve();return;}
      const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';script.onload=resolve;script.onerror=()=>reject(new Error('โหลดระบบ Python ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง'));document.head.appendChild(script);
    }).then(()=>window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'}));
  }
  pyodideInstance=await pyodideLoading;return pyodideInstance;
}
async function runPythonCode(){
  const editor=$('#editor'),output=$('#output'),status=$('#py-status'),button=$('#run');if(!editor||!output)return;
  const code=editor.value;output.textContent='กำลังประมวลผล…';if(status)status.textContent='กำลังเตรียมระบบ Python…';if(button)button.disabled=true;
  try{
    const captured=await executePythonCode(code);
    output.textContent=captured||'โปรแกรมทำงานเสร็จแล้ว แต่ไม่มีคำสั่งแสดงผล';
    if(status)status.textContent='ทำงานสำเร็จ ✓ สามารถแก้โค้ดแล้วทดลองใหม่ได้';record('code_run',{success:true});
  }catch(err){output.textContent=String(err);if(status)status.textContent='เกิดข้อผิดพลาด · ตรวจสอบโค้ดแล้วลองอีกครั้ง';record('code_run',{success:false,error:String(err).slice(0,250)});}
  finally{if(button)button.disabled=false;}
}

function teacherPage(){
 let map={};
 records.forEach(r=>{
  if(!r.name||r.kind==='login')return;
  let k=[r.name,r.className,r.no].join('|');
  map[k] ||= {name:r.name,cls:r.className,no:r.no,pre:'—',post:'—',activity:0,challenges:new Set(),lessons:new Set()};
  if(r.kind==='pretest')map[k].pre=r.score+'/10';
  if(r.kind==='posttest')map[k].post=r.score+'/15';
  if(r.kind==='activity')map[k].activity+=r.score||0;
  if(r.kind==='challenge_complete'&&r.challenge)map[k].challenges.add(r.challenge);
  if(r.kind==='lesson_complete'&&Number(r.lesson)>=1&&Number(r.lesson)<=5)map[k].lessons.add(Number(r.lesson));
 });
 let list=Object.values(map);
 list.forEach(x=>{
  const done=[...x.lessons].sort((a,b)=>a-b);
  let unlocked=1;
  while(unlocked<5&&x.lessons.has(unlocked))unlocked++;
  x.lessonDone=done.length?`${done.map(n=>'บทที่ '+n).join(', ')} (${done.length}/5)`:'ยังไม่เริ่ม';
  x.lessonUnlocked=done.length===5?'ปลดล็อกครบ 5 บท':`บทที่ ${unlocked}${x.lessons.has(unlocked)?' (เรียนจบแล้ว)':' (กำลังเรียน/เปิดเรียน)'}`;
 });
 return `<section class="banner"><h1 class="title">สำหรับครู · ภาพรวมการเรียนรู้</h1><p class="lead">ข้อมูลในเครื่องปัจจุบัน หากต้องการรวมข้อมูลจากทุกอุปกรณ์ ให้ตั้งค่า Google Sheets ตาม README</p></section><div class="stats"><div class="stat"><b>${list.length}</b>ผู้เรียนที่มีข้อมูล</div><div class="stat"><b>${records.filter(r=>r.kind==='pretest').length}</b>ครั้งก่อนเรียน</div><div class="stat"><b>${records.filter(r=>r.kind==='posttest').length}</b>ครั้งหลังเรียน</div></div><div class="row"><input id="search" placeholder="ค้นหาชื่อนักเรียน"><select id="filter"><option value="">ทุกชั้นเรียน</option>${[...new Set(list.map(x=>x.cls).filter(Boolean))].map(x=>`<option>${x}</option>`).join('')}</select><button id="clear-student-data" class="danger" type="button">ล้างข้อมูลนักเรียน</button></div><div class="tablewrap"><table id="tbl"><thead><tr><th>ชื่อ</th><th>ชั้น</th><th>เลขที่</th><th>ก่อนเรียน</th><th>หลังเรียน</th><th>กิจกรรม</th><th>โจทย์สนามทดลอง</th><th>บทเรียนที่เรียนจบ</th><th>บทที่ปลดล็อก/กำลังเรียน</th></tr></thead><tbody>${list.map(x=>`<tr><td>${x.name}</td><td>${x.cls}</td><td>${x.no}</td><td>${x.pre}</td><td>${x.post}</td><td>${x.activity}</td><td>${x.challenges.size}/10</td><td>${x.lessonDone}</td><td>${x.lessonUnlocked}</td></tr>`).join('')||'<tr><td colspan="9">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></div>`;
}

function filterTeacherTable(){
  const q=($('#search')?.value||'').trim().toLowerCase(),cls=$('#filter')?.value||'';
  $$('#tbl tbody tr').forEach(row=>{
    const cells=row.querySelectorAll('td');
    if(!cells.length)return;
    const matchName=(cells[0].textContent||'').toLowerCase().includes(q),matchClass=!cls||(cells[1].textContent||'')===cls;
    row.style.display=(matchName&&matchClass)?'':'none';
  });
}
document.addEventListener('input',e=>{if(e.target?.id==='search')filterTeacherTable();});
document.addEventListener('change',e=>{if(e.target?.id==='filter')filterTeacherTable();});
