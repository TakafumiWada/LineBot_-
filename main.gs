



//たくまニキの
//var CHANNEL_ACCESS_TOKEN = "P1mM6+GPGo+kJHm3cOYvjCa0YBW5A+Qx9v7OhOxvRnktNmt24D+A8U1YEVHail3At5xzgZIB0X6WcmpYcxxHytbrf1ijJHn1UQdkxfdG6QDzeuSDGWdg+/u1j0PJtH9Zz1vpEeHFYSWW6+x+Rfr+1QdB04t89/1O/w1cDnyilFU=";

//わでぃの
var CHANNEL_ACCESS_TOKEN ='06bcb/nKEKaW5W3rZp3h402SyqrJxy+PXVg59Vz3797WPu0y1enoRa/3n1tZMXPRztivTY0IJHbSuQjOBsv/dDr2NFADnBalsLnyAkbAu0PUOSI3TdE+prHpEAR9UCdTBy+gxLNpOn2aU8voHzh1pAdB04t89/1O/w1cDnyilFU=';

function init(){
  let cache = CacheService.getScriptCache();
  cache.put("type",0)
  cache.put("row",0) 
}

function getDataFromSpreadSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  //  A列の値を全部とってくる
  const range = sheet.getRange(1,1,sheet.getLastRow() ,4);
  console.log(range.getValues());
  return range.getValues()//[i][0]：ユーザー名、[i][1]：ユーザーID
}

function getSelectedThemeFromSpreadSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(1,6);
  console.log(range.getValue());
  return range.getValue()
}

function getKingFromSpreadSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(1,3);
  console.log(range.getValue());
  return range.getValue()
}

function getGroupIDFromSpreadSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange(1,7);
  console.log(range.getValue());
  return range.getValue()
}

function doPost(e) {
 console.log(e)
 var input = JSON.parse(e.postData.contents).events[0].message;
  var contents = e.postData.contents;
  var obj = JSON.parse(contents)
  var events = obj["events"];
  console.log(events)
  for(var i = 0; i < events.length; i++){
    if(events[i].type == "message"){
      reply_message(events[i],input);
    }
  }
}

function reply_message(e,input) {
  var user_id = e.source.userId;
  var display_name = getUserProfile(user_id);
  var group_id = e.source.groupId;
  var room_id = e.source.roomId;
  var ids = [user_id, group_id, room_id];
  let cache = CacheService.getScriptCache();
  var type=cache.get("type")
  var themeArray = getThemeFromSpreadSheet();//スプしから、お題を配列でもらってくる
  
  //  ***スプしからメンバーの名前の配列をとってくる(2次元配列)
  var memberDataArray = getDataFromSpreadSheet();
  var themeData=getSelectedThemeFromSpreadSheet()
  var kingData=getKingFromSpreadSheet()
 
    var replyMessage="エラー！↑のメッセージを見返して指示通りのメッセージを送ってね"
   
  switch(type) {
      case "0":
        if(input.type=='text'){
        //「参加」と送ったらシートに書き込み、名前を返す
        if(input.text.match('参加')){
          SpreadsheetApp.getActiveSheet().getRange(1,7).setValue(group_id)
          
          for(let i = 0; i < memberDataArray.length; i++) {
            if (memberDataArray[i][0] == display_name){
                replyMessage="既に参加しているよ！"
                break;
            }else{
                  var range_variable = 1
                  range_variable = Number(cache.get("row"))+1;
                  //スプしに書き込んでいく  
                  console.log(range_variable)
                  SpreadsheetApp.getActiveSheet().getRange(range_variable,1,1,2).setValues([[display_name,user_id]]);
                  //  cacheに書き込んでいく
                  cache.put("row",range_variable)
                  replyMessage=display_name
                  break;
                }
              /*  ***コチャの見極め***
              if (group_id == null) {
                //個人チャットの場合
                replyMessage="個人チャットだよ"
              }else{
                //  グループチャットの場合 
                //    送る内容
                replyMessage=display_name
                }
                */
              }
            }
            if(input.text.match('参加締め切り')){
              replyMessage = "参加確定しました！\n次はお題を選びます!\n"
              var userList="参加者一覧は以下の通りです！\n"
              for(let s = 0; s < memberDataArray.length; s++) {
                if(memberDataArray[s][0]!==""){
                   userList+="\n"+"・"+memberDataArray[s][0] 
                 }
              }
              replyMessage+=userList
              replyMessage+="\n\n次はお題を選びます!\n"
              //        スプしから取ってきたデータをmessageに貼り付ける
              for(var i = 0; i < themeArray.length ; i++) { 
                if(themeArray[i]!==""){
                  replyMessage =  replyMessage +"\n"+"・"+ themeArray[i];
                }
              }
              replyMessage =  replyMessage +"\n\n"+"上から選んだお題をメッセージで送ってください！"
              cache.put("type",1)
            }
          }
          break;
//***お題を選択
      case "1":
        if(input.type=='text'){
          for(var i = 0; i < themeArray.length ; i++) { 
            if(input.text.match(themeArray[i])){
              var userList="\n\n王様にしたい「参加者の名前」をメッセージで送ってね！\n参加者一覧は以下のようになっています！\n"
              for(let s = 0; s < memberDataArray.length; s++) {
                if(memberDataArray[s][0]!==""){
                   userList+="\n"+"・"+memberDataArray[s][0] 
                 }
              }
              cache.put("type",2)
              replyMessage="お題は「"+themeArray[i]+"」で決定！\n次は王様を決めます！"+userList
              SpreadsheetApp.getActiveSheet().getRange(1,6).setValue(themeArray[i])
              
              break;
            }else{
              replyMessage="そのお題はないよ！\n上のお題一覧から選んでね！"
            }
          }
          
        }
        break;
          
//***王様の選択
  case "2":
    replyMessage="名前が一致しないよ！\n上の参加者一覧から参照してね！"
    //ここまではいけてる
    
    if(input.type=='text'){
      for(var i = 0; i < memberDataArray.length ; i++) {
        if(input.text.match(memberDataArray[i][0])){
          replyMessage="王様は「"+memberDataArray[i][0]+"」で決定！\n個チャでメッセージを送るよ!そこで回答してね！"
          SpreadsheetApp.getActiveSheet().getRange(1,3).setValue(memberDataArray[i][0]) //getRangeは1スタートなので+1で調節する
          //コチャ送信
          for(var t = 0; t < memberDataArray.length ; t++) {
            if(memberDataArray[t][0]!==""){
             kingData=getKingFromSpreadSheet()
             pushPostToPerson("「"+kingData+"」が「"+themeData+"」の質問に対して、答えそうな言葉を当ててね！",memberDataArray[t][1])
            }
          }
          cache.put("type",3)
          break;
        }
      }
    }
    break;
//***コチャから回答を集める
   case "3":
     if(input.type=='text'){
       if (group_id == null) {
          //個人チャットの場合
          for(var i=0;i < memberDataArray.length ; i++){
            if(memberDataArray[i][1]==user_id){
              SpreadsheetApp.getActiveSheet().getRange(i+1,4).setValue(input.text)
              replyMessage="回答を受け付けたよ！"
              var groupID=getGroupIDFromSpreadSheet()
              pushPostToPerson("「"+memberDataArray[i][0]+"」からの回答を受け付けたよ！",groupID)
              if(checkAllAnswerAtGroup(memberDataArray)){
                pushPostToPerson("全員の回答を受け付けたよ！\n「回答表示」とメッセージを送ると王様以外の回答が見れるよ！",groupID)
                cache.put("type",4)
              }
              
            }
          }
       }
       else
       {
         //  グループチャットの場合 
         replyMessage="まだ回答が集まっていないよ！個チャで返信してね！"
       }
     }
   break;
   
//***結果発表！！！
   case "4":
     if(input.type=='text'){
        if(input.text.match('回答表示')){
          replyMessage="皆さん回答はこちら！！\n"
          for(var i=0;i < memberDataArray.length ; i++){
            if(memberDataArray[i][0]!=="" && memberDataArray[i][0]!==kingData){
              replyMessage+="\n"+memberDataArray[i][0]+"："+memberDataArray[i][3]
            }
          }
          replyMessage+="\n\n「答え合わせ」とメッセージを送って王様の回答を確認しよう！"
          cache.put("type",5)
        }
     }
     break;
     
   case "5":
     if(input.type=='text'){
        if(input.text.match('答え合わせ')){
          for(var i=0;i < memberDataArray.length ; i++){
            if(memberDataArray[i][0]==kingData){
              replyMessage=kingData+"の回答は...\n「"+memberDataArray[i][3]+"」です！！"
              cache.put("type",0)
            }
        }
     }
 }
}
 
 
//***LINEBOT返信メッセージ        
    var postData = {
      "replyToken" : e.replyToken,
      "messages" : [
        {
          "type" : "text",
          "text" : replyMessage
          //          ids.join(",")
        }
      ]
    };
  var options = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    "payload" : JSON.stringify(postData)
  };
  
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
  
    
   /* 
    //  ユーザーにDMを送る
    const line = require('@line/bot-sdk');
    
    const client = new line.Client({
      channelAccessToken: CHANNEL_ACCESS_TOKEN
    });
    
    const message = {
      type: 'text',
      text: 'Hello World!'
    };
    
    client.pushMessage(USER_ID, message)
    .then(() => {
          consele.log("うまくいった")
  })
  .catch((err) => {
         // error handling
         consele.log("エラーだよ")
});
*/
}

//****メソッド集****

//User_idを元にニックネームをとってくる関数
function getUserProfile(user_id){ 
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}

//スプしからお題をとってくる関数
function getThemeFromSpreadSheet(){
  const sheet = SpreadsheetApp.getActiveSheet();
  //  E列の値を全部とってくる
  const range = sheet.getRange(1,5,sheet.getLastRow() ,1);
  console.log(range.getValues());
  //  空白をとる
  var values = []
  console.log(range.getValues());
  for  (var i = 0; i< range.getValues().length ; i++){
    if(range.getValues()[i][0]!=""){
      values.push(range.getValues()[i]);
    }
  }
  console.log(values);
  return　values;
}

//個人チャットへの送信メソッド
function pushPostToPerson(body,user_id){
  const url = "https://api.line.me/v2/bot/message/push";
  // 指定のグルチャにPOSTする
  UrlFetchApp.fetch(url, {
    "headers": {
      "Content-Type": "application/json; charset=UTF-8",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN,
    },
    "method": "post",
    "payload": JSON.stringify({
      "to": user_id,
      "messages":[{
        "type": "text",
        "text": body,
      }]
    })
  })
}


//もし回答数が、メンバーの人数分集まってなかったら、まだ集まってない場合falseを返す
function checkAllAnswerAtGroup(memberDataArray){
 const sheet = SpreadsheetApp.getActiveSheet();
  //  D列の値を全部とってくる
  const range = sheet.getRange(1,4,sheet.getLastRow() ,1);
  //  空白をとる
  var values = []
  for  (var i = 0; i< range.getValues().length ; i++){
    if(range.getValues()[i]!=""){
      values.push(range.getValues()[i]);
    }
  }
  console.log(values);
  if (memberDataArray.length == values.length){
  console.log(true);
  return true;
  
  }else{
  console.log(false);
  return false;
  }
}
