console.log("Hive Custom Script V1.7.2 - ymahendrarajah@alec.ae");

// Filter Button Functions
function Includes(object,value){return Object.values(object).includes(value);}
function FilterView(){
  let NotificationType = jQuery('#filterButtons input[name=NotificationType]:checked').val();
  let ItemType = jQuery('#filterButtons input[name=ItemType]:checked').val();
  document.querySelectorAll('.subjRow').forEach(function(r){
    let cl=r.classList;
    cl.remove('hidden');
    if((Includes(cl,NotificationType) || NotificationType == "All") && (Includes(cl,ItemType) || ItemType == "All")){}else{
    cl.add('hidden');}
  });
  filterSortHistory();
}

function DoChanges(){
  document.querySelectorAll('.typeIcon').forEach(function(icon) {
    icon.classList.remove('Approval', 'FYI');
    if (icon.innerText == 'A'){icon.classList.add('Approval');}
    else if (icon.innerText == 'F'){icon.classList.add('FYI');icon.innerText = 'i';}
  });
  document.querySelectorAll('.statCol').forEach(function(icon) {
    icon.classList.remove('readStatus');
    if (icon.innerText == 'Read'){icon.classList.add('readStatus');}
  });
  var fn = "msgFrameReset();displayMsg(jQuery('div.subjRow.selSubjRow > div.subjRowSelect'));";
  jQuery('#refreshButton').attr('onclick', fn);
};
DoChanges();

function AddFilters() {
  var btn = `
  <span id="NotificationType">Notification of: 
    <input type="radio" checked value="All" id="N_All" name="NotificationType"><label for="N_All">Both</label>
    <input type="radio" class="hideLabel" value="Approval" id="N_Approval" name="NotificationType"><label for="N_Approval">Approval</label>
    <input type="radio" class="hideLabel" value="FYI" id="N_FYI" name="NotificationType"><label for="N_FYI">FYI</label>
  </span>
  <span id="ItemType">for: 
    <input type="radio" checked value="All" id="F_All" name="ItemType"><label for="F_All">All</label>
    <input type="radio" class="hideLabel" value="ALCREQAP" id="F_ALCREQAP" name="ItemType"><label for="F_ALCREQAP">PR</label>
    <input type="radio" class="hideLabel" value="ALCPOA" id="F_ALCPOA" name="ItemType"><label for="F_ALCPOA">PO</label>
    <input type="radio" class="hideLabel" value="ALCPOCOA" id="F_ALCPOCOA" name="ItemType"><label for="F_ALCPOCOA">PO Change Order</label>
    <input type="radio" class="hideLabel" value="ALCSCRFP" id="F_ALCSCRFP" name="ItemType"><label for="F_ALCSCRFP">RFP</label>
    <input type="radio" class="hideLabel" value="ALECAC" id="F_ALECAC" name="ItemType"><label for="F_ALECAC">Auto Charge</label>
    <input type="radio" class="hideLabel" value="ALCETE" id="F_ALCETE" name="ItemType"><label for="F_ALCETE">One Time Charge</label>
    <input type="radio" class="hideLabel" value="ALCINVTR" id="F_ALCINVTR" name="ItemType"><label for="F_ALCINVTR">Inventory Transaction</label>
  </span>
  `;
  var form = document.createElement("form");
  form.id='filterButtons';
  form.innerHTML = btn;
  document.getElementById("filterButton").prepend(form);
};
AddFilters();

jQuery("#filterButtons input").on("change",()=>{FilterView()});

var historyPane = `<div id='nfyHistory' class='hide'><div id='nfyHistoryHead' title="Temporarily saved in THIS BROWSER; Available until you clear the cache!!"><span>History</span><span class='icon'></span></div><div id='nfyHistoryBody'></div></div>`;
jQuery("#subjFrame").append(jQuery(historyPane));
jQuery("#nfyHistoryHead").on("click",()=>{jQuery("#nfyHistory").toggleClass('hide')});

function now(){return new Date().toISOString();}
function fDate(d=new Date()){return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Dubai",hour12:true,dateStyle:'short',timeStyle:'short'}).format(new Date(d));}
function isOlder(date,n) {
    let dDays = (new Date().getTime() - new Date(date).getTime()) / (1000 * 3600 * 24);
    return dDays > n;
}

let nfyList = JSON.parse(localStorage.getItem('nfyList')) || {};
let nfyData = JSON.parse(localStorage.getItem('nfyData')) || {};

function storeData(){
localStorage.setItem('nfyList', JSON.stringify(nfyList));
localStorage.setItem('nfyData', JSON.stringify(nfyData));
}

function showHistoryMsg(t) {
  // console.log(t);
  msgFrameReset();
  jQuery(".subjRow,#nfyHistoryBody>p").removeClass("selSubjRow");
  jQuery(t).addClass("selSubjRow");
  var msgLoad = jQuery('#msgLoader');
  var div = jQuery('#msgBody');
  var NId = t.getAttribute('data-nid');
  var bodyData = nfyData[NId];
  if(bodyData){div.html(bodyData.bodyData);}else{div.html('Missing Data');}
  div.fadeIn();
  renderGraph();
}

function getNfyData(NId) {
  let targetUrl = `getNtfMsg.do?NtfId=${NId}`;
  let response = null;
  let request = jQuery.ajax({url: targetUrl,dataType: 'xml',async: false,success: function(data, status, xhr) {response = data;}});
  return response;
}

document.querySelectorAll('.subjRow').forEach((row, index) => {
let rowId = row.querySelector('input[name="rowId"]').value;
let oraseq = row.querySelector(`input[name="value(Oraseq${rowId})"]`).value;
let ItemType = row.querySelector(`input[name="value(ItemType${rowId})"]`).value || null;
let ItemKey = row.querySelector(`input[name="value(ItemKey${rowId})"]`).value || null;
let NotiType = row.querySelector(`input[name="value(NotificationType${rowId})"]`).value || null;
let NotiId = row.querySelector(`input[name="value(NotificationId${rowId})"]`).value || null;
let AccessKey = row.querySelector(`input[name="value(AccessKey${rowId})"]`).value || null;
let subjCol = row.querySelector('.subjCol').innerText;

row.classList.add(NotiType, ItemType);

let exEntry = nfyList[`Oraseq${oraseq}`];

if (exEntry) 
{exEntry.visibility = true;exEntry.lastUpdate = now();}
else {
nfyList[`Oraseq${oraseq}`] = {
  Oraseq: parseInt(oraseq, 10),
  rowId: parseInt(rowId, 10),
  ItemType: ItemType,
  ItemKey: ItemKey,
  NotificationType: NotiType,
  NotificationId: NotiId,
  AccessKey: AccessKey,
  subjCol: subjCol,
  addedOn: now(),
  visibility: true,
  lastUpdate: now()
  };
// Now data will be saved on each jQuery.ajax load
}
});

// Update visibility
Object.keys(nfyList).forEach(key => {
if(!document.querySelector(`input[value="${nfyList[key].Oraseq}"]`)) {
  if(nfyList[key].visibility){nfyList[key].visibility = false;nfyList[key].lastUpdate = now();}
}
});

var retainDays=180; //6 months
// Remove old entries
Object.keys(nfyList).forEach(key => {
if (nfyList[key].visibility === false && (isOlder(nfyList[key].addedOn,retainDays) || isOlder(nfyList[key].lastUpdate,retainDays))){
  delete nfyData[nfyList[key].NotificationId];
  delete nfyList[key];
  }
});

storeData();

let nfyHistoryBody = jQuery('#nfyHistoryBody');
let hItems = [];

Object.keys(nfyList).forEach(key => {
  if (nfyList[key].visibility === false) {hItems.push({key:key, addedOn:nfyList[key].addedOn});}
});

// Sort descending order
hItems.sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn));

hItems.forEach(item => {
    let l = nfyList[item.key]; 
    // onclick="showHistoryMsg(${l.NotificationId},this)" 
    let h = `<p data-nid="${l.NotificationId}" data-addedOn="${l.addedOn}" data-lastUpdate="${l.lastUpdate}" class="${l.NotificationType} ${l.ItemType}"><span class="ItemType"> - </span> Added on<span class="date">${fDate(l.addedOn)}</span><span class="subject">${l.subjCol}</span><span class="approval ${l.AppovalStatus}"><span class="date">${fDate(l.lastUpdate)}</span>${l.AppovalComment || ''}</span></p>`;
    nfyHistoryBody.append(jQuery(h));
});
jQuery('#nfyHistoryBody>p').on("click",(e)=>{showHistoryMsg(e.currentTarget)});

function updateRec(){
document.querySelectorAll('.subjRow').forEach((row, i) => {
  var statusApp = row.querySelector('.apprStatus');
  var statusRej = row.querySelector('.rejStatus');
  if(statusApp || statusRej || false){
  let rId = row.querySelector('input[name="rowId"]').value;
  let oraseq = row.querySelector(`input[name="value(Oraseq${rId})"]`).value;
  let NotiId = row.querySelector(`input[name="value(NotificationId${rId})"]`).value || null;
  let SApprove = row.querySelector(`input[name="value(Approve${rId})"]`).value.toLowerCase()=='on' || false;
  let SReject = row.querySelector(`input[name="value(Reject${rId})"]`).value.toLowerCase()=='on' || false;
  let Cmnt = row.querySelector(`input[name="value(Comment${rId})"]`).value || null;

  let nfyListEntry = nfyList[`Oraseq${oraseq}`];
  nfyListEntry.AppovalStatus = (SApprove) && (!SReject);
  nfyListEntry.AppovalComment = Cmnt;
  nfyListEntry.lastUpdate= now();

  let NfyData = jQuery(getNfyData(NotiId));
  let bData = NfyData.find('FullBody').text() || null;
  let UserCmt = NfyData.find('UserComments').text() || null;
  nfyData[NotiId] = {bodyData: bData,UserComments:UserCmt,updated:now()};

  storeData();
}});
}
var tFun=PostForm;
window.PostForm=function(a,b,c,d){updateRec();/*alert("!");*/tFun(a,b,c,d);}

var styles = `
.hidden{display:none !important;}
.subjRow:hover{-webkit-touch-callout:none !important; -webkit-user-select:none !important; user-select:auto !important;}
.chbxCol{padding-left:10px;}
.dateRow{display:none;}
.chBox.subjChBox{width:18px; height:18px;cursor:cell; box-shadow:1px 2px 0px 0px;}
.apprStatus, .rejStatus{cursor:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAA5VJREFUSEu9V01IVFEUPs71zSKamIFgFi6M7EdqJBFNECywGhdiIEFWZlS0qdRyI0ZIhkTixn6sIKJC+zMII3GRlVCCYIYNWNGfoYsWQuDQVMS8rsR3uXe48xxn3kxOdzPz3v35zvnuOd85L4NSH36X190bmgmeIqILyR6TkeQGDxEVEVGu4TQ2VrTs2j01Pul4OzB22wyb9UQ0a/c8u8ANjLHaJctdq3JK1rlXFOTMAWBrban4fdoz7HjW1f89NBNcaRc8EXCDy+s+vaWucln2pnzH6mzXn0/ToczpFwEBqN4BuL/1zjjnHGzYGgsCG07j1vqKoppDnfsFGEAb1xztxalm2HwJqjGPZ0n1XluIclEsYA9jbLCydU8BqLzWeDNz4tHoK86530KjjzF2g3N+kogGkwHF2nnAjLExBXqiuOlHqlGbyJAoYNCLSIWnErQ6FW8SgVo99udXlTzGnaYbNAoYFNcNdRQiYh+29DSmIgp2PFVrFNVWbyEUaR0CGHd75El7zf/yNkI1aD4/eSVf3m0pEb1Jq7synXwur3v47GjH0mM5hwOa+jRAJMyw2Q5DwIoUD/FMRGoeGp1lOI1mOV9vOI2LSmgWihVQLe538/EddHlbM8QeCiREhHPeA43mnB+AcaGZoEovod2YJ6L3KBpqnTIKUqutn0dgXGAHc3xQXgL49+zPAVmFsqBamJeGCk3XxEYZrmu3nzF2Ru6pjwuMaiStHpMMKHn0EdFXnVL9WohIyWlEZpU4oYwG+kbKAezLryqZANVdZU3QZFjpwaFm2OyGlYrqX99Cn/GfiMpALdiQWp0LjyUj4qrk/kjhUDrx/NwDCvSN5AFY0KJFtaqpyGUUdv03C55q74Gtij9YwFAZofbhncfldX85eL/FfX1nWxB1W+SxxZryNOhzJIAVq0q5fF1TV1+j7mqRvWipHEugItUJk50fL1WnQUSETug043qigFES0c5oQfbPXuvFZ6Dt3l2ZflGNgAgAKBh6KH1RqugqheCMCioVjNYORPTKiwGuejakqQSNaipi9VxChRS4bFuT6USE8ehMtU5mXtO/UJcpNiMgQDOSXjZ80OYhLZdFjqJIKFHJ215cCC8xZJndEKvaxeurhexZD4LkTY68C0LFcLje5OMuLYZaO9NIuCRq6LFQVCIYgC8Idbg14OAdjNKYifs9ZQdYYfgNp7Fvjs+thZc6MLyXVafbrur9BfrqT9HR1J6NAAAAAElFTkSuQmCC'),auto !important;}
.statColField::before{font:normal normal normal 1.3em FontAwesome; padding-right:5px;}
.unrStatus>.statColField::before{content:'📔 '; /*content:'\\f02d ';*/}
.readStatus>.statColField::before{content:'📖 '; /*content:' ';*/}
.apprStatus>.statColField::before{content:'✔ ';}
.rejStatus>.statColField::before{content:'❌  '}
.subjCol>p>font::before{margin:5px; padding-right:5px; border-right:2px solid darkblue;}
.subjCol:hover>p>font[color='blue'] , .subjCol:hover > p > font[color='purple'] , .subjCol:hover > p > font[color='green']{width:auto;white-space:normal;}
.subjCol>p>font[color='blue'] , .subjCol > p > font[color='purple'], .subjCol > p > font[color='green']{width:83px; text-overflow:ellipsis; white-space:nowrap;overflow:hidden; display:inline-block; font-size:13px; font-weight:bold;}
.subjCol>p>b>font > br{display:none !important;}
.subjCol>p>b>font[color='red']{display:inline-block; font-weight:lighter;}
.typeIcon{border-radius:16px;}
.typeIcon.Approval{background-color:#b71a1a !important;}
.typeIcon.FYI{background-color:#333333 !important;}

#subjFrame{float:left; width:33%;}
#nfyHistory{border-top:2px solid #4285f4; margin-top:10px; background:#e2edff;}
#nfyHistory>div{margin:5px;display:flex;flex-wrap:nowrap;font-weight:bold;justify-content:space-between;border-bottom:1px solid #dbdbdb;padding-bottom:4px;}
#nfyHistoryHead{cursor:pointer;position: sticky;top: 84px;background-color: #e2edff;}
#nfyHistoryBody{flex-direction:column;}
#nfyHistoryBody>p{margin:5px;font-weight:normal;cursor:pointer;}
#nfyHistoryBody>p.selSubjRow{background: white;}
#nfyHistory>div>span.icon::before{content:'🔼';}
#nfyHistory.hide>div>span.icon::before{content:'🔽';}
#nfyHistory.hide>#nfyHistoryBody{display:none;}
.subjRow{padding:6px 0 !important;}
.subjCol>p{display:contents;}
.subjRow .subjCol::before{
border:1px solid #e3dada;
border-radius:8px;
padding:0px 6px;
font-weight:bold;
background-color:#efefef;
}
.subjRow.ALCREQAP .subjCol::before{content:'PR';}
.subjRow.ALCPOA .subjCol::before{content:'PO';}
.subjRow.ALCPOCOA .subjCol::before{content:'PO Change Order';}
.subjRow.ALCSCRFP .subjCol::before{content:'RFP';}
.subjRow.ALECAC .subjCol::before{content:'Auto Charge';}
.subjRow.ALCETE .subjCol::before{content:'One Time Charge';}
.subjRow.ALCINVTR .subjCol::before{content:'Inventory Transaction';}

.ItemType{padding:0px 5px;border:1px solid #c5c5c5;display:inline-block;}
.ItemType::before{color:blue;}
p.Approval .ItemType::after{content:'Approval';color:red;}
p.FYI .ItemType::after{content:'Info';color:grey;}
p.ALCREQAP .ItemType::before{content:'PR';}
p.ALCPOA .ItemType::before{content:'PO';}
p.ALCPOCOA .ItemType::before{content:'PO Change Order';}
p.ALCSCRFP .ItemType::before{content:'RFP';}
p.ALECAC .ItemType::before{content:'Auto Charge';}
p.ALCETE .ItemType::before{content:'One Time Charge';}
p.ALCINVTR .ItemType::before{content:'Inventory Transaction';}

p:hover>span.subject{font-weight:bold;}
span.date{padding:0px 5px;color:#9d2525;}
span.approval.undefined{display:none;}
span.approval.true{color:green;display:block;}
span.approval.false{color:red;display:block;}
span.approval.false::before{content:'❌ Rejected on';}
span.approval.true::before{content:'✔ Approved on';}
p.FYI span.approval.true::before{content:'✔ Closed on';}

button{flex:0 !important;}
input[type=checkbox]{position:initial !important;opacity:1 !important;}

#filterButtons *{color:white !important;}
#filterButtons{border:1px solid; border-radius:23px;  background:#2168df; box-shadow:1px 1px 4px 1px grey; text-transform:initial;}
#filterButtons>span{padding:8px;}
#filterButtons input, #filterButtons input.hideLabel + label, input[type=radio] + label:before{display:none !important;}
#filterButtons input::before{display:none !important;}
#filterButtons label{cursor:pointer; border:1px solid; border-radius:10px; padding:5px !important; margin:2px; display:inline;}
#filterButtons input:checked + label, #filterButtons label:hover{background-color:white;color:#dd0b0b !important;}

#nfyHistory.hide #HistoryBtn{display:none !important;}

#nfyHistoryHead * {vertical-align: middle;font-size: 12px !important;}
#HistoryBtn label {padding: 5px 10px !important;cursor: pointer;display: inline !important;}
#HistoryBtn label:before {display: none !important;}

#HistoryBtn{background: white;border-radius: 12px;}
#HistoryBtn input{display:none;}

.slider {
  width: 118px;
  display: inline-block;
  height: 100%;
  border: 0px solid;
  border-radius: 12px;
  position: relative;
  margin-right: 10px;
  background: #ccc;
}
.slider:before {
  position: absolute;
  padding: 0px 6px;
  margin: 1px 3px;
  border: 0px solid;
  border-radius: 12px;
  background: #4285f4;
  color: white;
}
input + label .slider:before {content: "Added Date";}
input:checked + label .slider:before {content: "Actioned Date";right:0;}
#historyFilter + label:after {
  content: "";
  font-family: 'FontAwesome';
  width: 12px;
  height: 12px;
  border: 1px solid;
  display: inline-block;
}
#historyFilter:checked + label:after {content:"\\f00c";}
#searchReset {
    position: absolute;
    border: none;
    display: block;
    width: 25px;
    height: 25px;
    font-size: 15px;
    border-radius: 50%;
    top: -4px;
    bottom: 0;
    right: 3px;
    margin: auto;
    background: #ddd;
    cursor: pointer;
    transition: .1s;
    text-align: center;
    line-height: 25px;
    color: #585858;
}
#search:placeholder-shown + #searchReset{
  opacity: 0;
  pointer-events: none;
}

.filterExclude{display:none !important;}

.daysCount {
  font-size: 10px;
  box-shadow: .5px .5px #777;
  padding: 2px;
  position: absolute;
  left: -12px;
  border-radius: 50%;
  aspect-ratio: 1;
  min-width: 16px;
  max-width: 22px;
  background: #ebf7ff;
  color: #00f;
  display: flex;
  justify-content: center;
  align-items: center;
}
.typeCol{position: relative;}
.typeIcon{position: absolute;}
`;
var s = document.createElement("style");
s.innerHTML = styles;
document.head.appendChild(s);

function AddBtn() {
  var btn = `<input type="button" id="approveSel" class="hidden" value="Approve/Close" onclick="respond('Approve')" style="background-color:#5dcd5d;border:1px solid #5dcd5d;border-radius:4px;min-height:28px;font-weight:bold;cursor:pointer;">`;
  jQuery('#subjHeader .typeCol').prepend(jQuery(btn));
};
AddBtn();

jQuery('.chBox').on('change',(e)=>{let c=jQuery('.subjChBox:checked').length;if(c>0){jQuery('#approveSel').removeClass('hidden')}else{jQuery('#approveSel').addClass('hidden')};})

var hBtn = `<span id="HistoryBtn" class="noTextSel"><span><input id="historySort" type="checkbox" name="historySort"><label for="historySort">Sortby <span class="slider"></span></label></span><span><input id="historyFilter" type="checkbox" name="historyFilter"><label for="historyFilter">Apply Filter </label></span></span>`;
jQuery(hBtn).insertAfter('#nfyHistoryHead > span:nth-child(1)');

function SortElements(attribute) {
  let elements = document.querySelectorAll('p[data-' + attribute + ']');
  let elementsArray = Array.from(elements);
  
  elementsArray.sort((a, b) => {
  let dateA = new Date(a.getAttribute('data-' + attribute));
  let dateB = new Date(b.getAttribute('data-' + attribute));
  return dateB - dateA; // For descending order
  });
  
  let parent = elementsArray[0].parentNode;
  elementsArray.forEach(element => {
    parent.appendChild(element);
  });
}

function filterSortHistory(){
  let NotificationType = jQuery('#filterButtons input[name=NotificationType]:checked').val();
  let ItemType = jQuery('#filterButtons input[name=ItemType]:checked').val();
  console.log('sort History');
  //sort
  if(jQuery('#historySort').is(":checked")){SortElements("lastUpdate")}else{SortElements("addedOn")};
  //change visibility
  document.querySelectorAll('#nfyHistoryBody > p').forEach(function(r){
    if(jQuery('#historyFilter').is(":checked")){
    let cl=r.classList;
    cl.remove('hidden');
    if((Includes(cl,NotificationType) || NotificationType == "All") && (Includes(cl,ItemType) || ItemType == "All")){}else{
    cl.add('hidden');}
    }else{r.classList.remove('hidden');}
  });

}

function resetFilterButtons(){
  document.querySelectorAll('#filterButtons input').forEach(el => {
    let v = el.value;
    let c = jQuery(`.subjRow.${v}`).length;
    if(v!='All'){
      if(jQuery('#historyFilter').is(":checked")){c += jQuery(`#nfyHistoryBody p.${v}`).length};
      if(c>0){el.classList.remove("hideLabel")}else{el.classList.add("hideLabel");if(jQuery(el).is(":checked")){jQuery(el).parent().children()[0].checked=true};};
    }
  });
}
resetFilterButtons();

jQuery('#HistoryBtn input').on('change',()=>{filterSortHistory();resetFilterButtons();})

function selectVisible(){
var allCB = jQuery('.subjChBox');
var visibleCB = allCB.not(jQuery('.subjRow.hidden .subjChBox, .subjRow.filterExclude .subjChBox'));
allCB.prop('checked', false);
if(jQuery('#SelectMain').is(":checked")){visibleCB.prop('checked', true);}
}

jQuery('#SelectMain')
  .removeAttr("onclick")
  .on("click",()=>selectVisible())
  .on("change",()=>selectVisible());

function getChildren(node) {
  const ret = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    ret.push(child, ...getChildren(child));
  }
  return ret;
}
function getTextContent(el){
let text = '';
for (const child of getChildren(el)) {
  if (child.nodeType === 1) {
    const before = window.getComputedStyle(child, '::before').getPropertyValue('content');
    if (before && before !== 'none') {
      text += before.replace(/^['"]/, '').replace(/['"]$/, '');
    }
  } else if (child.nodeType === 3) {
    text += child.textContent;
  }
}
return text.replace(/\s+/g, ' ').trim();
}

var hBtn = `<th style="min-width:375px;position:relative;border:none;"><form onsubmit="return false;"><input id="search" type="text" placeholder="Type here to quick filter all items" autocomplete="off" style="width:100%;height:30px;padding-right:20px;box-sizing:border-box;font-size:medium;"><span type="reset" id="searchReset">x</span></form></th>`;
jQuery(hBtn).insertAfter('.cmicBannerPageText');
jQuery('#search').on('input propertychange paste reset', ()=>{searchBox()});
jQuery('#searchReset').on('click', (e)=>{jQuery('#search')[0].value='';searchBox();});

function searchBox(){
  let v = jQuery('#search')[0].value.toLowerCase();
  var itms = document.querySelectorAll('.subjRow, #nfyHistoryBody>p');
  jQuery("#nfyHistory").removeClass('hide')
  // console.log('search: ' + v);
  itms.forEach((el)=>{
    if(v==""){el.classList.remove("filterExclude")}
    else{
      let s=getTextContent(el).toLowerCase();
      let r = s.include(v);
      // console.log('search: ' + v + ' from: ' + s);
      // console.log('result: ' + r);
      if(r){el.classList.remove("filterExclude")}else{el.classList.add("filterExclude")};
    }
  });
}

var el=document.querySelectorAll('.dateRow, .subjRow .typeCol');
var d = 0;
el.forEach((e) => {
  // console.log(e.classList);
  if (e.classList.contains('dateRow')){
    d = parseInt(((new Date())-(new Date(e.innerText.trim())))/(1000*60*60*24));
  }else{
  if(d>1){
    e.append(jQuery(`<span class="daysCount" title="Days">${d}</span>`)[0])
  };
  }
});

// Function to capture jQuery.ajax calls and responses
function captureAjax() {
  var originalAjax = jQuery.ajax;
  jQuery.ajax = function(settings) {
    //console.log('AJAX call settings:', settings);
    var originalSuccess = settings.success;
    var originalError = settings.error;
    settings.success = function(data, textStatus, jqXHR) {
      //console.log('AJAX call success response:', data);
      if (originalSuccess) {
        originalSuccess(data, textStatus, jqXHR);
        if(settings.url=='getNtfMsg.do'){updateHis(settings.data.split('=')[1],data)};
      }
    };
    settings.error = function(jqXHR, textStatus, errorThrown) {
      //console.log('AJAX call error response:', errorThrown);
      if (originalError) {
        originalError(jqXHR, textStatus, errorThrown);
      }
    };
    return originalAjax(settings);
  };
}
captureAjax();
function updateHis(n,data){
  // console.log(n, data);
  let d = jQuery(data);
  let bData = d.find('FullBody').text() || null;
  let Uc = d.find('UserComments').text() || null;
  nfyData[n] = {bodyData: bData,UserComments:Uc,updated:now()};
  storeData();
  renderGraph();
}


function parseAmount(s) {
  var t = document.querySelector(s);
  t = t==null?'0':t.innerText;
  return parseFloat(t.replace(/,/g, ''));
}

function renderGraph() {
  // console.log('render graph');
  if(jQuery("#msgChart").length>0){jQuery("#msgChart").remove()};
  let el = document.querySelectorAll('#msgBody > div.cmicTableLeftHeader'); 
  for (let i = 0; i < el.length; i++) {
    let e = el[i];
    if (e.innerText.toLowerCase().search('payment certificate') >= 0) {
      var contractSumEl = document.querySelectorAll("#msgBody > table.cmicExplorerGridTable")[1].querySelector("tbody > tr:nth-child(10) > td:nth-child(4)");
      var contractSum = contractSumEl==null?0:parseFloat(contractSumEl.innerText.replace(/,/g, ''));
      
      var PreviousWorkDonePaid = parseAmount("#reviewersTable > tbody > tr.subtotal > td:nth-child(3)");
      var ThisWorkDonePaid = parseAmount("#reviewersTable > tbody > tr.subtotal > td:nth-child(4)");
      var advancePaid = parseAmount("#reviewersTable > tbody > tr:nth-child(6) > td:nth-child(2)");
      var advanceRecovered = parseAmount("#reviewersTable > tbody > tr:nth-child(7) > td:nth-child(2)");
      var advanceCurrent = advancePaid + advanceRecovered;
      var RetentionHeld = parseAmount("#reviewersTable > tbody > tr:nth-child(8) > td:nth-child(2)");
      var RetentionRelease = parseAmount("#reviewersTable > tbody > tr:nth-child(1) > td:nth-child(2)");
      var RetentionCurrent = Math.abs(RetentionHeld + RetentionRelease);
      
      console.log('contractSum','PreviousWorkDonePaid','ThisWorkDonePaid','advanceCurrent','RetentionCurrent');
      console.log(contractSum,PreviousWorkDonePaid,ThisWorkDonePaid,advanceCurrent,RetentionCurrent);
      
      var chart = `<div id="msgChart" style="padding:5px 20px;"><canvas id="chartCanvas" width="${jQuery('#msgBody').width() - 17}" height="75"></canvas></div>`;
      jQuery(chart).insertBefore('#msgBody');

      drawCanvas(PreviousWorkDonePaid/contractSum,ThisWorkDonePaid/contractSum,advanceCurrent/contractSum,RetentionCurrent/contractSum);
      
      break;
    }
  }
}

function drawCanvas(preVal,curVal,advVal,retVal){
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    //clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate Values
    var exceeded = false;
    var bgColor = 'white';
    var revTotal = preVal+curVal;
    if (revTotal>1){
      exceeded = true;
      bgColor = 'red';
      preVal /= revTotal;
      curVal /= revTotal;
      revTotal = 1/revTotal;
    }
    else
    {revTotal = 1;}

    // Set common styles
    ctx.font = '12px Arial';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = 'black';

    var barHeight = 18;
    var margin = 5;

    // Function to draw a rectangle with text
    function drawRect(x, y, width, height, color, text) {
        if(width==0){return false;}
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = 'white';
        ctx.fillText(text, x + 5, y + height / 2 + 1);
    }
    // Draw the chart elements
    drawRect(15, margin, (canvas.width -30) * revTotal , barHeight * 3 + margin * 2 + 2, bgColor, ''); // Background
    // WorkDone section
    drawRect(16, margin + 1, (canvas.width - 32) * preVal, barHeight, 'orange', 'Previous');
    drawRect(16 + (canvas.width - 32) * preVal, margin + 1, (canvas.width - 32) * curVal, barHeight, 'green', 'Current');
    // Advance section
    drawRect(16, barHeight * 1 + margin * 2, (canvas.width - 32) * advVal, barHeight, 'blue', 'Advance');
    // Retention section
    drawRect(16, barHeight * 2 + margin * 3, (canvas.width - 32) * retVal, barHeight, 'pink', 'Retention');
}

