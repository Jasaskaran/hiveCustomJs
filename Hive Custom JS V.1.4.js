console.log("Hive Custom Script V1.4 - ymahendrarajah@alec.ae");

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
  </span>
  `;
  var form = document.createElement("form");
  form.id='filterButtons';
  form.innerHTML = btn;
  document.getElementById("filterButton").prepend(form);
};
AddFilters();

jQuery("#filterButtons input").on("change",()=>{FilterView()});

var hBtn = `<span id="HistoryBtn" class="noTextSel"><span><input id="historySort" type="checkbox" name="historySort"><label for="historySort">Sortby <span class="slider"></span></label></span><span><input id="historyFilter" type="checkbox" name="historyFilter"><label for="historyFilter">Apply Filter </label></span></span>`;
var historyPane = `<div id='nfyHistory' class='hide'><div id='nfyHistoryHead' onclick="showHideHistory()" title="Temporarily saved in THIS BROWSER; Available until you clear the cache!!"><span>History</span>${hBtn}<span class='icon'></span></div><div id='nfyHistoryBody'></div></div>`;
jQuery("#subjFrame").append(jQuery(historyPane));

function showHideHistory(){jQuery("#nfyHistory").toggleClass('hide');}
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

function showHistoryMsg(NId) {
  msgFrameReset();
  var msgLoad = jQuery('#msgLoader');
  var div = jQuery('#msgBody');
  var bodyData = nfyData[NId];
  if(bodyData){div.html(bodyData.bodyData);}else{div.html('Missing Data');}
  div.fadeIn();
}

function getNfyData(NId) {
  let targetUrl = `getNtfMsg.do?NtfId=${NId}`;
  let response = null;
  let request = jQuery.ajax({url: targetUrl,dataType: 'xml',async: false,success: function(data, status, xhr) {response = data;}});
  return response;
}

showLoading();
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
let Nd = jQuery(getNfyData(NotiId));
let bData = Nd.find('FullBody').text() || null;
let Uc = Nd.find('UserComments').text() || null;
nfyData[NotiId] = {bodyData: bData,UserComments:Uc};
}
});
hideLoading();

Object.keys(nfyList).forEach(key => {
if(!document.querySelector(`input[value="${nfyList[key].Oraseq}"]`)) {
  if(nfyList[key].visibility){nfyList[key].visibility = false;nfyList[key].lastUpdate = now();}
}
});

Object.keys(nfyList).forEach(key => {
if (nfyList[key].visibility === false && (isOlder(nfyList[key].addedOn,30) || isOlder(nfyList[key].lastUpdate,30))){
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

hItems.sort((a, b) => new Date(b.addedOn) - new Date(a.addedOn));

hItems.forEach(item => {
    let l = nfyList[item.key];
    let h = `<p onclick="showHistoryMsg(${l.NotificationId})" data-addedOn="${l.addedOn}" data-lastUpdate="${l.lastUpdate}" class="${l.NotificationType} ${l.ItemType}"><span class="ItemType"> - </span> Added on<span class="date">${fDate(l.addedOn)}</span><span class="subject">${l.subjCol}</span><span class="approval ${l.AppovalStatus}"><span class="date">${fDate(l.lastUpdate)}</span>${l.AppovalComment || ''}</span></p>`;
    nfyHistoryBody.append(jQuery(h));
});

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
  nfyData[NotiId] = {bodyData: bData,UserComments:UserCmt};

  storeData();
}});
}
var tFun=PostForm;
window.PostForm=function(a,b,c,d){updateRec();tFun(a,b,c,d);}

var styles = `
.hidden{display:none !important;}
.subjRow:hover{-webkit-touch-callout:none !important; -webkit-user-select:none !important; user-select:auto !important;}
.chbxCol{padding-left:10px;}
.dateRow{display:none;}
.chBox.subjChBox{width:18px; height:18px;cursor:cell; box-shadow:1px 2px 0px 0px;}
.apprStatus, .rejStatus{cursor:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAA5VJREFUSEu9V01IVFEUPs71zSKamIFgFi6M7EdqJBFNECywGhdiIEFWZlS0qdRyI0ZIhkTixn6sIKJC+zMII3GRlVCCYIYNWNGfoYsWQuDQVMS8rsR3uXe48xxn3kxOdzPz3v35zvnuOd85L4NSH36X190bmgmeIqILyR6TkeQGDxEVEVGu4TQ2VrTs2j01Pul4OzB22wyb9UQ0a/c8u8ANjLHaJctdq3JK1rlXFOTMAWBrban4fdoz7HjW1f89NBNcaRc8EXCDy+s+vaWucln2pnzH6mzXn0/ToczpFwEBqN4BuL/1zjjnHGzYGgsCG07j1vqKoppDnfsFGEAb1xztxalm2HwJqjGPZ0n1XluIclEsYA9jbLCydU8BqLzWeDNz4tHoK86530KjjzF2g3N+kogGkwHF2nnAjLExBXqiuOlHqlGbyJAoYNCLSIWnErQ6FW8SgVo99udXlTzGnaYbNAoYFNcNdRQiYh+29DSmIgp2PFVrFNVWbyEUaR0CGHd75El7zf/yNkI1aD4/eSVf3m0pEb1Jq7synXwur3v47GjH0mM5hwOa+jRAJMyw2Q5DwIoUD/FMRGoeGp1lOI1mOV9vOI2LSmgWihVQLe538/EddHlbM8QeCiREhHPeA43mnB+AcaGZoEovod2YJ6L3KBpqnTIKUqutn0dgXGAHc3xQXgL49+zPAVmFsqBamJeGCk3XxEYZrmu3nzF2Ru6pjwuMaiStHpMMKHn0EdFXnVL9WohIyWlEZpU4oYwG+kbKAezLryqZANVdZU3QZFjpwaFm2OyGlYrqX99Cn/GfiMpALdiQWp0LjyUj4qrk/kjhUDrx/NwDCvSN5AFY0KJFtaqpyGUUdv03C55q74Gtij9YwFAZofbhncfldX85eL/FfX1nWxB1W+SxxZryNOhzJIAVq0q5fF1TV1+j7mqRvWipHEugItUJk50fL1WnQUSETug043qigFES0c5oQfbPXuvFZ6Dt3l2ZflGNgAgAKBh6KH1RqugqheCMCioVjNYORPTKiwGuejakqQSNaipi9VxChRS4bFuT6USE8ehMtU5mXtO/UJcpNiMgQDOSXjZ80OYhLZdFjqJIKFHJ215cCC8xZJndEKvaxeurhexZD4LkTY68C0LFcLje5OMuLYZaO9NIuCRq6LFQVCIYgC8Idbg14OAdjNKYifs9ZQdYYfgNp7Fvjs+thZc6MLyXVafbrur9BfrqT9HR1J6NAAAAAElFTkSuQmCC'),auto !important;}
.statColField::before{font:normal normal normal 1.3em FontAwesome; padding-right:5px;}
.unrStatus > .statColField::before{content:'📔 ';}
.readStatus > .statColField::before{content:'📖 ';}
.apprStatus > .statColField::before{content:'✔ ';}
.rejStatus > .statColField::before{content:'❌  '}
.subjCol > p > font::before{margin:5px; padding-right:5px; border-right:2px solid darkblue;}
.subjCol:hover > p > font[color='blue'] , .subjCol:hover > p > font[color='purple'] , .subjCol:hover > p > font[color='green']{width:auto;white-space:normal;}
.subjCol > p > font[color='blue'] , .subjCol > p > font[color='purple'], .subjCol > p > font[color='green']{width:83px; text-overflow:ellipsis; white-space:nowrap;overflow:hidden; display:inline-block; font-size:13px; font-weight:bold;}
.subjCol > p > b > font > br{display:none !important;}
.subjCol > p > b > font[color='red']{display:inline-block; font-weight:lighter;}
.typeIcon{border-radius:16px;}
.typeIcon.Approval{background-color:#b71a1a !important;}
.typeIcon.FYI{background-color:#333333 !important;}

#subjFrame{float:left; width:33%;}
#nfyHistory{border-top:2px solid #4285f4; margin-top:10px; background:#e2edff;}
#nfyHistory > div{margin:5px;display:flex;flex-wrap:nowrap;font-weight:bold;justify-content:space-between;border-bottom:1px solid #dbdbdb;padding-bottom:4px;}
#nfyHistoryHead{cursor:pointer;}
#nfyHistoryBody{flex-direction:column;}
#nfyHistoryBody > p{margin:5px;font-weight:normal;cursor:pointer;}
#nfyHistory > div > span.icon::before{content:'🔼';}
#nfyHistory.hide > div > span.icon::before{content:'🔽';}
#nfyHistory.hide > #nfyHistoryBody{display:none;}
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

p:hover > span.subject{font-weight:bold;}
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
#filterButtons > span{padding:8px;}
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

function SortElements(attribute) {
  let elements = document.querySelectorAll('p[data-' + attribute + ']');
  let elementsArray = Array.from(elements);
  
  elementsArray.sort((a, b) => {
  let dateA = new Date(a.getAttribute('data-' + attribute));
  let dateB = new Date(b.getAttribute('data-' + attribute));
  return dateB - dateA;
  });
  
  let parent = elementsArray[0].parentNode;
  elementsArray.forEach(element => {
    parent.appendChild(element);
  });
}

function filterSortHistory(){
  let NotificationType = jQuery('#filterButtons input[name=NotificationType]:checked').val();
  let ItemType = jQuery('#filterButtons input[name=ItemType]:checked').val();
  if(jQuery('#historySort').is(":checked")){SortElements("lastUpdate")}else{SortElements("addedOn")};
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

//END



